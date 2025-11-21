package handlers

import (
	"fmt"
	"log"
	"math"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"talodu/auth"
	"talodu/models"

	"github.com/google/uuid"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Product = models.Product
type ProductImage = models.ProductImage
type ProductTranslation = models.ProductTranslation

// GET /products/featured
func GetFeaturedProducts(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var products []models.Product
		lang := strings.ToLower(strings.TrimSpace(c.Query("lang")))
		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "8"))

		query := db.
			//Preload("Images", "is_visible = ?", true).
			Preload("Images", func(db *gorm.DB) *gorm.DB {
				return db.Select("id", "created_at", "updated_at", "deleted_at", "product_id", "url", "alt_text", "is_primary", "is_visible").
					Order("is_primary DESC, created_at ASC").Where("is_visible = ?", true)
			}).
			Preload("Translations").
			Preload("Shop", func(db *gorm.DB) *gorm.DB {
				return db.Select("id", "name")
			}).
			Where("is_featured = ?", true).
			Where("is_visible = ?", true).
			Where("deleted_at IS NULL").
			Order("featured_order ASC, created_at DESC").
			Limit(limit)

		if err := query.Find(&products).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch featured products"})
			return
		}

		// Apply translations if language is specified
		if lang != "" {
			for i := range products {
				for _, t := range products[i].Translations {
					if t.Language == lang {
						products[i].Name = t.Name
						products[i].Description = t.Description
						break
					}
				}
			}
		}

		c.JSON(http.StatusOK, gin.H{
			"products": products,
			"count":    len(products),
		})
	}
}

