package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"talodu/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GET - Get all roles
// GET - Get all available roles /users/roles
func GetRoles(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var roles []models.Role

		// Fetch all roles from the database
		if err := db.Find(&roles).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Failed to fetch roles",
				"details": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, roles)
	}
}

// POST - Create new role
func CreateRole(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			Name        string `json:"name" binding:"required"`
			Description string `json:"description"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Check if role already exists
		var existingRole models.Role
		if err := db.Where("name = ?", req.Name).First(&existingRole).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "Role already exists"})
			return
		}

		role := models.Role{
			Name:        req.Name,
			Description: req.Description,
		}

		if err := db.Create(&role).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create role"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message": "Role created successfully",
			"role":    role,
		})
	}
}

// PUT - Update role
func UpdateRole(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		roleID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role ID"})
			return
		}

		var req struct {
			Name        string `json:"name" binding:"required"`
			Description string `json:"description"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var role models.Role
		if err := db.First(&role, roleID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Role not found"})
			return
		}

		// Check if new name conflicts with other roles
		if role.Name != req.Name {
			var existingRole models.Role
			if err := db.Where("name = ? AND id != ?", req.Name, roleID).First(&existingRole).Error; err == nil {
				c.JSON(http.StatusConflict, gin.H{"error": "Role name already exists"})
				return
			}
		}

		role.Name = req.Name
		role.Description = req.Description

		if err := db.Save(&role).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update role"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Role updated successfully",
			"role":    role,
		})
	}
}

// DELETE - Delete role
func DeleteRole(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		roleID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role ID"})
			return
		}

		// Check if role is assigned to any users
		var userCount int64
		db.Model(&models.User{}).Joins("JOIN user_roles ON user_roles.user_id = users.id").
			Where("user_roles.role_id = ?", roleID).Count(&userCount)

		if userCount > 0 {
			c.JSON(http.StatusConflict, gin.H{
				"error":   "Cannot delete role",
				"details": fmt.Sprintf("Role is assigned to %d users", userCount),
			})
			return
		}

		if err := db.Delete(&models.Role{}, roleID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete role"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Role deleted successfully"})
	}
}
