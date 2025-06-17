// CreateShop - Only accessible by Admin/SuperAdmin
package handlers

import (
	"errors"
	"fmt"
	"math"
	"math/rand"
	"net/http"
	"regexp"
	"strconv"
	"strings"
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
			Moto        string `json:"moto"`
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
			Moto:        input.Moto,
		}

		shop.Slug = generateSlug(input.Name) + "-"

		if err := db.Create(&shop).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create shop"})
			return
		}
		c.JSON(http.StatusCreated, shop)
	}
}

func UpdateShop(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		shopID := c.Param("id")
		fmt.Printf("Updating product...1")

		// Request payload structure
		var request struct {
			Name        string `json:"name" binding:"required"`
			Description string `json:"description"`
			Moto        string `json:"moto"`
			//Categories  []models.Category `json:"categories"`
			//Shop        Shop              `json:"shop_id"`
		}

		fmt.Println("The request :", request)

		// Bind JSON payload
		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Print all request fields with detailed information
		fmt.Println("\n=== Request Payload ===")
		fmt.Printf("Name: %s\n", request.Name)
		//fmt.Printf("Price: %.2f\n", request.Description)
		//fmt.Printf("Stock: %d\n", request.Moto)
		fmt.Printf("Description: %s\n", request.Description)

		// 2. Get existing product
		var existingShop models.Shop
		if err := db.First(&existingShop, shopID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "product not found"})
			return
		}

		// 3. Prepare product updates
		shop := models.Shop{
			Name:        request.Name,
			Moto:        request.Moto,
			Description: request.Description,
		}

		// Generate new slug if name changed
		if existingShop.Name != request.Name {
			shop.Slug = generateSlug(request.Name) + "-" + shopID
		}

		// 4. Update shop
		if err := db.Model(&models.Shop{}).Where("id = ?", shopID).Updates(&shop).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update shop: " + err.Error()})
			return
		}

		// Fetch and return the fully updated product
		var updatedShop models.Shop
		if err := db.Preload("Owner").Preload("Employees").Preload("Products").
			First(&updatedShop, shopID).Error; err != nil {
			//c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch updated shop"})
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		//c.JSON(http.StatusOK, updatedProduct)

		// Return response
		c.JSON(http.StatusOK, gin.H{
			"shop": updatedShop,
		})
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

func IsAuthorized2(c *gin.Context, shop models.Shop) bool {
	// SuperAdmin can do anything
	var authUser *auth.AuthUser
	authUser, err := auth.GetAuthUser(c)
	if err != nil {
		//c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return false
	}

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

		// 1. Search (by name)
		if search := c.Query("search"); search != "" {
			//query = query.Where("name LIKE ?", "%"+search+"%" )

			query = query.Where(
				"name ILIKE ? OR description ILIKE ?",
				"%"+search+"%", "%"+search+"%",
			)

		}

		// Filter by owner if requested
		if ownerID := c.Query("owner_id"); ownerID != "" {
			query = query.Where("owner_id = ?", ownerID)
		} else {

			// Get user roles safely
			//userRolesInterface, exists := c.Get("roles")
			roles, exists := c.Get("roles")
			if !exists {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "User roles not found"})
				return
			}
			userRoles, ok := roles.([]string)
			//userRoles, ok := userRolesInterface.([]interface{})

			if !ok {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user roles format"})
				return
			}

			// Get user ID safely
			authUserID, exists := c.Get("userID")
			if !exists {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "User ID not found"})
				return
			}

			// Convert authUserID to uint regardless of original type
			currentUserID, err := convertToUint(authUserID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error":   "Invalid user ID",
					"details": fmt.Sprintf("Could not convert %v (%T) to uint", authUserID, authUserID),
				})
				return
			}

			//This is a second more flexible check. This check can also be done in the route via authmidleware
			if !auth.HasAnyRole(userRoles, []string{"Admin", "SuperAdmin"}) {
				// If not admin, only show shops owned by the current user
				query = query.Where("owner_id = ?", currentUserID)
			}

		}

		// Pagination
		page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
		offset := (page - 1) * limit

		var totalCount int64
		query.Model(&models.Shop{}).Count(&totalCount)
		// Execute query
		query.Offset(offset).Limit(limit).Find(&shops)

		totalPages := int(math.Ceil(float64(totalCount) / float64(limit)))

		c.JSON(http.StatusOK, gin.H{
			"shops":      shops,
			"page":       page,
			"limit":      limit,
			"totalItems": totalCount,
			"totalPages": totalPages,
		})
	}
}

