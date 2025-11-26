package settings

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type SiteImage struct {
	gorm.Model
	URL       string `json:"url" gorm:"size:500"`
	AltText   string `json:"altText" gorm:"size:100"`
	IsVisible bool   `json:"isVisible" gorm:"default:true"`
	IsPrimary bool   `json:"isPrimary" gorm:"default:false"`
}

type SiteLogo struct {
	gorm.Model
	URL       string `json:"url" gorm:"size:500"`
	AltText   string `json:"altText" gorm:"size:100"`
	IsPrimary bool   `json:"isPrimary" gorm:"default:false"`
}

type DisplaySettings struct {
	ShowFeaturedProducts  bool   `json:"showFeaturedProducts"`
	ShowCarousel          bool   `json:"showCarousel"` // To show images carousel
	ShowRecentlyViewed    bool   `json:"showRecentlyViewed"`
	ShowAllProducts       bool   `json:"showAllProducts"`
	ShowAllImages         bool   `json:"showAllImages"`
	FeaturedProductsTitle string `json:"featuredProductsTitle"`
	FeaturedProductsCount int    `json:"featuredProductsCount"`
	RecentlyViewedCount   int    `json:"recentlyViewedCount"`
}

type GlobalSettings struct {
	ID                 uint           `json:"id" gorm:"primarykey"`
	SiteName           string         `json:"siteName" gorm:"not null;default:'Talodu'"`
	SiteDescription    string         `json:"siteDescription"`
	MaintenanceMode    bool           `json:"maintenanceMode" gorm:"default:false"`
	Currency           string         `json:"currency" gorm:"default:'USD'"`
	EmailNotifications bool           `json:"emailNotifications" gorm:"default:true"`
	DisplaySettings    datatypes.JSON `json:"displaySettings" gorm:"type:jsonb"`
	CreatedAt          time.Time      `json:"createdAt"`
	UpdatedAt          time.Time      `json:"updatedAt"`
	DeletedAt          gorm.DeletedAt `json:"deletedAt" gorm:"index"`
}

// GET /api/admin/settings
func GetGlobalSettings(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var settings GlobalSettings

		// Always get the first (and only) settings record
		if err := db.First(&settings).Error; err != nil {
			// If no settings exist, create default ones
			if err == gorm.ErrRecordNotFound {
				defaultSettings := createDefaultSettings()
				if err := db.Create(&defaultSettings).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create default settings: " + err.Error()})
					return
				}
				c.JSON(http.StatusOK, defaultSettings)
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch settings: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, settings)
	}
}

