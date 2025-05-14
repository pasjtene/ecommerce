package models

import (
	"fmt"
	"regexp"
	"strings"

	"gorm.io/gorm"
)

type Product struct {
	gorm.Model
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Slug        string  `gorm:"unique"`
	Price       float64 `json:"price"`
	Stock       int     `json:"stock"`
	//ShopID      uint           `json:"ShopID"`
	ShopID     uint           `json:"ShopID" gorm:"column:shop_id"`
	Shop       Shop           `json:"shop" gorm:"foreignKey:ShopID"`
	Categories []Category     `json:"categories" gorm:"many2many:product_categories;"`
	Images     []ProductImage `json:"images" gorm:"foreignKey:ProductID"`
}

// Generate slug before creating/updating
/*
func (p *Product) BeforeSave(tx *gorm.DB) (err error) {
	p.Slug = generateSlug(p.Name) + "-" + fmt.Sprint(p.ID)
	return nil
}
*/

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