// PUT /products/:id/featured - Toggle featured status
func ToggleFeaturedProduct(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		productID := c.Param("id")

		var input struct {
			IsFeatured    bool `json:"isFeatured"`
			FeaturedOrder int  `json:"featuredOrder,omitempty"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var product models.Product
		if err := db.First(&product, productID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}

		// Update featured status and order
		updates := map[string]interface{}{
			"is_featured": input.IsFeatured,
		}

		if input.FeaturedOrder > 0 {
			updates["featured_order"] = input.FeaturedOrder
		}

		if err := db.Model(&product).Updates(updates).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update featured status"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Featured status updated",
			"product": gin.H{
				"id":            product.ID,
				"isFeatured":    input.IsFeatured,
				"featuredOrder": input.FeaturedOrder,
			},
		})
	}
}

// GET /products/:id/related
func GetRelatedProducts(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		productID := c.Param("id")
		lang := strings.ToLower(strings.TrimSpace(c.Query("lang")))
		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "8"))

		// Get current product and its categories
		var currentProduct models.Product
		if err := db.Preload("Categories").First(&currentProduct, productID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}

		// Extract category IDs
		var categoryIDs []uint
		for _, category := range currentProduct.Categories {
			categoryIDs = append(categoryIDs, category.ID)
		}

		if len(categoryIDs) == 0 {
			c.JSON(http.StatusOK, gin.H{"products": []models.Product{}})
			return
		}

		// Find products that share the same categories, excluding current product
		var relatedProducts []models.Product
		query := db.
			Preload("Images").
			Preload("Translations").
			Preload("Shop", func(db *gorm.DB) *gorm.DB {
				return db.Select("id", "name")
			}).
			Joins("JOIN product_categories pc ON products.id = pc.product_id").
			Where("pc.category_id IN (?)", categoryIDs).
			Where("products.id != ?", productID).
			Where("products.is_visible = ?", true).
			Where("products.deleted_at IS NULL").
			Group("products.id").
			Order("COUNT(pc.category_id) DESC, products.created_at DESC").
			Limit(limit)

		if err := query.Find(&relatedProducts).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch related products"})
			return
		}

		// Apply translations if language is specified
		if lang != "" {
			for i := range relatedProducts {
				for _, t := range relatedProducts[i].Translations {
					if t.Language == lang {
						relatedProducts[i].Name = t.Name
						relatedProducts[i].Description = t.Description
						break
					}
				}
			}
		}

		c.JSON(http.StatusOK, gin.H{
			"products": relatedProducts,
			"count":    len(relatedProducts),
		})
	}
}

// GET /products?search=query&sort=price&page=1&limit=10
func ListProducts(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var _ = models.Product{}
		var products []models.Product
		lang := strings.ToLower(strings.TrimSpace(c.Query("lang")))

		//query := db.Model(&models.Product{})
		query := db.Model(&models.Product{}).
			Preload("Translations").
			Preload("Images", "is_visible = ?", true). // Only visible images).
			Preload("Shop", func(db *gorm.DB) *gorm.DB {
				return db.Select("id", "name") // Only load specific shop fields

			}).Where("is_visible = ?", true) // Only show visible products

		if search := c.Query("search"); search != "" {
			search = strings.TrimSpace(search)

			if len(search) < 5 {
				// Use trigram-optimized ILIKE for short searches
				query = query.Where(
					"name ILIKE ? OR description ILIKE ?",
					"%"+search+"%", "%"+search+"%",
				)
			} else {
				// Use FTS with OR logic for longer queries
				//index is added to db for fts to work
				//CREATE EXTENSION IF NOT EXISTS pg_trgm;
				//CREATE INDEX idx_products_name_trgm ON products USING gin(name gin_trgm_ops);
				//CREATE INDEX idx_products_description_trgm ON products USING gin(description gin_trgm_ops);
				//terms := strings.Join(strings.Fields(search), " | ") // Changed from " & " to " | "
				terms := strings.Join(strings.Fields(search), " & ") // Changed from " & " to " | "
				query = query.Where(
					"to_tsvector('french', coalesce(name,'') || ' ' || coalesce(description,'')) @@ to_tsquery('french', ?)",
					terms,
				)
			}
		}

		// Minimum price (e.g., ?min_price=50)
		if minPrice := c.Query("min_price"); minPrice != "" {
			query = query.Where("price >= ?", minPrice)
		}
		// Maximum price (e.g., ?max_price=500)
		if maxPrice := c.Query("max_price"); maxPrice != "" {
			query = query.Where("price <= ?", maxPrice)
		}

		// Get TOTAL COUNT (before pagination)
		var totalCount int64
		query.Count(&totalCount) // Critical: Count before .Offset()

		// 2. Sorting (e.g., ?sort=price or ?sort=-price for DESC)
		if sort := c.Query("sort"); sort != "" {
			if sort[0] == '-' {
				query = query.Order(sort[1:] + " DESC")
			} else {
				query = query.Order(sort)
			}
		} else {
			//query = query.Order("id") // Default sort
			query = query.Order("created_at DESC")
		}

		//  Pagination
		page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "5"))
		offset := (page - 1) * limit

		// Execute query
		query.Offset(offset).Limit(limit).Find(&products)

		// Apply translations to each product if language is specified
		if lang != "" {
			for i := range products {
				for _, t := range products[i].Translations {
					if t.Language == lang {
						products[i].Name = t.Name
						products[i].Description = t.Description
						break
					}
				}
			}
		}

		//  Calculate total pages
		totalPages := int(math.Ceil(float64(totalCount) / float64(limit)))

		// Return response
		c.JSON(http.StatusOK, gin.H{
			"products":   products,
			"page":       page,
			"limit":      limit,
			"totalItems": totalCount,
			"totalPages": totalPages,
		})
	}
}

// Same as list products, but NOT VISIBLE PRODUCTS ARE DISPLAYED
func ListProductsAdmin(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var _ = models.Product{}
		var products []models.Product
		lang := strings.ToLower(strings.TrimSpace(c.Query("lang")))

		//query := db.Model(&models.Product{})
		query := db.Model(&models.Product{}).Preload("Translations").Preload("Images").Preload("Shop", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "name") // Only load specific shop fields
		})

		if search := c.Query("search"); search != "" {
			search = strings.TrimSpace(search)

			if len(search) < 5 {
				// Use trigram-optimized ILIKE for short searches
				query = query.Where(
					"name ILIKE ? OR description ILIKE ?",
					"%"+search+"%", "%"+search+"%",
				)
			} else {
				// Use FTS with OR logic for longer queries
				//index is added to db for fts to work
				//CREATE EXTENSION IF NOT EXISTS pg_trgm;
				//CREATE INDEX idx_products_name_trgm ON products USING gin(name gin_trgm_ops);
				//CREATE INDEX idx_products_description_trgm ON products USING gin(description gin_trgm_ops);
				//terms := strings.Join(strings.Fields(search), " | ") // Changed from " & " to " | "
				terms := strings.Join(strings.Fields(search), " & ") // Changed from " & " to " | "
				query = query.Where(
					"to_tsvector('french', coalesce(name,'') || ' ' || coalesce(description,'')) @@ to_tsquery('french', ?)",
					terms,
				)
			}
		}

		// Minimum price (e.g., ?min_price=50)
		if minPrice := c.Query("min_price"); minPrice != "" {
			query = query.Where("price >= ?", minPrice)
		}
		// Maximum price (e.g., ?max_price=500)
		if maxPrice := c.Query("max_price"); maxPrice != "" {
			query = query.Where("price <= ?", maxPrice)
		}

		// Get TOTAL COUNT (before pagination)
		var totalCount int64
		query.Count(&totalCount) // Critical: Count before .Offset()

		// 2. Sorting (e.g., ?sort=price or ?sort=-price for DESC)
		if sort := c.Query("sort"); sort != "" {
			if sort[0] == '-' {
				query = query.Order(sort[1:] + " DESC")
			} else {
				query = query.Order(sort)
			}
		} else {
			//query = query.Order("id") // Default sort
			query = query.Order("created_at DESC")
		}

		//  Pagination
		page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "5"))
		offset := (page - 1) * limit

		// Execute query
		query.Offset(offset).Limit(limit).Find(&products)

		// Apply translations to each product if language is specified
		if lang != "" {
			for i := range products {
				for _, t := range products[i].Translations {
					if t.Language == lang {
						products[i].Name = t.Name
						products[i].Description = t.Description
						break
					}
				}
			}
		}

		//  Calculate total pages
		totalPages := int(math.Ceil(float64(totalCount) / float64(limit)))

		// Return response
		c.JSON(http.StatusOK, gin.H{
			"products":   products,
			"page":       page,
			"limit":      limit,
			"totalItems": totalCount,
			"totalPages": totalPages,
		})
	}
}

// PUT /products/:id/visibility - Toggle product visibility
func ToggleProductVisibility(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		productID := c.Param("id")

		var input struct {
			IsVisible bool `json:"isVisible"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var product models.Product
		if err := db.First(&product, productID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}

		// Update visibility
		if err := db.Model(&product).Update("is_visible", input.IsVisible).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update visibility"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Visibility updated",
			"product": gin.H{
				"id":        product.ID,
				"isVisible": input.IsVisible,
			},
		})
	}
}

