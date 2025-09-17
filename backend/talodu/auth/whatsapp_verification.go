package auth

// whatsapp_service.go

import (
	"fmt"
	"math/rand"
	"net/http"
	"net/url"
	"talodu/models"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type WhatsAppService1 struct {
	db *gorm.DB
}

func InitWhatsAppService(db *gorm.DB) *WhatsAppService {
	return &WhatsAppService{db: db}
}

// Generate verification code (6 digits)
func generateVerificationCode() string {
	rand.Seed(time.Now().UnixNano())
	return fmt.Sprintf("%06d", rand.Intn(1000000))
}

// Create WhatsApp deep link
func GenerateWhatsAppDeepLink(phoneNumber, message string) string {
	// URL encode the message
	encodedMessage := url.QueryEscape(message)
	return fmt.Sprintf("https://wa.me/%s?text=%s", phoneNumber, encodedMessage)
}

// Send verification code via WhatsApp
func (ws *WhatsAppService) SendVerificationCode(user *models.User) error {
	// Generate verification code
	code := generateVerificationCode()
	expiry := time.Now().Add(10 * time.Minute) // Code expires in 10 minutes

	// Update user with verification code
	user.PhoneVerificationCode = code
	user.PhoneVerificationExpiry = expiry

	if err := ws.db.Save(user).Error; err != nil {
		return err
	}

	// Create WhatsApp message
	message := fmt.Sprintf("Your Talodu verification code is: %s\n\nThis code will expire in 10 minutes.", code)

	// Generate WhatsApp deep link
	whatsappLink := GenerateWhatsAppDeepLink(user.Phone, message)

	// In a real implementation, you would:
	// 1. Use a WhatsApp Business API service (Twilio, MessageBird, etc.)
	// 2. Or trigger the deep link for the user to send manually

	fmt.Printf("WhatsApp verification link: %s\n", whatsappLink)

	// For now, we'll just log the link. In production, integrate with a WhatsApp API service.
	return nil
}

// Verify phone code
func (ws *WhatsAppService) VerifyPhoneCode(user *models.User, code string) (bool, error) {
	if user.PhoneVerificationCode != code {
		return false, nil
	}

	if time.Now().After(user.PhoneVerificationExpiry) {
		return false, fmt.Errorf("verification code has expired")
	}

	// Mark phone as verified
	user.IsPhoneVerified = true
	user.PhoneVerificationCode = ""
	user.PhoneVerificationExpiry = time.Time{}

	if err := ws.db.Save(user).Error; err != nil {
		return false, err
	}

	return true, nil
}

// Send WhatsApp verification handler
func SendWhatsAppVerificationHandler(db *gorm.DB, whatsappService *WhatsAppService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var request struct {
			Phone string `json:"phone" binding:"required"`
		}

		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		// Get user from context (assuming user is authenticated)
		userID, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			return
		}

		var user models.User
		if err := db.First(&user, userID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		// Update user's phone number
		user.Phone = request.Phone
		if err := db.Save(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update phone number"})
			return
		}

		// Send verification code
		if err := whatsappService.SendVerificationCode(&user); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send verification code"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Verification code sent successfully",
			"success": true,
		})
	}
}

// Verify phone code handler
func VerifyWhatsAppCodeHandler(db *gorm.DB, whatsappService *WhatsAppService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var request struct {
			Code string `json:"code" binding:"required"`
		}

		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		// Get user from context
		userID, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			return
		}

		var user models.User
		if err := db.First(&user, userID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		// Verify code
		success, err := whatsappService.VerifyPhoneCode(&user, request.Code)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if !success {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid verification code"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Phone verified successfully",
			"success": true,
		})
	}
}

// Resend verification code handler
func ResendWhatsAppVerificationHandler(db *gorm.DB, whatsappService *WhatsAppService) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user from context
		userID, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			return
		}

		var user models.User
		if err := db.First(&user, userID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		if user.Phone == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No phone number registered"})
			return
		}

		// Check if we need to wait before resending (rate limiting)
		if time.Since(user.PhoneVerificationExpiry) < -5*time.Minute {
			c.JSON(http.StatusTooManyRequests, gin.H{"error": "Please wait before requesting a new code"})
			return
		}

		// Send new verification code
		if err := whatsappService.SendVerificationCode(&user); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send verification code"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Verification code resent successfully",
			"success": true,
		})
	}
}
