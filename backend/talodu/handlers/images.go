package handlers

import (
	"fmt"
	"net/http"
	"os"
	"strings"
	"talodu/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// PUT /images/product/:imageId/primary - Set an image as primary

func SetPrimaryImage(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		imageID := c.Param("imageId")

		// Start transaction to ensure data consistency
		err := db.Transaction(func(tx *gorm.DB) error {
			// Find the image
			var image models.ProductImage
			if err := tx.First(&image, imageID).Error; err != nil {
				return fmt.Errorf("image not found")
			}

			// Unset current primary image for this product
			if err := tx.Model(&models.ProductImage{}).
				Where("product_id = ? AND is_primary = ?", image.ProductID, true).
				Update("is_primary", false).Error; err != nil {
				return fmt.Errorf("failed to unset existing primary image: %v", err)
			}

			// Set new primary image
			if err := tx.Model(&image).Update("is_primary", true).Error; err != nil {
				return fmt.Errorf("failed to set primary image: %v", err)
			}

			return nil
		})

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Primary image set successfully",
		})
	}
}

// PUT /images/product/:imageId/visibility - Toggle image visibility
func ToggleImageVisibility(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		imageID := c.Param("imageId")

		var image models.ProductImage
		if err := db.First(&image, imageID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Image not found"})
			return
		}

		newVisibility := !image.IsVisible
		if err := db.Model(&image).Update("is_visible", newVisibility).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update image visibility"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Image visibility updated",
			"image": gin.H{
				"id":        image.ID,
				"isVisible": newVisibility,
			},
		})
	}
}

// DELETE /images/product/:imageId - Delete a single image
func DeleteProductImage(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		imageID := c.Param("imageId")

		var image models.ProductImage
		if err := db.First(&image, imageID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Image not found"})
			return
		}

		// Delete the file from disk
		filePath := strings.TrimPrefix(image.URL, "/")
		if err := os.Remove(filePath); err != nil {
			fmt.Printf("Failed to delete file %s: %v\n", filePath, err)
		}

		// Delete from database
		if err := db.Delete(&image).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete image"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Image deleted successfully",
		})
	}
}
