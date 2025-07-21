// handlers/order.go
package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"talodu/auth"
	"talodu/models"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type PaymentInfo = models.PaymentInfo
type Order = models.Order
type OrderItem = models.OrderItem
type ShippingInfo = models.ShippingInfo
type CartItem = models.CartItem
type OrderStatus = models.OrderStatus

// Import the OrderStatus constants
const (
	OrderStatusPending    = models.OrderStatusPending
	OrderStatusPaid       = models.OrderStatusPaid
	OrderStatusProcessing = models.OrderStatusProcessing
	OrderStatusShipped    = models.OrderStatusShipped
	OrderStatusDelivered  = models.OrderStatusDelivered
	OrderStatusCancelled  = models.OrderStatusCancelled
)

func CreateOrderFromCart(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get authenticated user
		authUser, err := auth.GetAuthUser(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
			return
		}

		if authUser == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user"})
			return
		}

		// Get shipping info from request
		var request struct {
			Shipping      ShippingInfo `json:"shipping" binding:"required"`
			PaymentMethod string       `json:"payment_method" binding:"required"`
		}

		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Begin transaction
		tx := db.Begin()
		defer func() {
			if r := recover(); r != nil {
				tx.Rollback()
			}
		}()

		// Get user's cart items
		var cartItems []struct {
			ProductID uint    `json:"product_id"`
			Quantity  int     `json:"quantity"`
			Price     float64 `json:"price"`
		}

		if err := tx.Model(&CartItem{}).Where("user_id = ?", authUser.ID).Find(&cartItems).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cart items"})
			return
		}

		if len(cartItems) == 0 {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "Cart is empty"})
			return
		}

		// Calculate total amount
		var totalAmount float64
		for _, item := range cartItems {
			totalAmount += item.Price * float64(item.Quantity)
		}

		// Create order
		order := Order{
			UserID:      authUser.ID,
			OrderNumber: generateOrderNumber(),
			Status:      OrderStatusPending,
			TotalAmount: totalAmount,
			Shipping:    request.Shipping,
			Payment: PaymentInfo{
				Method: request.PaymentMethod,
				Amount: totalAmount,
				Status: "pending",
			},
		}

		// Create order items and update stock
		for _, cartItem := range cartItems {
			var product Product
			if err := tx.First(&product, cartItem.ProductID).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusBadRequest, gin.H{
					"error": fmt.Sprintf("product %d not found", cartItem.ProductID),
				})
				return
			}

			// Check stock availability
			if product.Stock < cartItem.Quantity {
				tx.Rollback()
				c.JSON(http.StatusBadRequest, gin.H{
					"error": fmt.Sprintf("not enough stock for product %s", product.Name),
				})
				return
			}

			// Reduce product stock
			if err := tx.Model(&product).Update("stock", gorm.Expr("stock - ?", cartItem.Quantity)).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": fmt.Sprintf("failed to update stock for product %d", product.ID),
				})
				return
			}

			order.Items = append(order.Items, OrderItem{
				ProductID:   product.ID,
				Quantity:    cartItem.Quantity,
				PriceAtTime: product.Price,
			})
		}

		// Save order
		if err := tx.Create(&order).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create order"})
			return
		}

		// Clear cart
		if err := tx.Where("user_id = ?", authUser.ID).Delete(&CartItem{}).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to clear cart"})
			return
		}

		// Commit transaction
		if err := tx.Commit().Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "transaction failed"})
			return
		}

		// Return order details
		c.JSON(http.StatusCreated, gin.H{
			"message": "Order created successfully",
			"order":   order,
		})
	}
}

// generateRandomToken creates a random string of specified length
func generateRandomToken(length int) string {
	b := make([]byte, length)
	if _, err := rand.Read(b); err != nil {
		// Fallback to simpler random if crypto fails
		return fmt.Sprintf("%d", time.Now().UnixNano())
	}
	return hex.EncodeToString(b)[:length]
}

// generateOrderNumber creates a unique order number
func generateOrderNumber() string {
	return fmt.Sprintf("ORD-%d-%s",
		time.Now().Unix(),
		generateRandomToken(6))
}

func GetOrders(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check if user is admin
		if !auth.IsAdminOrIsSuperAdmin(c) {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
			return
		}

		// Pagination parameters
		page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
		offset := (page - 1) * limit

		// Filter parameters
		status := c.Query("status")
		userID := c.Query("user_id")

		query := db.Model(&Order{}).
			Preload("User").
			Preload("Items").
			Preload("Items.Product")

		if status != "" {
			query = query.Where("status = ?", status)
		}

		if userID != "" {
			query = query.Where("user_id = ?", userID)
		}

		// Get total count
		var totalCount int64
		query.Count(&totalCount)

		// Get paginated results
		var orders []Order
		if err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&orders).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch orders"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"orders":      orders,
			"total_count": totalCount,
			"page":        page,
			"limit":       limit,
		})
	}
}

func GetUserOrders(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get authenticated user
		authUser, err := auth.GetAuthUser(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
			return
		}

		if authUser == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user"})
			return
		}

		// Pagination parameters
		page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
		offset := (page - 1) * limit

		query := db.Model(&Order{}).
			Preload("Items").
			Preload("Items.Product").
			Where("user_id = ?", authUser.ID)

		// Get total count
		var totalCount int64
		query.Count(&totalCount)

		// Get paginated results
		var orders []Order
		if err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&orders).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch orders"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"orders":      orders,
			"total_count": totalCount,
			"page":        page,
			"limit":       limit,
		})
	}
}

func GetOrderDetails(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		orderID := c.Param("id")

		var order Order
		err := db.
			Preload("User").
			Preload("Items").
			Preload("Items.Product").
			Preload("Items.Product.Images").
			First(&order, orderID).Error

		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "order not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch order"})
			}
			return
		}

		// Check if user is admin or order owner
		authUserID, exists := c.Get("userID")
		if !exists || (authUserID.(uint) != order.UserID && auth.IsAdminOrIsSuperAdmin(c)) {
			c.JSON(http.StatusForbidden, gin.H{"error": "not authorized to view this order"})
			return
		}

		c.JSON(http.StatusOK, order)
	}
}

func UpdateOrderStatus(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		orderID := c.Param("id")

		var request struct {
			Status OrderStatus `json:"status" binding:"required"`
		}

		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Check if user is admin
		if !auth.IsAdminOrIsSuperAdmin(c) {
			c.JSON(http.StatusForbidden, gin.H{"error": "not authorized to update orders"})
			return
		}

		var order Order
		if err := db.First(&order, orderID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "order not found"})
			return
		}

		// Update status
		if err := db.Model(&order).Update("status", request.Status).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update order status"})
			return
		}

		// If status is shipped, update tracking number if provided
		if request.Status == OrderStatusShipped {
			var trackingRequest struct {
				TrackingNumber string `json:"tracking_number"`
			}

			if err := c.ShouldBindJSON(&trackingRequest); err == nil && trackingRequest.TrackingNumber != "" {
				db.Model(&order).Update("shipping_tracking_number", trackingRequest.TrackingNumber)
			}
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Order status updated",
			"order":   order,
		})
	}
}
