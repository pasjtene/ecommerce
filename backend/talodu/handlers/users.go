package handlers

import (
	"errors"
	"fmt"
	"math"
	"net/http"
	"strconv"
	"strings"
	"talodu/auth"
	"talodu/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type User = models.User
type Role = models.Role
type UserResponse struct {
	ID        uint          `json:"id"`
	Username  string        `json:"username"`
	Email     string        `json:"email"`
	FirstName string        `json:"first_name"`
	LastName  string        `json:"last_name"`
	Roles     []models.Role `json:"roles"`
}

func SetupUsersRoutes(r *gin.Engine, db *gorm.DB) {
	users := r.Group("/users")
	{
		users.POST("", auth.AuthMiddleware("SuperAdmin"), auth.RegisterUser(db)) // Only SuperAdmin
		users.GET("", auth.AuthMiddleware("Admin", "SuperAdmin"), ListUsers(db))
		users.POST("/logout", auth.AuthMiddleware("Admin"), auth.Logout(db))
		users.PUT("/:id", auth.AuthMiddleware("Admin", "SuperAdmin"), UpdateUser(db)) //update user recorsd and roles
		users.GET(":id", auth.AuthMiddleware("Admin", "SuperAdmin"), GetUser(db))
		users.GET("/roles", auth.AuthMiddleware("Admin", "SuperAdmin"), auth.GetRoles(db))
	}
}

// PUT - Update /users/:id
func UpdateUser2(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user ID from URL
		userID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}

		// Parse request body
		var req models.UpdateUserRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Start transaction
		tx := db.Begin()
		defer func() {
			if r := recover(); r != nil {
				tx.Rollback()
			}
		}()

		// Find existing user
		var user models.User
		if err := tx.Preload("Roles").First(&user, userID).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		// Update basic user info
		user.Username = req.Username
		user.FirstName = req.FirstName
		user.LastName = req.LastName
		user.Email = req.Email

		// Update roles
		var roles []models.Role
		if err := tx.Where("id IN ?", req.RoleIDs).Find(&roles).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role IDs"})
			return
		}

		// Replace all roles
		if err := tx.Model(&user).Association("Roles").Replace(roles); err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update roles"})
			return
		}

		// Save user changes
		if err := tx.Save(&user).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
			return
		}

		// Commit transaction
		if err := tx.Commit().Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction failed"})
			return
		}

		// Preload roles for response
		if err := db.Preload("Roles").First(&user, user.ID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load updated user"})
			return
		}

		frontendUser := user.ToFrontend()

		c.JSON(http.StatusOK, gin.H{
			"message": "User updated successfully",
			"user":    frontendUser,
		})
	}
}

// PUT - Update /users/:id
func UpdateUser(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {

		// Get user ID from URL
		userID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}

		// Parse request body
		var req models.UpdateUserRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Check if current user is trying to assign privileged roles
		var requestedRoles []models.Role
		if err := db.Where("id IN ?", req.RoleIDs).Find(&requestedRoles).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role IDs"})
			return
		}

		// Check if non-SuperAdmin is trying to assign Admin or SuperAdmin roles. The frontend does not allow this
		if !auth.IsSuperAdmin(c) {
			for _, role := range requestedRoles {
				if role.Name == "Admin" || role.Name == "SuperAdmin" {
					c.JSON(http.StatusForbidden, gin.H{
						"error": "Only SuperAdmin can assign Admin or SuperAdmin roles",
					})
					return
				}
			}
		}

		// Start transaction
		tx := db.Begin()
		defer func() {
			if r := recover(); r != nil {
				tx.Rollback()
			}
		}()

		// Find existing user
		var user models.User
		if err := tx.Preload("Roles").First(&user, userID).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		// Update basic user info
		user.Username = req.Username
		user.FirstName = req.FirstName
		user.LastName = req.LastName
		user.Email = req.Email

		// Update roles
		if err := tx.Model(&user).Association("Roles").Replace(&requestedRoles); err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update roles"})
			return
		}

		// Save user changes
		if err := tx.Save(&user).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
			return
		}

		// Commit transaction
		if err := tx.Commit().Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction failed"})
			return
		}

		// Preload roles for response
		if err := db.Preload("Roles").First(&user, user.ID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load updated user"})
			return
		}

		frontendUser := user.ToFrontend()

		c.JSON(http.StatusOK, gin.H{
			"message": "User updated successfully",
			"user":    frontendUser,
		})
	}
}

func ListUsers(db *gorm.DB) gin.HandlerFunc {
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

// GET - Get single user by ID /users/:id
func GetUser(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user ID from URL
		userID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "Invalid user ID",
				"details": "User ID must be a valid integer",
			})
			return
		}

		// Validate user ID
		if userID <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "Invalid user ID",
				"details": "User ID must be a positive integer",
			})
			return
		}

		// Find user with roles preloaded
		var user models.User
		if err := db.Preload("Roles").First(&user, userID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{
					"error":   "User not found",
					"details": fmt.Sprintf("User with ID %d does not exist", userID),
				})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error":   "Database error",
					"details": "Failed to retrieve user from database",
				})
			}
			return
		}

		// Convert to frontend response format.
		frontendUser := user.ToFrontend()

		c.JSON(http.StatusOK, gin.H{
			"user":    frontendUser,
			"message": "User retrieved successfully",
		})
	}
}
