package models

import (
	"fmt"
	"regexp"
	"strings"
	"time"

	"gorm.io/gorm"
)

type ProductTranslation struct {
	gorm.Model
	ProductID   uint   `json:"product_id"`
	Language    string `json:"language" gorm:"size:5"` // en, fr, es
	Name        string `json:"name"`
	Description string `json:"description"`
}

// Add this struct for API responses
type ProductAboutResponse struct {
	ID        uint      `json:"id"`
	ProductID uint      `json:"product_id"`
	ItemOrder int       `json:"item_order"`
	AboutText string    `json:"about_text"` // This will contain the translated text
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type ProductAboutTranslation struct {
	ID             uint      `json:"id" gorm:"primaryKey"`
	ProductAboutID uint      `json:"product_about_id"`
	Language       string    `json:"language" gorm:"size:5"` // en, fr, es
	AboutText      string    `json:"about_text" binding:"required,max=255"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type ProductAbout struct {
	ID           uint                      `json:"id"`
	ProductID    uint                      `json:"product_id"`
	ItemOrder    int                       `json:"item_order"`
	Translations []ProductAboutTranslation `json:"translations" gorm:"foreignKey:ProductAboutID"`
	AboutText    string                    `json:"about_text" binding:"required,max=255"`
	CreatedAt    time.Time                 `json:"created_at"`
	UpdatedAt    time.Time                 `json:"updated_at"`
}

type Product struct {
	gorm.Model
	Name                  string               `json:"name" gorm:"not null"`
	Description           string               `json:"description"`
	Slug                  string               `gorm:"unique"`
	Price                 float64              `json:"price"`
	Stock                 int                  `json:"stock"`
	ShopID                uint                 `json:"ShopID" gorm:"column:shop_id"`
	Shop                  Shop                 `json:"shop" gorm:"foreignKey:ShopID"`
	Categories            []Category           `json:"categories" gorm:"many2many:product_categories;"`
	Images                []ProductImage       `json:"images" gorm:"foreignKey:ProductID"`
	Translations          []ProductTranslation `json:"translations" gorm:"foreignKey:ProductID"`
	Abouts                []ProductAbout       `json:"abouts" gorm:"foreignKey:ProductID"`
	AboutsWithTranlations []ProductAbout       `json:"aboutst" gorm:"foreignKey:ProductID"`
	IsFeatured            bool                 `json:"isFeatured" gorm:"default:false"`
	FeaturedOrder         int                  `json:"featuredOrder" gorm:"default:0"`
}

func (p *Product) BeforeCreate(tx *gorm.DB) (err error) {
    if p.Name == "" {
        return fmt.Errorf("product name cannot be empty")
    }
    return nil
}

// Generate slug after the record is created
func (p *Product) AfterCreate(tx *gorm.DB) (err error) {
	p.Slug = generateSlug(p.Name) + "-" + fmt.Sprint(p.ID)
	return tx.Save(p).Error
}

func generateSlug(s string) string {
	// Convert to lowercase
	s = strings.ToLower(s)
	// Replace spaces with hyphens
	s = strings.ReplaceAll(s, " ", "-")
	// Remove all non-alphanumeric characters except hyphens
	reg := regexp.MustCompile("[^a-z0-9-]+")
	s = reg.ReplaceAllString(s, "")
	// Remove consecutive hyphens
	reg = regexp.MustCompile("-+")
	s = reg.ReplaceAllString(s, "-")
	return strings.Trim(s, "-")
}
