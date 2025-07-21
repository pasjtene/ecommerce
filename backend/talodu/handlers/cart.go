package handlers

import (
	"errors"
	"fmt"
	"net/http"
	"talodu/auth"
	"talodu/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func AutoMigrateSharedCartModels(db *gorm.DB) error {
	err := db.AutoMigrate(
		&models.SharedCart{},
		&models.SharedCartItem{},
		&models.SharedCartView{},
	)
	if err != nil {
		return fmt.Errorf("failed to migrate shared cart models: %w", err)
	}
	return nil
}

// AddToCart adds a product to the user's cart
func AddToCart(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get authenticated user
		authUser, err := auth.GetAuthUser(c)
		if err != nil || authUser == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
			return
		}

		var input struct {
			ProductID uint `json:"product_id" binding:"required"`
			Quantity  int  `json:"quantity" binding:"required,min=1"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Check product exists and get current price
		var product Product
		if err := db.First(&product, input.ProductID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}

		// Check stock availability
		if product.Stock < input.Quantity {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Not enough stock available"})
			return
		}

		// Check if item already in cart
		var existingItem CartItem
		result := db.Where("user_id = ? AND product_id = ?", authUser.ID, input.ProductID).
			First(&existingItem)

		if result.Error == nil {
			// Update existing item
			newQuantity := existingItem.Quantity + input.Quantity
			if err := db.Model(&existingItem).
				Updates(map[string]interface{}{
					"quantity": newQuantity,
					"price":    product.Price, // Update to current price
				}).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update cart"})
				return
			}
		} else if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			// Create new cart item
			cartItem := CartItem{
				UserID:    authUser.ID,
				ProductID: input.ProductID,
				Quantity:  input.Quantity,
				Price:     product.Price,
			}

			if err := db.Create(&cartItem).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add to cart"})
				return
			}
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check cart"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Product added to cart"})
	}
}

// GetCart returns the user's current cart
func GetCart(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		authUser, err := auth.GetAuthUser(c)
		if err != nil || authUser == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
			return
		}

		var cartItems []CartItem
		if err := db.Preload("Product").
			Preload("Product.Images").
			Where("user_id = ?", authUser.ID).
			Find(&cartItems).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cart"})
			return
		}

		// Calculate total
		var total float64
		for _, item := range cartItems {
			total += item.Price * float64(item.Quantity)
		}

		c.JSON(http.StatusOK, gin.H{
			"items": cartItems,
			"total": total,
		})
	}
}

// UpdateCartItem updates a cart item's quantity
func UpdateCartItem(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		authUser, err := auth.GetAuthUser(c)
		if err != nil || authUser == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
			return
		}

		itemID := c.Param("id")

		var input struct {
			Quantity int `json:"quantity" binding:"required,min=1"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Get the cart item
		var cartItem CartItem
		if err := db.Where("id = ? AND user_id = ?", itemID, authUser.ID).
			First(&cartItem).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Cart item not found"})
			return
		}

		// Check product stock
		var product Product
		if err := db.First(&product, cartItem.ProductID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}

		if product.Stock < input.Quantity {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Not enough stock available"})
			return
		}

		// Update quantity
		if err := db.Model(&cartItem).Update("quantity", input.Quantity).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update cart"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Cart updated"})
	}
}

// RemoveFromCart removes an item from the cart
func RemoveFromCart(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		authUser, err := auth.GetAuthUser(c)
		if err != nil || authUser == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
			return
		}

		itemID := c.Param("id")

		if err := db.Where("id = ? AND user_id = ?", itemID, authUser.ID).
			Delete(&CartItem{}).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove from cart"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Item removed from cart"})
	}
}

// ClearCart removes all items from the user's cart
func ClearCart(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		authUser, err := auth.GetAuthUser(c)
		if err != nil || authUser == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
			return
		}

		if err := db.Where("user_id = ?", authUser.ID).
			Delete(&CartItem{}).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear cart"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Cart cleared"})
	}
}