// GET /shops/:id/products
func GetShopProducts(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		shopID := c.Param("id")
		var products []models.Product

		var shop models.Shop
		if err := db.
			First(&shop, shopID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch updated shop"})
			return
		}

		query := db.
			Preload("Images").
			Preload("Categories").
			Where("shop_id = ?", shopID).
			Where("is_visible = ?", true).
			Find(&products)

			// 1. Search (by name)
		if search := c.Query("search"); search != "" {
			//query = query.Where("name LIKE ?", "%"+search+"%" )

			query = query.Where(
				"name ILIKE ? OR description ILIKE ?",
				"%"+search+"%", "%"+search+"%",
			)

		}

		if query.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
			return
		}
		var totalCount int64
		query.Count(&totalCount)

		//  Pagination
		page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "5"))
		offset := (page - 1) * limit

		// Execute query
		query.Offset(offset).Limit(limit).Find(&products)
		//  Calculate total pages
		// totalPages := int(math.Ceil(float64(totalCount) / float64(limit)))

		c.JSON(http.StatusOK, gin.H{
			"products": products,
			"shop":     shop,
		})
	}
}

// CreateProductTranslation creates a new product translation or updates an existing one.
func CreateProductTranslation(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {

		productID := c.Param("id")
		var input struct {
			Language    string `json:"language" binding:"required"`
			Name        string `json:"name" binding:"required"`
			Description string `json:"description"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Verify product exists
		var product models.Product
		if err := db.First(&product, productID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}

		// Upsert translation (create or update)
		var existingTranslation models.ProductTranslation
		isNewTranslation := false

		// Try to find an existing translation
		result := db.Where("product_id = ? AND language = ?", product.ID, input.Language).First(&existingTranslation)

		if result.Error != nil {
			// If record not found, proceed to create
			if result.Error == gorm.ErrRecordNotFound {
				isNewTranslation = true
				existingTranslation = models.ProductTranslation{
					ProductID:   product.ID,
					Language:    input.Language,
					Name:        input.Name,
					Description: input.Description,
				}
				if err := db.Create(&existingTranslation).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create translation"})
					return
				}
			} else {
				// Other database errors
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch translation: " + result.Error.Error()})
				return
			}
		} else {
			// If record found, update its fields
			// Check if there are actual changes to avoid unnecessary updates
			if existingTranslation.Name != input.Name || existingTranslation.Description != input.Description {
				existingTranslation.Name = input.Name
				existingTranslation.Description = input.Description
				if err := db.Save(&existingTranslation).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update translation"})
					return
				}
			}
			// If no changes, the status will still be OK, but no DB write
		}

		// 4. Return appropriate response
		status := http.StatusOK
		message := "Translation updated successfully"
		if isNewTranslation {
			status = http.StatusCreated
			message = "Translation created successfully"
		}

		c.JSON(status, gin.H{
			"message":     message,
			"translation": existingTranslation,
		})
	}
}

// GET /products/:id
func GetAdminProduct(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var product models.Product
		id := c.Param("id")
		lang := strings.ToLower(strings.TrimSpace(c.Query("lang")))

		log.Printf("Processing request for product ID: %s, language: %s", id, lang)

		if err := db.Preload("Images", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "created_at", "updated_at", "deleted_at", "product_id", "url", "alt_text", "is_primary", "is_visible").
				Order("is_primary DESC, created_at ASC")
		}).Preload("Translations").Preload("Categories").First(&product, id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}

		// Apply translation if available
		if lang != "" {
			for _, t := range product.Translations {
				if t.Language == lang {
					product.Name = t.Name
					product.Description = t.Description
					break
				}
			}
		} else {
			log.Printf("No language for for product ID: %s, language: %s", id, lang)
		}

		// Fetch and return the fully updated product
		var shop models.Shop
		if err := db.Preload("Owner").Preload("Employees").
			First(&shop, product.ShopID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch updated shop"})
			return
		}
		product.Shop = shop
		db.Save(&product)

		// get product abouts with translations
		var abouts []models.ProductAbout

		if err := db.Preload("Translations").Where("product_id = ?", id).Order("item_order").Find(&abouts).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch abouts"})
			return
		}

		//product.Abouts = abouts

		// Convert to response format with translations
		aboutResponses := make([]models.ProductAboutResponse, len(abouts))

		for i, about := range abouts {
			aboutText := "Not translated" // Default empty if no translation found

			if lang != "" {
				// Find translation for this language
				var translation models.ProductAboutTranslation
				if err := db.Where("product_about_id = ? AND language = ?", about.ID, lang).
					First(&translation).Error; err == nil {
					aboutText = translation.AboutText
				} else {
					aboutText = about.AboutText
				}
			}
			aboutResponses[i] = models.ProductAboutResponse{
				ID:        about.ID,
				ProductID: about.ProductID,
				ItemOrder: about.ItemOrder,
				AboutText: aboutText,
				CreatedAt: about.CreatedAt,
				UpdatedAt: about.UpdatedAt,
			}

		}

		translatedAbouts := make([]models.ProductAbout, len(abouts))

		for i, a2 := range aboutResponses {
			translatedAbouts[i] = models.ProductAbout{
				ID:        a2.ID,
				ItemOrder: a2.ItemOrder,
				AboutText: a2.AboutText,
				CreatedAt: a2.CreatedAt,
				UpdatedAt: a2.UpdatedAt,
				//Translations: abouts.translations,
			}
		}

		//product.AboutsT = aboutResponses
		product.Abouts = translatedAbouts
		product.AboutsWithTranlations = abouts

		c.JSON(http.StatusOK, gin.H{
			"product": product,
			"shop":    shop,
			//"abouts":  aboutResponses,
		})
	}
}

// POST /products
func CreateProduct(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input struct {
			Name        string  `json:"name"`
			Description string  `json:"description"`
			Price       float64 `json:"price"`
			Stock       int     `json:"stock"`
			ShopID      uint    `json:"shop_id" binding:"required"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Verify shop exists and user has access
		var shop models.Shop
		if err := db.Preload("Owner").Preload("Employees").First(&shop, input.ShopID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Shop not found"})
			return
		}

		product := models.Product{
			Name:        input.Name,
			Price:       input.Price,
			Description: input.Description,
			Stock:       input.Stock,
			ShopID:      input.ShopID,
		}
		//product.Slug = generateSlug(input.Name) + "-" + productID
		product.Slug = generateSlug(input.Name) + "-"

		//db.Create(&product)
		if err := db.Create(&product).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create product"})
			return
		}
		var createdProduct models.Product
		if err := db.First(&createdProduct, product.ID).Preload("Shop", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "name") // Only load specific shop fields
		}).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch created product"})
			return
		}

		createdProduct.Shop = shop

		c.JSON(http.StatusCreated, createdProduct)
	}
}