// GET /shops/:id
func GetShop(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var shop models.Shop
		id := c.Param("id")

		query := db.Preload("Owner").Preload("Products").Preload("Employees")

		/**
		if err := db.First(&shop, id).Preload("Owner").Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Shop not found"})
			return
		}
		*/

		if err := query.First(&shop, id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Shop not found"})
			return
		}

		// Fetch and return the fully updated product

		//c.JSON(http.StatusOK, product)
		// Return response
		c.JSON(http.StatusOK, gin.H{

			"shop": shop,
		})
	}
}

// DELETE /shops/:id
func DeleteShop(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var shop models.Shop
		id := c.Param("id")

		// Get userID from auth context (preferred over URL param)
		authUserID, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
			return
		}

		// Convert authUserID to uint regardless of original type
		userID, err := convertToUint(authUserID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Invalid user ID",
				"details": fmt.Sprintf("Could not convert %v (%T) to uint", authUserID, authUserID),
			})
			return
		}

		// Preload Owner and include error handling
		if err := db.Preload("Owner").Preload("Products").First(&shop, id).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "Shop not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error":   "Failed to fetch shop details",
					"details": err.Error(),
				})
			}
			return
		}

		// Debug output (remove in production)
		/**
		c.JSON(http.StatusUnauthorized, gin.H{
			"debug": gin.H{
				"shopOwnerID":     shop.Owner.ID,
				"authUserID":      authUserID,
				"convertedUserID": userID,
				"types": gin.H{
					"shopOwner": fmt.Sprintf("%T", shop.Owner.ID),
					"authUser":  fmt.Sprintf("%T", authUserID),
				},
			},
			"error":   "Operation not permitted",
			"details": "Only the shop owner can perform this action",
		})
		*/

		//userID, ok := authUserID.(uint)

		if userID != shop.Owner.ID {
			c.JSON(http.StatusForbidden, gin.H{
				"error":                    "Operation not permitted",
				"details":                  "Only the shop owner can perform this action",
				"shop owner Id ":           shop.Owner.ID,
				"user Id ":                 authUserID,
				"Compared: ":               shop.Owner.ID == authUserID,
				"The converted authUser: ": userID,
				//"The ok value":             ok,
				//"The authUserID type is: ": authUserID.(type),
			})
			return
		}

		if len(shop.Products) > 0 {
			c.JSON(http.StatusForbidden, gin.H{
				"error":                    "Operation not permitted",
				"details":                  "There are still products in this shop. Remove all products first",
				"shop owner Id ":           shop.Owner.ID,
				"user Id ":                 authUserID,
				"Compared: ":               shop.Owner.ID == authUserID,
				"The converted authUser: ": userID,
				"The number of products":   len(shop.Products),
				//"The authUserID type is: ": authUserID.(type),
			})
			return
		}

		// Enhanced delete operation with error inspection
		if err := db.Delete(&shop).Error; err != nil {
			// Check for foreign key constraint violation
			if strings.Contains(err.Error(), "foreign key constraint") {
				c.JSON(http.StatusForbidden, gin.H{
					"error":   "Cannot delete shop",
					"details": "This shop has associated products or other references. Please delete them first.",
					"hint":    "You may need to delete associated products before deleting the shop",
				})
			} else {
				// Generic database error
				c.JSON(http.StatusInternalServerError, gin.H{
					"error":   "Failed to delete shop",
					"details": err.Error(),
				})
			}
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Shop deleted successfully"})
	}
}

func DeleteShop2(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var shop Shop
		id := c.Param("id")
		userID := c.Param("userID") //this is added during authentication

		// Convert userID from string to uint
		userIDUint, err := strconv.ParseUint(userID, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}

		if err := db.Preload("Owner").First(&shop, id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Shop not found"})
			return
		}

		if uint(userIDUint) != shop.Owner.ID {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Only the owner can delete this shop"})
		}

		//db.Delete(&shop)
		if err := db.Delete(&shop).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete shop"})
			return
		}

		//c.JSON(http.StatusOK, gin.H{"message": "Shop deleted successfully"})
		c.JSON(http.StatusOK, gin.H{"message": "Success!!!  Shop deleted !"})
	}
}

//##################

func SeedShopsProductsAndCategories(db *gorm.DB) error {
	// Check if shops already exist to avoid duplicate seeding
	var count int64
	db.Model(&Shop{}).Count(&count)
	//if count > 0 { return nil} // already seeded

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
			product.Name = product.Description
			//product.Slug = generateSlug(product.Name) + "-" + fmt.Sprint(product.ID)

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

// Helper function for robust uint conversion
func convertToUint(value interface{}) (uint, error) {
	switch v := value.(type) {
	case uint:
		return v, nil
	case int:
		return uint(v), nil
	case int64:
		return uint(v), nil
	case float32:
		return uint(v), nil
	case float64:
		return uint(v), nil
	case string:
		parsed, err := strconv.ParseUint(v, 10, 64)
		return uint(parsed), err
	default:
		return 0, fmt.Errorf("unsupported type: %T", value)
	}
}
