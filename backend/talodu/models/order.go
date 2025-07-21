package models

import (
	"time"

	"gorm.io/gorm"
)

// Order represents a customer's order
type Order struct {
	gorm.Model
	UserID      uint         `json:"user_id"`
	User        User         `json:"user" gorm:"foreignKey:UserID"`
	OrderNumber string       `json:"order_number" gorm:"uniqueIndex;size:32"`
	Status      OrderStatus  `json:"status" gorm:"type:order_status;default:'pending'"`
	Items       []OrderItem  `json:"items" gorm:"foreignKey:OrderID"`
	TotalAmount float64      `json:"total_amount"`
	Shipping    ShippingInfo `json:"shipping" gorm:"embedded;embeddedPrefix:shipping_"`
	Payment     PaymentInfo  `json:"payment" gorm:"embedded;embeddedPrefix:payment_"`
}

// OrderStatus type for order status
type OrderStatus string

const (
	OrderStatusPending    OrderStatus = "pending"
	OrderStatusPaid       OrderStatus = "paid"
	OrderStatusProcessing OrderStatus = "processing"
	OrderStatusShipped    OrderStatus = "shipped"
	OrderStatusDelivered  OrderStatus = "delivered"
	OrderStatusCancelled  OrderStatus = "cancelled"
)

// OrderItem represents an item in an order
type OrderItem struct {
	gorm.Model
	OrderID     uint    `json:"order_id"`
	ProductID   uint    `json:"product_id"`
	Product     Product `json:"product" gorm:"foreignKey:ProductID"`
	Quantity    int     `json:"quantity"`
	PriceAtTime float64 `json:"price_at_time"` // Snapshot of price when ordered
}

// CartItem represents an item in a user's shopping cart
type CartItem struct {
	gorm.Model
	UserID    uint    `json:"user_id"`
	ProductID uint    `json:"product_id"`
	Product   Product `json:"product" gorm:"foreignKey:ProductID"`
	Quantity  int     `json:"quantity" gorm:"default:1"`
	Price     float64 `json:"price"` // Snapshot of price when added to cart
}

// ShippingInfo contains shipping details
type ShippingInfo struct {
	Name           string `json:"name" gorm:"size:100"`
	Email          string `json:"email" gorm:"size:100"`
	Phone          string `json:"phone" gorm:"size:20"`
	Address        string `json:"address" gorm:"size:255"`
	City           string `json:"city" gorm:"size:100"`
	PostalCode     string `json:"postal_code" gorm:"size:20"`
	Country        string `json:"country" gorm:"size:100"`
	TrackingNumber string `json:"tracking_number" gorm:"size:50"`
}

// PaymentInfo contains payment details
type PaymentInfo struct {
	Method      string    `json:"method" gorm:"size:50"` // stripe, paypal, etc.
	Amount      float64   `json:"amount"`
	Transaction string    `json:"transaction" gorm:"size:100"` // Transaction ID from payment processor
	Status      string    `json:"status" gorm:"size:50"`       // pending, completed, failed, refunded
	PaidAt      time.Time `json:"paid_at"`
}
