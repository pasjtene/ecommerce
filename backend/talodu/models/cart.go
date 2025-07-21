package models

import (
	"time"

	"gorm.io/gorm"
)

// SharedCart represents a snapshot of a cart that can be shared
type SharedCart struct {
	gorm.Model
	Token     string           `json:"token" gorm:"uniqueIndex;size:64"`
	UserID    *uint            `json:"user_id"` //User must be logged in before the shared cart is created
	ExpiresAt time.Time        `json:"expires_at"`
	Items     []SharedCartItem `json:"items" gorm:"foreignKey:SharedCartID"`
	Viewed    bool             `json:"viewed" gorm:"default:false"`
	ViewedAt  *time.Time       `json:"viewed_at"`
}

// SharedCartItem represents an item in a shared cart
type SharedCartItem struct {
	gorm.Model
	SharedCartID uint    `json:"shared_cart_id"`
	ProductID    uint    `json:"product_id"`
	Product      Product `json:"product" gorm:"foreignKey:ProductID"`
	Quantity     int     `json:"quantity" gorm:"default:1"`
	PriceAtShare float64 `json:"price_at_share"` // Snapshot of price when shared
}

// SharedCartView represents when someone views a shared cart
type SharedCartView struct {
	gorm.Model
	SharedCartID uint       `json:"shared_cart_id"`
	SharedCart   SharedCart `json:"shared_cart" gorm:"foreignKey:SharedCartID"`
	ViewedAt     time.Time  `json:"viewed_at"`
	IPAddress    string     `json:"ip_address" gorm:"size:45"`
	UserAgent    string     `json:"user_agent" gorm:"size:255"`
}
