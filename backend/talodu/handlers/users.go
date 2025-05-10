package handlers

import (
	"fmt"
	"net/http"
	"strconv"
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

// PUT - Update /users/:id
func UpdateUser2(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var user User
		id := c.Param("id")

		if err := db.First(&user, id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		fmt.Println("Received user", user)

		var input struct {
			gorm.Model
			Username  string `gorm:"unique"`
			Email     string `gorm:"unique"`
			FirstName string
			LastName  string
			Roles     []Role `gorm:"many2many:user_roles;"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		db.Model(&user).Updates(input)
		c.JSON(http.StatusOK, user)
	}
}

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
