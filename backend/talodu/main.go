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

	//_ "talodu/handlers"
	"talodu/auth"
	"talodu/models"

	//_ "talodu/models"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"gorm.io/gorm"
)

type (
	Product = models.Product
	User    = models.User
	Role    = models.Role
	Shop    = models.Shop
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

	s.DB.AutoMigrate(&Shop{}, &models.User{}, &Role{}, &models.Product{}, &models.Category{}, &models.ProductImage{})

	// Seed initial data
	//handlers.SeedProducts(s.DB)
	handlers.SeedShopsProductsAndCategories(s.DB)
	// Seed Roles
	auth.SeedRoles(s.DB)
	auth.SeedSuperAdmin(s.DB)

	r := gin.Default()
	allowedOrigin := os.Getenv("allowedOrigin")
	//allowedOrigin := "http://162.19.227.240:3000"
	//allowedOrigin := "http://localhost:3000"
	fmt.Println("The origin is ", allowedOrigin)
	r.Use(func(c *gin.Context) {
		allowedOrigins := []string{
			"http://162.19.227.240",      // Nginx port 80
			"http://162.19.227.240:3000", // React dev server
			"https://talodu.com",
			"https://www.talodu.com",
			"http://localhost:3000", // Add other domains as needed
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
	r.POST("/login", auth.Login2(s.DB))
	r.POST("/logout", auth.AuthMiddleware(), auth.Logout(s.DB))
	r.POST("/refresh", auth.RefreshToken(s.DB))

	// Protected routes
	products := r.Group("/products")
	{
		products.GET("", handlers.ListProducts(s.DB))
		products.POST("", auth.AuthMiddleware("Admin", "SuperAdmin"), handlers.CreateProduct(s.DB))
		products.DELETE(":id", auth.AuthMiddleware("Admin", "SuperAdmin"), handlers.DeleteProduct(s.DB))
		products.GET(":id", handlers.GetProduct(s.DB))                                                         // Get single product
		products.PUT(":id", auth.AuthMiddleware("Sales", "Admin", "SuperAdmin"), handlers.UpdateProduct(s.DB)) // Update
	}

	//images routes
	// https://talodu.com:8888/uploads/products/80/679d3551-7857-4b85-b648-cc84335e61a1.png

	handlers.SetupProductImageRoutes(r, s.DB)

	shops := r.Group("/shops")
	{
		shops.POST("", auth.AuthMiddleware("Admin", "SuperAdmin"), handlers.CreateShop(s.DB))
		shops.POST("/:id/employees", auth.AuthMiddleware(), handlers.AddShopEmployee2(s.DB))
		shops.GET("", handlers.ListShops(s.DB))
	}

	r.Static("/uploads", "./uploads")

	users := r.Group("/users")
	{
		users.POST("", auth.AuthMiddleware("SuperAdmin"), auth.RegisterUser(s.DB)) // Only SuperAdmin
		users.GET("", auth.AuthMiddleware("Admin", "SuperAdmin"), listUsers(s.DB))
		users.POST("/logout", auth.AuthMiddleware("Admin"), auth.Logout(s.DB))
		users.PUT("/:id", auth.AuthMiddleware("Admin", "SuperAdmin"), handlers.UpdateUser(s.DB))
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
