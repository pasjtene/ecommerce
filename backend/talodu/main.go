package main

import (
	"fmt"
	"log"
	"math"
	"net/http"
	"os"
	"strconv"
	"strings"

	"talodu/handlers"
	s "talodu/settings"
	"talodu/utils/mail"

	//_ "talodu/handlers"
	"talodu/auth"
	"talodu/models"

	//_ "talodu/models"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"gorm.io/gorm"
)

type (
	Product  = models.Product
	User     = models.User
	Role     = models.Role
	Shop     = models.Shop
	Category = models.Category
)

func main() {
	s.ConnectDB()
	if s.DB == nil {
		log.Fatalf("Database connection failed during initialization")
		return
	}

	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	s.DB.AutoMigrate(
		&Shop{},
		&models.User{},
		&Role{},
		&models.Product{},
		&models.Category{},
		&models.ProductImage{},
		&models.ProductTranslation{},
		&models.ProductAbout{},
	)

	// Seed initial data
	//handlers.SeedProducts(s.DB)
	// handlers.SeedShopsProductsAndCategories(s.DB)
	// Seed Roles
	auth.SeedRoles(s.DB)
	auth.SeedSuperAdmin(s.DB)

	r := gin.Default()
	allowedOrigin := os.Getenv("allowedOrigin")
	//allowedOrigin := "http://localhost:3000"
	fmt.Println("The origin is ", allowedOrigin)
	r.Use(func(c *gin.Context) {
		allowedOrigins := []string{
			"http://162.19.227.240",      // Nginx port 80
			"http://162.19.227.240:3000", // React dev server
			"https://talodu.com",
			"https://www.talodu.com",
			"http://localhost:3000",
			"http://localhost:3001", // Add other domains as needed
			//"http://127.0.0.1:*",
			//"http://localhost:*",
			//"http://localhost:64518",
		}
		origin := c.Request.Header.Get("Origin")
		for _, allowedOrigin := range allowedOrigins {
			if origin == allowedOrigin {
				c.Writer.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
				c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
				c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
				c.Writer.Header().Set("Access-Control-Allow-Credentials", "true") // If using cookies

				if c.Request.Method == "OPTIONS" {
					c.AbortWithStatus(http.StatusNoContent)
					return
				}
				break
			}
		}
		c.Next()
	})

	// Auth routes
	r.POST("/register", auth.RegisterUser(s.DB))
	r.POST("/user", auth.CreateUser(s.DB))
	r.POST("/login", auth.Login(s.DB))
	r.POST("/logout", auth.AuthMiddleware(), auth.Logout(s.DB))
	r.POST("/refresh", auth.RefreshToken(s.DB))

	// Protected routes
	products := r.Group("/products")
	{
		products.GET("", handlers.ListProducts(s.DB))
		products.POST("", auth.AuthMiddleware("Admin", "SuperAdmin"), handlers.CreateProduct(s.DB))
		products.DELETE(":id", auth.AuthMiddleware("Admin", "SuperAdmin"), handlers.DeleteProduct(s.DB))
		products.DELETE("/delete/batch", auth.AuthMiddleware("Admin", "SuperAdmin"), handlers.DeleteProductBatch(s.DB))
		products.DELETE("/images/delete/batch", auth.AuthMiddleware(), handlers.DeleteProductImagesBatch(s.DB))
		products.POST("/translate/:id", auth.AuthMiddleware(), handlers.CreateProductTranslation(s.DB))
		products.POST("/abouts/:id", auth.AuthMiddleware(), handlers.CreateProductAbout(s.DB))
		products.PUT("/abouts/order/:id", auth.AuthMiddleware(), handlers.UpdateProductAboutOrder(s.DB))

		products.GET(":id", handlers.GetProduct(s.DB)) // Get single product
		products.GET("/abouts/:productId", handlers.GetProductAbouts(s.DB))
		products.PUT(":id", auth.AuthMiddleware(), handlers.UpdateProduct(s.DB)) // Update
		// Add translation to an about entry
		products.POST("/:id/abouts/:aboutId/translations",
			auth.AuthMiddleware(), handlers.CreateProductAboutTranslation(s.DB))

		// Get translations for an about entry
		products.GET("/:id/abouts/:aboutId/translations", handlers.GetProductAboutTranslations(s.DB))

		// Update a translation
		products.PUT("/:id/abouts/:aboutId/translations/:translationId",
			auth.AuthMiddleware(), handlers.UpdateProductAboutTranslation(s.DB))
	}

	// Cart routes
	cartRoutes := r.Group("/cart")
	cartRoutes.Use(auth.AuthMiddleware()) // All cart routes require authentication
	{
		cartRoutes.GET("/", handlers.GetCart(s.DB))
		cartRoutes.POST("/", handlers.AddToCart(s.DB))
		cartRoutes.PUT("/:id", handlers.UpdateCartItem(s.DB))
		cartRoutes.DELETE("/:id", handlers.RemoveFromCart(s.DB))
		cartRoutes.DELETE("/", handlers.ClearCart(s.DB))
	}

	// Order routes
	orderRoutes := r.Group("/orders")
	orderRoutes.Use(auth.AuthMiddleware()) // All order routes require authentication
	{
		orderRoutes.POST("/", handlers.CreateOrderFromCart(s.DB))
		orderRoutes.GET("/user", handlers.GetUserOrders(s.DB)) // User's own orders

		// Admin-only routes
		adminOrderRoutes := orderRoutes.Group("/")
		adminOrderRoutes.Use(auth.AuthMiddleware("Admin", "SuperAdmin")) // Additional role check
		{
			adminOrderRoutes.GET("/", handlers.GetOrders(s.DB))
			adminOrderRoutes.GET("/:id", handlers.GetOrderDetails(s.DB))
			adminOrderRoutes.PUT("/:id/status", handlers.UpdateOrderStatus(s.DB))
		}
	}

	// Get product categories
	r.GET("/categories", func(c *gin.Context) {
		var categories []Category
		if err := s.DB.Find(&categories).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch categories"})
			return
		}
		c.JSON(http.StatusOK, categories)
	})

	//images routes
	// https://talodu.com:8888/uploads/products/80/679d3551-7857-4b85-b648-cc84335e61a1.png

	handlers.SetupProductImageRoutes(r, s.DB)

	// In your routes
	r.GET("/products/ps/:slug", func(c *gin.Context) {
		slug := c.Param("slug")

		// Extract ID from slug (last part after last hyphen)
		parts := strings.Split(slug, "-")
		productID := parts[len(parts)-1]

		var product Product
		if err := s.DB.Where("id = ?", productID).First(&product).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}
		// Verify the slug matches (redirect if not)
		if product.Slug != slug {
			c.Redirect(http.StatusMovedPermanently, "/products/"+product.Slug)
			return
		}

		c.JSON(http.StatusOK, product)
	})

	shops := r.Group("/shops")
	{
		shops.POST("", auth.AuthMiddleware(), handlers.CreateShop(s.DB))
		shops.POST("/:id/employees", auth.AuthMiddleware(), handlers.AddShopEmployee2(s.DB))
		shops.GET("", auth.AuthMiddleware(), handlers.ListShops(s.DB))
		shops.GET("/all", auth.AuthMiddleware("Admin", "SuperAdmin"), handlers.ListShops(s.DB))
		shops.GET(":id", handlers.GetShop(s.DB))
		shops.PUT(":id", handlers.UpdateShop(s.DB))
		shops.GET(":id/products", handlers.GetShopProducts(s.DB))
		shops.DELETE("/:id", auth.AuthMiddleware(), handlers.DeleteShop(s.DB))
	}

	r.Static("/uploads", "./uploads")

	users := r.Group("/users")
	{
		users.POST("", auth.AuthMiddleware("SuperAdmin"), auth.RegisterUser(s.DB)) // Only SuperAdmin
		users.GET("", auth.AuthMiddleware("Admin", "SuperAdmin"), listUsers(s.DB))
		users.POST("/logout", auth.AuthMiddleware("Admin"), auth.Logout(s.DB))
		users.PUT("/:id", auth.AuthMiddleware("Admin", "SuperAdmin"), handlers.UpdateUser(s.DB))
	}

	authRoutes := r.Group("/auth")
	{
		authRoutes.POST("/register", auth.RegisterUser(s.DB))

		authRoutes.POST("/logout", auth.AuthMiddleware(), auth.Logout(s.DB))
		authRoutes.POST("/refresh", auth.RefreshToken(s.DB))
		authRoutes.GET("/check-email", auth.CheckEmail(s.DB))   //check for email already exist
		authRoutes.GET("/verify-email", auth.VerifyEmail(s.DB)) // user receives verification email
		authRoutes.POST("/resend-verification", mail.ResendVerificationEmail(s.DB))
	}

	// Routes
	// r.GET("/products", listProducts(db))         // List with search/sort/pagination

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Home page",
		})
	})

	r.GET("/go", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Yes, gone",
		})
	})

	//r.Run() // listen and serve on 0.0.0.0:8080
	r.Run(":8888")

}

