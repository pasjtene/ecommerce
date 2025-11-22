package settings

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type DisplaySettings struct {
	ShowFeaturedProducts  bool   `json:"showFeaturedProducts"`
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

type GlobalSettings1 struct {
	SiteName           string          `json:"siteName"`
	SiteDescription    string          `json:"siteDescription"`
	MaintenanceMode    bool            `json:"maintenanceMode"`
	Currency           string          `json:"currency"`
	EmailNotifications bool            `json:"emailNotifications"`
	DisplaySettings    DisplaySettings `json:"displaySettings"`
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

		//var existingSettings models.GlobalSettings
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
		//var updatedSettings models.GlobalSettings
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
				//"displaySettings": defaultSettings.DisplaySettings,
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
			//"displaySettings": settings.DisplaySettings,
			"displaySettings": displaySettings,
		})
	}
}

// Helper function to create default settings
func createDefaultSettings() GlobalSettings {
	defaultDisplaySettings := DisplaySettings{
		ShowFeaturedProducts:  true,
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
