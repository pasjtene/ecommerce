// CreateShop - Only accessible by Admin/SuperAdmin
package handlers

import (
	"net/http"
	"strconv"
	"talodu/auth"
	"talodu/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func CreateShop(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input struct {
			Name        string `json:"name" binding:"required"`
			Description string `json:"description"`
			OwnerID     uint   `json:"owner_id" binding:"required"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Verify owner exists
		var owner models.User
		if err := db.First(&owner, input.OwnerID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Owner not found"})
			return
		}

		shop := models.Shop{
			Name:        input.Name,
			Description: input.Description,
			OwnerID:     input.OwnerID,
		}
		if err := db.Create(&shop).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create shop"})
			return
		}

		c.JSON(http.StatusCreated, shop)
	}
}

// AddShopEmployee - Shop owner can add employees
func AddShopEmployee(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		shopID := c.Param("id")
		var input struct {
			UserID uint `json:"user_id" binding:"required"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		// Verify shop exists and current user is owner
		var shop models.Shop
		if err := db.First(&shop, shopID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Shop not found"})
			return
		}

		// Authorization check (simplified)
		currentUserID := c.GetUint("userID")
		if shop.OwnerID != currentUserID {
			c.JSON(http.StatusForbidden, gin.H{"error": "Only shop owner can add employees"})
			return
		}
		// Add employee
		var user models.User
		if err := db.First(&user, input.UserID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "User not found"})
			return
		}

		if err := db.Model(&shop).Association("Employees").Append(&user); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add employee"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Employee added successfully"})
	}
}

func AddShopEmployee2(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get authenticated user
		authUser, err := auth.GetAuthUser(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

		shopID := c.Param("id")
		var input struct {
			UserID uint `json:"user_id" binding:"required"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Verify shop exists
		var shop models.Shop
		if err := db.Preload("Owner").First(&shop, shopID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Shop not found"})
			return
		}

		// Authorization check
		if !isAuthorized(authUser, shop) {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Forbidden",
				"details": gin.H{
					"required":  "Shop owner or Admin/SuperAdmin",
					"your_role": authUser.Roles,
				},
			})
			return
		}

		// Add employee
		var user models.User
		if err := db.First(&user, input.UserID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "User not found"})
			return
		}

		if err := db.Model(&shop).Association("Employees").Append(&user); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add employee"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Employee added successfully"})
	}
}

func isAuthorized(authUser *auth.AuthUser, shop models.Shop) bool {
	// SuperAdmin can do anything
	for _, role := range authUser.Roles {
		if role == "SuperAdmin" {
			return true
		}
	}

	// Shop owner can manage their own shop
	if shop.OwnerID == authUser.ID {
		return true
	}

	// Admin can manage any shop
	for _, role := range authUser.Roles {
		if role == "Admin" {
			return true
		}
	}

	return false
}

// ListShops - Accessible by all authenticated users
func ListShops(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var shops []models.Shop
		query := db.Preload("Owner").Preload("Products").Preload("Employees")

		// Pagination
		page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
		offset := (page - 1) * limit

		// Filter by owner if requested
		if ownerID := c.Query("owner_id"); ownerID != "" {
			query = query.Where("owner_id = ?", ownerID)
		}

		// Execute query
		query.Offset(offset).Limit(limit).Find(&shops)
		var totalCount int64
		query.Model(&models.Shop{}).Count(&totalCount)

		c.JSON(http.StatusOK, gin.H{
			"data":       shops,
			"page":       page,
			"limit":      limit,
			"totalItems": totalCount,
		})
	}
}
