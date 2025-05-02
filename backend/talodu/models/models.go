package models

import (
	"time"

	"gorm.io/gorm"
)

type Product struct {
	gorm.Model
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	Stock       int     `json:"stock"`
	ShopID      uint    `json:"shop_id"`
	Shop        Shop    `json:"shop" gorm:"foreignKey:ShopID"`
}

type Role struct {
	gorm.Model
	Name        string `gorm:"unique"`
	Description string
}

type User struct {
	gorm.Model
	Username      string `gorm:"unique"`
	Email         string `gorm:"unique"`
	FirstName     string
	LastName      string
	Password      string    `json:"-"`
	RefreshToken  string    `json:"-" gorm:"size:500"`
	RefreshExpiry time.Time `json:"-"`
	OwnedShops    []Shop    `json:"owned_shops" gorm:"foreignKey:OwnerID"`
	EmployedAt    []Shop    `json:"employed_at" gorm:"many2many:shop_employees;"`
	Roles         []Role    `gorm:"many2many:user_roles;"`
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

type Shop struct {
	gorm.Model
	Name        string    `gorm:"name"`
	Description string    `json:"description"`
	OwnerID     uint      `json:"owner_id"`
	Owner       User      `json:"owner" gorm:"foreignKey:OwnerID"`
	Employees   []User    `json:"employees" gorm:"many2many:shop_employees;"`
	Products    []Product `json:"products" gorm:"foreignKey:ShopID"`
}
