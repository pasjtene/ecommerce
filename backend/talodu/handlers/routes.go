package handlers

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupProductImageRoutes_22(r *gin.Engine, db *gorm.DB) {
	productImageRoutes := r.Group("/api/product-images")
	{
		// Single image upload
		productImageRoutes.POST("/:productId", func(c *gin.Context) {
			UploadProductImage(c, db)
		})

		// Multiple image uploads
		productImageRoutes.POST("/:productId/batch", func(c *gin.Context) {
			UploadProductImagesBatch(c, db)
		})
		// Get all images for a product
		productImageRoutes.GET("/:productId", func(c *gin.Context) {
			GetProductImages(c, db)
		})
	}
}
