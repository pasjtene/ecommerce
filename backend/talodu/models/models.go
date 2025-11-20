package models

import (
	"fmt"
	"time"

	"gorm.io/gorm"
)

type Role struct {
	gorm.Model
	Name        string `gorm:"unique"`
	Description string
}

type User struct {
	gorm.Model
	Username      string `gorm:"unique"`
	Email         string `gorm:"unique"`
	Phone         string // Add phone field
	FirstName     string
	LastName      string
	Password      string    `json:"-"`
	RefreshToken  string    `json:"-" gorm:"size:500"`
	RefreshExpiry time.Time `json:"-"`
	OwnedShops    []Shop    `json:"owned_shops" gorm:"foreignKey:OwnerID"`
	EmployedAt    []Shop    `json:"employed_at" gorm:"many2many:shop_employees;"`
	Roles         []Role    `gorm:"many2many:user_roles;"`
	Pin           uint
	IsVerified    bool      `gorm:"default:false"`
	VerifyToken   string    // Stores the email verification token
	VerifyExpiry  time.Time // Token expiration time
	ResetPwToken  string    `gorm:"size:255" json:"reset_token"`
	ResetPwExpiry time.Time `json:"reset_expiry"`

	// Phone verification fields
	PhoneVerificationCode   string    `gorm:"size:6" json:"-"`
	PhoneVerificationExpiry time.Time `json:"-"`
	IsPhoneVerified         bool      `gorm:"default:false"`

	// WhatsApp verification fields
	WhatsAppVerificationCode   string    `gorm:"size:6" json:"-"`
	WhatsAppVerificationExpiry time.Time `json:"-"`
	IsWhatsAppVerified         bool      `gorm:"default:false"`
}

type FrontendUserResponse struct {
	ID        uint           `json:"id"`
	Username  string         `json:"username"`
	FirstName string         `json:"first_name"`
	LastName  string         `json:"last_name"`
	Email     string         `json:"email"`
	Roles     []FrontendRole `json:"roles"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	Pin       uint
}

// FrontendRole matches the frontend Role interface
type FrontendRole struct {
	ID          uint      `json:"ID"`
	Name        string    `json:"Name"`
	Description string    `json:"description,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Convert User to FrontendUserResponse
func (u *User) ToFrontend() FrontendUserResponse {
	roles := make([]FrontendRole, len(u.Roles))
	for i, r := range u.Roles {
		roles[i] = FrontendRole{
			ID:          r.ID,
			Name:        r.Name,
			Description: r.Description,
			CreatedAt:   r.CreatedAt,
			UpdatedAt:   r.UpdatedAt,
		}
	}
	return FrontendUserResponse{
		ID:        u.ID,
		Username:  u.Username,
		FirstName: u.FirstName,
		LastName:  u.LastName,
		Email:     u.Email,
		Roles:     roles,
		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
		Pin:       u.Pin,
	}
}

// Add this struct for update requests
type UpdateUserRequest struct {
	Username  string `json:"username" binding:"required,min=3,max=50"`
	FirstName string `json:"first_name" binding:"required,max=100"`
	LastName  string `json:"last_name" binding:"required,max=100"`
	Email     string `json:"email" binding:"required,email"`
	RoleIDs   []uint `json:"roles" binding:"required,min=1"`
}

type Category struct {
	gorm.Model
	Name        string    `json:"name" gorm:"unique"`
	Description string    `json:"description"`
	Products    []Product `json:"products" gorm:"many2many:product_categories;"`
}

type ProductImage struct {
	gorm.Model
	ProductID uint   `json:"product_id"`
	URL       string `json:"url" gorm:"size:500"`
	AltText   string `json:"alt_text" gorm:"size:100"`
	IsPrimary bool   `json:"is_primary" gorm:"default:false"`
	IsVisible bool   `json:"is_visible"`
}

type Shop struct {
	gorm.Model
	Name        string    `json:"name" gorm:"unique"`
	Slug        string    `gorm:"unique"`
	Description string    `json:"description"`
	Moto        string    `json:"moto" binding:"max=100"`
	OwnerID     uint      `json:"owner_id"`
	Owner       User      `json:"owner" gorm:"foreignKey:OwnerID"`
	Employees   []User    `json:"employees" gorm:"many2many:shop_employees;"`
	Products    []Product `json:"products" gorm:"foreignKey:ShopID"`
}

// Generate slug after the record is created
func (shop *Shop) AfterCreate(tx *gorm.DB) (err error) {
	shop.Slug = generateSlug(shop.Name) + "-" + fmt.Sprint(shop.ID)
	return tx.Save(shop).Error
}
