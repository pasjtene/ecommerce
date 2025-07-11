package handlers

import (
	"errors"
	"fmt"
	"net/http"
	"talodu/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GET /shops/:id/products
func GetProductDeAbouts1(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {

		productID := c.Param("id")

		var abouts []models.ProductAbout
		if err := db.Where("product_id = ?", productID).Order("item_order asc").Find(&abouts).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch details"})
			return
		}

		c.JSON(http.StatusOK, abouts)
	}
}

func GetProductAbouts(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		productID := c.Param("id")
		lang := c.Query("lang") // Optional language filter

		var abouts []models.ProductAbout
		query := db.Preload("Translations").Where("product_id = ?", productID).Order("item_order")

		if lang != "" {
			// Join with translations and filter by language
			query = query.Joins("JOIN product_about_translations ON product_abouts.id = product_about_translations.product_about_id").
				Where("product_about_translations.language = ?", lang)
		}

		if err := query.Find(&abouts).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch abouts"})
			return
		}

		c.JSON(http.StatusOK, abouts)
	}
}

func UpdateProductAboutOrder(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		productID := c.Param("id")

		var updates []struct {
			ID        int `json:"id" binding:"required"`
			ItemOrder int `json:"item_order" binding:"required,min=1"`
		}

		if err := c.ShouldBindJSON(&updates); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Verify all items belong to this product
		var existingIDs []int
		if err := db.Model(&models.ProductAbout{}).
			Where("product_id = ?", productID).
			Pluck("id", &existingIDs).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify items"})
			return
		}

		existingIDMap := make(map[int]bool)
		for _, id := range existingIDs {
			existingIDMap[id] = true
		}

		for _, update := range updates {
			if !existingIDMap[update.ID] {
				c.JSON(http.StatusBadRequest, gin.H{
					"error": fmt.Sprintf("Item %d does not belong to this product", update.ID),
				})
				return
			}
		}

		// Start transaction
		tx := db.Begin()
		defer func() {
			if r := recover(); r != nil {
				tx.Rollback()
			}
		}()

		for _, update := range updates {
			if err := tx.Model(&models.ProductAbout{}).
				Where("id = ?", update.ID).
				Update("item_order", update.ItemOrder).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{
					"error":   fmt.Sprintf("Failed to update order for item %d", update.ID),
					"details": err.Error(),
				})
				return
			}
		}

		if err := tx.Commit().Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Order updated successfully"})
	}
}

// POST /products/abouts/:id
func CreateProductAbout(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		//userID, err := convertToUint(authUserID)

		var input struct {
			ItemOrder int    `json:"item_order"`
			AboutText string `json:"about_text" binding:"required,min=1"`
			Language  string `json:"language" binding:"required,oneof=en fr es"`
		}

		//fmt.Printf(input.DetailText)

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Convert product to uint regardless of original type
		productID, err := convertToUint(id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Invalid product ID",
			})
			return
		}

		// Start transaction
		tx := db.Begin()
		defer func() {
			if r := recover(); r != nil {
				tx.Rollback()
			}
		}()

		//var detail1 models.ProductDetail
		about := models.ProductAbout{
			ProductID: productID,
			ItemOrder: input.ItemOrder,
			AboutText: input.AboutText,
		}

		if err := tx.Create(&about).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create detail"})
			return
		}

		// Create the default translation
		translation := models.ProductAboutTranslation{
			ProductAboutID: uint(about.ID),
			Language:       input.Language,
			AboutText:      input.AboutText,
		}

		if err := tx.Create(&translation).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create translation"})
			return
		}

		if err := tx.Commit().Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
			return
		}

		// Fetch the complete about entry with translations
		var result models.ProductAbout
		if err := db.Preload("Translations").First(&result, about.ID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch created about"})
			return
		}

		c.JSON(http.StatusCreated, result)
	}
}

// CreateProductAboutTranslation creates a new translation for a product about entry
func CreateProductAboutTranslation(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		productID := c.Param("id")
		aboutID := c.Param("aboutId")

		var input struct {
			Language  string `json:"language" binding:"required,max=5"`
			AboutText string `json:"about_text" binding:"required,max=255"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		// Verify product and about entry exist
		var productAbout models.ProductAbout
		if err := db.Where("id = ? AND product_id = ?", aboutID, productID).First(&productAbout).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product about entry not found"})
			return
		}

		//  Check if translation already exists for this language
		var existingTranslation models.ProductAboutTranslation
		if err := db.Where("product_about_id = ? AND language = ?", aboutID, input.Language).First(&existingTranslation).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "Translation already exists for this language"})
			return
		} else if !errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check existing translations"})
			return
		}

		// Convert product to uint regardless of original type
		paID, err := convertToUint(productAbout.ID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Invalid product ID",
			})
			return
		}

		// Create new translation
		newTranslation := models.ProductAboutTranslation{
			//ProductAboutID: productAbout.ID,
			ProductAboutID: paID,
			Language:       input.Language,
			AboutText:      input.AboutText,
		}

		if err := db.Create(&newTranslation).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create translation"})
			return
		}

		// Return success response
		c.JSON(http.StatusCreated, gin.H{
			"message":     "Translation created successfully",
			"translation": newTranslation,
		})
	}
}

// GetProductAboutTranslations retrieves all translations for a product about entry
func GetProductAboutTranslations(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		//  Parse input parameters
		productID := c.Param("id")
		aboutID := c.Param("aboutId")

		// Verify product and about entry exist
		var productAbout models.ProductAbout
		if err := db.Where("id = ? AND product_id = ?", aboutID, productID).First(&productAbout).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product about entry not found"})
			return
		}

		// Fetch all translations for this about entry
		var translations []models.ProductAboutTranslation
		if err := db.Where("product_about_id = ?", aboutID).Find(&translations).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch translations"})
			return
		}

		// Return translations
		c.JSON(http.StatusOK, gin.H{
			"translations": translations,
		})
	}
}

// UpdateProductAboutTranslation updates an existing translation for a product about entry
func UpdateProductAboutTranslation(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Parse input parameters
		productID := c.Param("id")
		aboutID := c.Param("aboutId")
		translationID := c.Param("translationId")

		// 2. Parse request body
		var input struct {
			AboutText string `json:"about_text" binding:"required,max=255"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// 3. Verify product, about entry, and translation exist
		var productAbout models.ProductAbout
		if err := db.Where("id = ? AND product_id = ?", aboutID, productID).First(&productAbout).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product about entry not found"})
			return
		}

		var translation models.ProductAboutTranslation
		if err := db.Where("id = ? AND product_about_id = ?", translationID, aboutID).First(&translation).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "Translation not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch translation"})
			}
			return
		}

		// 4. Update translation
		translation.AboutText = input.AboutText
		if err := db.Save(&translation).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update translation"})
			return
		}

		// 5. Return success response
		c.JSON(http.StatusOK, gin.H{
			"message":     "Translation updated successfully",
			"translation": translation,
		})
	}
}