func isEmployee(employees []models.User, userID uint) bool {
	for _, emp := range employees {
		if emp.ID == userID {
			return true
		}
	}
	return false
}

// DELETE /products/:id
func DeleteProduct(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var product Product
		id := c.Param("id")

		if err := db.First(&product, id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}

		db.Delete(&product)
		c.JSON(http.StatusOK, gin.H{"message": "Product deleted"})
	}
}

func UpdateProduct(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		productID := c.Param("id")
		fmt.Printf("Updating product...1")

		// Request payload structure
		var request struct {
			Name        string  `json:"name" binding:"required"`
			Price       float64 `json:"price" binding:"required"`
			Stock       int     `json:"stock" binding:"required"`
			Description string  `json:"description"`
			//shop        models.Shop       `json:"shop" binding:"required"`
			ShopID     uint              `json:"ShopID" binding:"required"`
			Categories []models.Category `json:"categories"`
			Shop       Shop              `json:"shop_id"`
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
		fmt.Printf("Price: %.2f\n", request.Price)
		fmt.Printf("Stock: %d\n", request.Stock)
		fmt.Printf("Description: %s\n", request.Description)
		fmt.Printf("ShopID: %d\n", request.ShopID)

		fmt.Println("Categories:")
		for i, cat := range request.Categories {
			fmt.Printf("  [%d] ID: %d, Name: %s\n", i, cat.ID, cat.Name)
			// Add other category fields you want to inspect
		}

		// 2. Get existing product
		var existingProduct models.Product
		if err := db.First(&existingProduct, productID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "product not found"})
			return
		}

		// 3. Prepare product updates
		product := models.Product{
			Name:        request.Name,
			Price:       request.Price,
			Stock:       request.Stock,
			Description: request.Description,
			ShopID:      request.ShopID,
		}

		// Generate new slug if name changed
		if existingProduct.Name != request.Name {
			product.Slug = generateSlug(request.Name) + "-" + productID
			product.Name = request.Name

		}

		// 4. Update product
		if err := db.Model(&models.Product{}).Where("id = ?", productID).Updates(&product).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update product: " + err.Error()})
			return
		}

		// 5. Handle categories
		var categoryIDs []uint
		for _, category := range request.Categories {
			var cat models.Category
			if category.ID == 0 {
				// New category
				if err := db.Create(&category).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create category: " + err.Error()})
					return
				}
				cat = category
			} else {
				// Existing category
				if err := db.First(&cat, category.ID).Error; err != nil {
					c.JSON(http.StatusNotFound, gin.H{"error": fmt.Sprintf("category %d not found", category.ID)})
					return
				}
				// Update category fields if needed
				if err := db.Model(&cat).Updates(category).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to update category %d: %v", category.ID, err)})
					return
				}
			}
			categoryIDs = append(categoryIDs, cat.ID)
		}

		// Clear existing associations first (sometimes helps with constraint issues)
		if err := db.Model(&existingProduct).Association("Categories").Clear(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to clear existing categories: " + err.Error()})
			return
		}

		// Add new associations
		if len(categoryIDs) > 0 {
			categories := make([]models.Category, len(categoryIDs))
			for i, id := range categoryIDs {
				categories[i] = models.Category{Model: gorm.Model{ID: id}}
			}

			if err := db.Model(&existingProduct).Association("Categories").Append(categories); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to add new categories: " + err.Error()})
				return
			}
		}

		// Fetch and return the fully updated product
		var updatedProduct models.Product
		if err := db.Preload("Categories").Preload("Shop").
			First(&updatedProduct, productID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch updated product"})
			return
		}

		// Fetch and return the fully updated product
		var newshop models.Shop
		if err := db.
			First(&newshop, request.ShopID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch updated shop"})
			return
		}

		updatedProduct.Shop = newshop
		//db.Save(&updatedProduct)
		if err := db.Save(&updatedProduct).Error; err != nil {
			fmt.Printf("Error saving updated product: %v\n", err) // Log the error
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "failed to save product with shop association",
				"details": err.Error(),
			})
			return
		}

		fmt.Printf("ShopID before save: %d\n", updatedProduct.Shop.ID)

		//c.JSON(http.StatusOK, updatedProduct)

		// Return response
		c.JSON(http.StatusOK, gin.H{
			"product": updatedProduct,
			"shop":    newshop,
		})
	}
}