func listUsers(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var users []User

		// Pagination
		page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
		searchTerm := c.Query("search")
		offset := (page - 1) * limit

		// Base query
		query := db.Preload("Roles")
		// Add search conditions if search term exists
		if searchTerm != "" {
			searchPattern := "%" + strings.ToLower(searchTerm) + "%"
			query = query.Where(
				"LOWER(username) LIKE ? OR "+
					"LOWER(email) LIKE ? OR "+
					"LOWER(first_name) LIKE ? OR "+
					"LOWER(last_name) LIKE ? OR "+
					"EXISTS (SELECT 1 FROM roles JOIN user_roles ON roles.id = user_roles.role_id "+
					"WHERE user_roles.user_id = users.id AND LOWER(roles.name) LIKE ?)",
				searchPattern, searchPattern, searchPattern, searchPattern, searchPattern,
			)
		}

		// Execute query with pagination
		result := query.Offset(offset).Limit(limit).Find(&users)
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
			return
		}

		// Total count (with same search conditions)
		var totalCount int64
		countQuery := db.Model(&User{})
		if searchTerm != "" {
			searchPattern := "%" + strings.ToLower(searchTerm) + "%"
			countQuery = countQuery.Where(
				"LOWER(username) LIKE ? OR "+
					"LOWER(email) LIKE ? OR "+
					"LOWER(first_name) LIKE ? OR "+
					"LOWER(last_name) LIKE ? OR "+
					"EXISTS (SELECT 1 FROM roles JOIN user_roles ON roles.id = user_roles.role_id "+
					"WHERE user_roles.user_id = users.id AND LOWER(roles.name) LIKE ?)",
				searchPattern, searchPattern, searchPattern, searchPattern, searchPattern,
			)
		}
		countQuery.Count(&totalCount)

		totalPages := int(math.Ceil(float64(totalCount) / float64(limit)))

		// Format response (exclude passwords)
		var userResponses []auth.UserResponse
		for _, user := range users {
			userResponses = append(userResponses, auth.UserResponse{
				ID:        user.ID,
				Username:  user.Username,
				Email:     user.Email,
				FirstName: user.FirstName,
				LastName:  user.LastName,
				Roles:     user.Roles,
			})
		}

		c.JSON(http.StatusOK, gin.H{
			"users":      userResponses,
			"page":       page,
			"limit":      limit,
			"totalItems": totalCount,
			"totalPages": totalPages,
		})
	}
}
