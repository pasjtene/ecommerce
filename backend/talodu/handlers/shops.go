// CreateShop - Only accessible by Admin/SuperAdmin
package handlers

import (
	"math/rand"
	"net/http"
	"strconv"
	"talodu/auth"
	"talodu/models"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Shop = models.Shop
type Category = models.Category

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

//##################

func SeedShopsProductsAndCategories(db *gorm.DB) error {
	// Check if shops already exist to avoid duplicate seeding
	var count int64
	db.Model(&Shop{}).Count(&count)
	//if count > 0 { return nil } // already seeded

	// Create a local random source
	r := rand.New(rand.NewSource(time.Now().UnixNano()))

	// Create some categories
	categories := []Category{
		{Name: "Electronics", Description: "Electronic devices and gadgets"},
		{Name: "Books", Description: "All kinds of reading materials"},
		{Name: "Clothing", Description: "Fashion items and apparel"},
		{Name: "Home & Kitchen", Description: "Items for your home"},
		{Name: "Sports", Description: "Sports equipment and gear"},
	}

	for i := range categories {
		if err := db.Create(&categories[i]).Error; err != nil {
			return err
		}
	}

	// Shop names and mottos
	shopNames := []string{
		"Tech Haven",
		"Fashion Forward",
		"Book Nook",
		"Gadget Galaxy",
		"Home Essentials",
		"Otantic Packeding",
	}

	shopMottos := []string{
		"Your one-stop tech shop",
		"Style that speaks for you",
		"Where stories come alive",
		"Future in your hands",
		"Comfort starts at home",
		"Des Emballages de  qualité, pour vous rendre heureuse",
	}

	// Product templates
	productTemplates := []struct {
		name        string
		description string
		priceRange  [2]float64
	}{
		{"Premium %s", "High-quality %s for all your needs", [2]float64{10.99, 99.99}},
		{"Deluxe %s", "Luxury edition of %s for the discerning customer", [2]float64{50.00, 199.99}},
		{"Basic %s", "Affordable %s that gets the job done", [2]float64{5.99, 29.99}},
	}

	// Create shops
	for i := 0; i < 6; i++ {
		ownerID := uint(1) // First 2 shops for user 1
		if i >= 2 {
			ownerID = 2 // Last 3 shops for user 2
		}

		shop := Shop{
			Name:        shopNames[i],
			Description: "A wonderful shop specializing in " + shopNames[i],
			Moto:        shopMottos[i],
			OwnerID:     ownerID,
		}

		// Create shop
		if err := db.Create(&shop).Error; err != nil {
			return err
		}

		// Create 3 products for each shop
		for j := 0; j < 3; j++ {
			template := productTemplates[j]
			productType := "electronics"
			if i == 1 || i == 4 {
				productType = "home goods"
			} else if i == 2 {
				productType = "books"
			}

			productName := template.name
			if j == 0 {
				productName = template.name
				if i == 0 || i == 3 {
					productName = "Smart " + productName
				}
			}

			product := Product{
				Name:        productName,
				Description: template.description,
				Price:       template.priceRange[0] + rand.Float64()*(template.priceRange[1]-template.priceRange[0]),
				Stock:       rand.Intn(100) + 10, // Random stock between 10-110
				ShopID:      shop.ID,
			}

			// Format product name and description with the product type
			product.Name = product.Name + " " + productType
			product.Description = product.Description + " " + productType

			if err := db.Create(&product).Error; err != nil {
				return err
			}
		}

	}

	// After creating products, assign categories
	var products []Product
	if err := db.Find(&products).Error; err != nil {
		return err
	}

	for _, product := range products {

		// Assign 1-2 random categories to each product
		numCategories := r.Intn(2) + 1 // 1 or 2 categories
		var categoryIDs []uint
		for i := 0; i < numCategories; i++ {
			categoryID := uint(r.Intn(len(categories))) + 1
			categoryIDs = append(categoryIDs, categoryID)
		}

		// Remove duplicates
		categoryIDs = uniqueUints(categoryIDs)
		// Get the actual category objects
		var selectedCategories []Category
		if err := db.Where("id IN ?", categoryIDs).Find(&selectedCategories).Error; err != nil {
			return err
		}

		// Assign categories
		if err := db.Model(&product).Association("Categories").Replace(selectedCategories); err != nil {
			return err
		}

	}

	//}

	return nil
}

func uniqueUints(input []uint) []uint {
	unique := make(map[uint]bool)
	var result []uint
	for _, val := range input {
		if _, ok := unique[val]; !ok {
			unique[val] = true
			result = append(result, val)
		}
	}
	return result
}
