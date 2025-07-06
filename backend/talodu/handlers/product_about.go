package handlers

import (
	"fmt"
	"net/http"
	"talodu/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GET /shops/:id/products
func GetProductDeAbouts(db *gorm.DB) gin.HandlerFunc {
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
		}

		//fmt.Printf(input.DetailText)

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Convert authUserID to uint regardless of original type
		productID, err := convertToUint(id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Invalid user ID",
			})
			return
		}

		//var detail1 models.ProductDetail
		about := models.ProductAbout{
			ProductID: productID,
			ItemOrder: input.ItemOrder,
			AboutText: input.AboutText,
		}

		if err := db.Create(&about).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create detail"})
			return
		}

		c.JSON(http.StatusCreated, about)
	}
}