func DeleteProductBatch(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var request struct {
			IDs []uint `json:"ids"`
		}

		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		if len(request.IDs) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No products selected"})
			return
		}

		// Delete products in transaction
		err := db.Transaction(func(tx *gorm.DB) error {
			// First delete related records if needed (e.g., product_images)
			if err := tx.Where("product_id IN ?", request.IDs).Delete(&ProductImage{}).Error; err != nil {
				return err
			}

			// Then delete products
			return tx.Where("id IN ?", request.IDs).Delete(&Product{}).Error
		})

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Delete failed"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": fmt.Sprintf("%d products deleted", len(request.IDs))})
	}
}

func DeleteProductImagesBatch(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var request struct {
			IDs  []uint `json:"ids"`
			Shop Shop   `json:"shop"`
		}

		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

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

		if !IsAuthorized2(c, request.Shop) {

			//if userID != request.Shop.Owner.ID {
			c.JSON(http.StatusForbidden, gin.H{
				"error":                    "Operation not permitted",
				"details":                  "Only the shop owner or Admin can perform this action",
				"shop owner Id ":           request.Shop.Owner.ID,
				"user Id ":                 authUserID,
				"Compared: ":               request.Shop.Owner.ID == authUserID,
				"The converted authUser: ": userID,
				//"The ok value":             ok,
				//"The authUserID type is: ": authUserID.(type),
			})
			return
		}

		if len(request.IDs) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No images selected"})
			return
		}

		// First, fetch the images to get their file paths
		var images []ProductImage
		if err := db.Where("id IN ?", request.IDs).Find(&images).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch images"})
			return
		}

		if err := db.Where("id IN ?", request.IDs).Delete(&ProductImage{}).Error; err != nil {
			c.JSON(http.StatusOK, gin.H{"error": "Images delete failed"})
			return
		}

		// Delete the files from disk
		for _, image := range images {
			// Remove the leading slash from the URL to get the correct path
			filePath := strings.TrimPrefix(image.URL, "/")
			if err := os.Remove(filePath); err != nil {
				// Log the error but continue with other files
				fmt.Printf("Failed to delete file %s: %v\n", filePath, err)
			}
		}

		c.JSON(http.StatusOK, gin.H{"message": fmt.Sprintf("%d images deleted", len(request.IDs))})
	}
}