// POST /api/admin/settings
func UpdateGlobalSettings(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input struct {
			SiteName           string          `json:"siteName"`
			SiteDescription    string          `json:"siteDescription"`
			MaintenanceMode    bool            `json:"maintenanceMode"`
			Currency           string          `json:"currency"`
			EmailNotifications bool            `json:"emailNotifications"`
			DisplaySettings    json.RawMessage `json:"displaySettings"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Start transaction
		tx := db.Begin()
		defer func() {
			if r := recover(); r != nil {
				tx.Rollback()
			}
		}()

		var existingSettings GlobalSettings

		if err := tx.First(&existingSettings).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				// Create new settings if they don't exist
				defaultSettings := createDefaultSettings()
				if err := tx.Create(&defaultSettings).Error; err != nil {
					tx.Rollback()
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create settings"})
					return
				}
				existingSettings = defaultSettings
			} else {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch existing settings"})
				return
			}
		}

		// Update fields
		updates := make(map[string]interface{})

		if input.SiteName != "" {
			updates["site_name"] = input.SiteName
		}
		if input.SiteDescription != "" {
			updates["site_description"] = input.SiteDescription
		}
		updates["maintenance_mode"] = input.MaintenanceMode
		if input.Currency != "" {
			updates["currency"] = input.Currency
		}
		updates["email_notifications"] = input.EmailNotifications

		// Handle display settings
		if len(input.DisplaySettings) > 0 {
			// Validate the display settings JSON
			var displaySettings map[string]interface{}
			if err := json.Unmarshal(input.DisplaySettings, &displaySettings); err != nil {
				tx.Rollback()
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid display settings format"})
				return
			}
			updates["display_settings"] = input.DisplaySettings
		}

		// Update the settings
		if err := tx.Model(&existingSettings).Updates(updates).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update settings: " + err.Error()})
			return
		}

		// Commit transaction
		if err := tx.Commit().Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit settings update"})
			return
		}

		// Return updated settings
		var updatedSettings GlobalSettings
		if err := db.First(&updatedSettings).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch updated settings"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message":  "Settings updated successfully",
			"settings": updatedSettings,
		})
	}
}

// GetPublicSettings returns public-facing settings (no sensitive info)
func GetPublicSettings(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var settings GlobalSettings

		if err := db.First(&settings).Error; err != nil {
			// If no settings exist, return defaults
			defaultSettings := createDefaultSettings()

			var displaySettings DisplaySettings
			json.Unmarshal(defaultSettings.DisplaySettings, &displaySettings)

			c.JSON(http.StatusOK, gin.H{
				"siteName":        defaultSettings.SiteName,
				"siteDescription": defaultSettings.SiteDescription,
				"maintenanceMode": defaultSettings.MaintenanceMode,
				"currency":        defaultSettings.Currency,
				"displaySettings": displaySettings,
			})
			return
		}

		var displaySettings DisplaySettings
		json.Unmarshal(settings.DisplaySettings, &displaySettings)

		c.JSON(http.StatusOK, gin.H{
			"siteName":        settings.SiteName,
			"siteDescription": settings.SiteDescription,
			"maintenanceMode": settings.MaintenanceMode,
			"currency":        settings.Currency,
			"displaySettings": displaySettings,
		})
	}
}

func GetVisibleSiteImages(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var images []SiteImage
		if err := db.Where("is_visible = ?", true).Find(&images).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch visible site images: " + err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"images": images})
	}
}

// Site Images Management
// GET /api/admin/site-images
func GetSiteImages(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var images []SiteImage
		if err := db.Find(&images).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch site images"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"images": images})
	}
}

// POST /api/admin/site-images
func UploadSiteImages(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		form, err := c.MultipartForm()
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form"})
			return
		}

		files := form.File["images"]
		if len(files) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No files uploaded"})
			return
		}

		var uploadedImages []SiteImage

		for _, file := range files {
			// Generate unique filename
			filename := file.Filename
			// In production, you'd want to generate a unique name and save the file
			// For now, we'll just store the filename as the URL
			filePath := "/uploads/site/images/" + filename

			// Save the file (you'll need to implement this based on your file storage)
			if err := c.SaveUploadedFile(file, "."+filePath); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
				return
			}

			image := SiteImage{
				URL:       filePath,
				AltText:   filename,
				IsVisible: true,
				IsPrimary: false,
			}

			if err := db.Create(&image).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create image record"})
				return
			}

			uploadedImages = append(uploadedImages, image)
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Images uploaded successfully",
			"images":  uploadedImages,
		})
	}
}

// PUT /api/admin/site-images/:id/visibility
func ToggleSiteImageVisibility(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		imageID := c.Param("id")

		var image SiteImage
		if err := db.First(&image, imageID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Image not found"})
			return
		}

		image.IsVisible = !image.IsVisible

		if err := db.Save(&image).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update image visibility"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Image visibility updated",
			"image":   image,
		})
	}
}

// DELETE /api/admin/site-images/:id
func DeleteSiteImage(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		imageID := c.Param("id")

		var image SiteImage
		if err := db.First(&image, imageID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Image not found"})
			return
		}

		if err := db.Delete(&image).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete image"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Image deleted successfully"})
	}
}

// Site Logos Management
// GET /api/admin/site-logos
func GetSiteLogos(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var logos []SiteLogo
		if err := db.Find(&logos).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch site logos"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"logos": logos})
	}
}

// POST /api/admin/site-logos
func UploadSiteLogos(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		form, err := c.MultipartForm()
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form"})
			return
		}

		files := form.File["logos"]
		if len(files) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No files uploaded"})
			return
		}

		var uploadedLogos []SiteLogo

		for _, file := range files {
			// Generate unique filename
			filename := file.Filename
			filePath := "/uploads/site/logos/" + filename

			// Save the file
			if err := c.SaveUploadedFile(file, "."+filePath); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
				return
			}

			logo := SiteLogo{
				URL:       filePath,
				AltText:   filename,
				IsPrimary: false,
			}

			if err := db.Create(&logo).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create logo record"})
				return
			}

			uploadedLogos = append(uploadedLogos, logo)
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Logos uploaded successfully",
			"logos":   uploadedLogos,
		})
	}
}

// PUT /api/admin/site-logos/:id/primary
func SetPrimaryLogo(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		logoID := c.Param("id")

		// Start transaction
		tx := db.Begin()
		defer func() {
			if r := recover(); r != nil {
				tx.Rollback()
			}
		}()

		// Set all logos to non-primary
		if err := tx.Model(&SiteLogo{}).Where("1 = 1").Update("is_primary", false).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update logos"})
			return
		}

		// Set the selected logo as primary
		var logo SiteLogo
		if err := tx.First(&logo, logoID).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusNotFound, gin.H{"error": "Logo not found"})
			return
		}

		logo.IsPrimary = true
		if err := tx.Save(&logo).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to set primary logo"})
			return
		}

		if err := tx.Commit().Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Primary logo set successfully",
			"logo":    logo,
		})
	}
}

// DELETE /api/admin/site-logos/:id
func DeleteSiteLogo(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		logoID := c.Param("id")

		var logo SiteLogo
		if err := db.First(&logo, logoID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Logo not found"})
			return
		}

		if err := db.Delete(&logo).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete logo"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Logo deleted successfully"})
	}
}

// Helper function to create default settings
func createDefaultSettings() GlobalSettings {
	defaultDisplaySettings := DisplaySettings{
		ShowFeaturedProducts:  true,
		ShowCarousel:          true, // to show images carousel
		ShowRecentlyViewed:    true,
		ShowAllProducts:       true,
		ShowAllImages:         false,
		FeaturedProductsTitle: "Featured Products You'll Love",
		FeaturedProductsCount: 8,
		RecentlyViewedCount:   8,
	}

	displaySettingsJSON, _ := json.Marshal(defaultDisplaySettings)

	return GlobalSettings{
		SiteName:           "Talodu",
		SiteDescription:    "Your online super market",
		MaintenanceMode:    false,
		Currency:           "USD",
		EmailNotifications: true,
		DisplaySettings:    datatypes.JSON(displaySettingsJSON),
	}
}
