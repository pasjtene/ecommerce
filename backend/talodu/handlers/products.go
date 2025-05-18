package handlers

import (
	"fmt"
	"math"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"talodu/models"

	"github.com/google/uuid"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Product = models.Product
type ProductImage = models.ProductImage

// GET /products?search=query&sort=price&page=1&limit=10
func ListProducts(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var _ = models.Product{}
		var products []models.Product

		//query := db.Model(&models.Product{})
		query := db.Model(&models.Product{}).Preload("Images").Preload("Shop", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "name") // Only load specific shop fields
		})

		// 1. Search (by name)
		if search := c.Query("search"); search != "" {
			//query = query.Where("name LIKE ?", "%"+search+"%" )

			query = query.Where(
				"name ILIKE ? OR description ILIKE ?",
				"%"+search+"%", "%"+search+"%",
			)

		}

		// ---- 3. PRICE RANGE FILTER ----
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
			query = query.Order("id") // Default sort
		}

		// 3. Pagination
		page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "5"))
		offset := (page - 1) * limit

		// Execute query
		query.Offset(offset).Limit(limit).Find(&products)
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

// GET /shops/:id/products
func GetShopProducts(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		shopID := c.Param("id")
		var products []models.Product

		query := db.
			Preload("Images").
			Preload("Categories").
			Where("shop_id = ?", shopID).
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

		// 3. Pagination
		page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "5"))
		offset := (page - 1) * limit

		// Execute query
		query.Offset(offset).Limit(limit).Find(&products)
		//  Calculate total pages
		// totalPages := int(math.Ceil(float64(totalCount) / float64(limit)))

		c.JSON(http.StatusOK, gin.H{
			"products": products,
		})
	}
}

// GET /products/:id
func GetProduct(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var product models.Product
		id := c.Param("id")

		if err := db.First(&product, id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}

		// Fetch and return the fully updated product
		var shop models.Shop
		if err := db.
			First(&shop, product.ShopID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch updated shop"})
			return
		}
		product.Shop = shop
		db.Save(&product)

		//c.JSON(http.StatusOK, product)
		// Return response
		c.JSON(http.StatusOK, gin.H{
			"product": product,
			"shop":    shop,
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

		/**
		currentUserID := c.GetUint("userID")
		if shop.OwnerID != currentUserID && !isEmployee(shop.Employees, currentUserID) {
			c.JSON(http.StatusForbidden, gin.H{"error": "No permission to add products to this shop"})
			return
		}
		*/

		product := models.Product{
			Name:        input.Name,
			Price:       input.Price,
			Description: input.Description,
			Stock:       input.Stock,
			ShopID:      input.ShopID,
		}
		//product.Slug = generateSlug(input.Name) + "-" + productID
		product.Slug = generateSlug(input.Name) + "-"

		db.Create(&product)

		c.JSON(http.StatusCreated, product)
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
		db.Save(&updatedProduct)

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
	{
		// Single image upload
		productImageRoutes.POST("/:productId", func(c *gin.Context) {
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

	if err := db.Where("product_id = ?", productID).Find(&images).Error; err != nil {
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