// Seed initial data
func SeedProducts(db *gorm.DB) {
	products := []Product{
		{Name: "Laptop", Price: 999.99, Description: "Del inspiron laptop", Stock: 15, ShopID: 1},
		{Name: "Phone", Price: 699.99, Description: "iPhone 16 pro 128 GB", Stock: 15, ShopID: 1},
		{Name: "Tablet", Price: 399.99, Description: "samsung table", Stock: 15, ShopID: 1},
		{Name: "Headphone", Price: 39.99, Description: "Noise cancelling headphone", Stock: 5, ShopID: 1},
	}
	for _, p := range products {
		db.Create(&p)
	}
}

//######

func SetupProductImageRoutes(r *gin.Engine, db *gorm.DB) {
	productImageRoutes := r.Group("/images/product")
	//productImageRoutes.Use(auth.AuthMiddleware())
	{
		// Single image upload
		productImageRoutes.POST("/:productId", func(c *gin.Context) {
			auth.AuthMiddleware()
			UploadProductImage(c, db)
		})

		// Multiple image uploads
		productImageRoutes.POST("/:productId/batch", func(c *gin.Context) {
			UploadProductImagesBatch(c, db)
		})

		// Get all images for a product
		productImageRoutes.GET("/:productId", func(c *gin.Context) {
			GetProductImages(c, db)
		})
	}
}

// Upload single image
func UploadProductImage(c *gin.Context, db *gorm.DB) {
	productID := c.Param("productId")
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create upload directory
	uploadPath := filepath.Join("uploads", "products", productID)
	if err := os.MkdirAll(uploadPath, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
		return
	}

	// Generate unique filename
	fileExt := filepath.Ext(file.Filename)
	filename := uuid.New().String() + fileExt
	dst := filepath.Join(uploadPath, filename)

	// Save file
	if err := c.SaveUploadedFile(file, dst); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	// Save to database
	image := ProductImage{
		ProductID: parseUint(productID),
		URL:       "/" + filepath.ToSlash(dst),
		AltText:   c.PostForm("alt_text"),
	}

	if err := db.Create(&image).Error; err != nil {
		_ = os.Remove(dst)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image record"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Image uploaded successfully",
		"image":   image,
	})
}

// Upload multiple images
func UploadProductImagesBatch(c *gin.Context, db *gorm.DB) {
	productID := c.Param("productId")
	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	files := form.File["images"]
	if len(files) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No images provided"})
		return
	}

	// Create upload directory
	uploadPath := filepath.Join("uploads", "products", productID)
	if err := os.MkdirAll(uploadPath, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
		return
	}

	var uploadedImages []ProductImage
	for _, file := range files {
		// Generate unique filename
		fileExt := filepath.Ext(file.Filename)
		filename := uuid.New().String() + fileExt
		dst := filepath.Join(uploadPath, filename)

		// Save file
		if err := c.SaveUploadedFile(file, dst); err != nil {
			continue // Skip failed files
		}

		// Create image record
		image := ProductImage{
			ProductID: parseUint(productID),
			URL:       "/" + filepath.ToSlash(dst),
			AltText:   c.PostForm("alt_text"),
		}

		if err := db.Create(&image).Error; err != nil {
			_ = os.Remove(dst)
			continue
		}

		uploadedImages = append(uploadedImages, image)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Batch upload completed",
		"count":   len(uploadedImages),
		"images":  uploadedImages,
	})
}

// Get all images for a product
func GetProductImages(c *gin.Context, db *gorm.DB) {
	productID := c.Param("productId")
	var images []ProductImage

	if err := db.Where("product_id = ? AND is_visible = ?", productID, true).Find(&images).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch images"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"count":  len(images),
		"images": images,
	})
}

func GetProductImages_2(c *gin.Context, db *gorm.DB) {
	productID := c.Param("productId")
	var images []ProductImage
	if err := db.Where("product_id = ?", productID).Find(&images).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch images"})
		return
	}

	// Add full URL to each image
	for i := range images {
		//images[i].URL = fmt.Sprintf("%s/uploads/products/%s/%s",
		images[i].URL = fmt.Sprintf("%s%s",
			c.Request.Host,
			//productID,
			images[i].URL)
	}

	//c.JSON(200, gin.H{"images": images})
	c.JSON(http.StatusOK, gin.H{
		"count":  len(images),
		"images": images,
	})
}

func parseUint(s string) uint {
	i, err := strconv.ParseUint(s, 10, 32)
	if err != nil {
		return 0
	}
	return uint(i)
}
