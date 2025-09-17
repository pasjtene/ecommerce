// whatsapp_deeplink_verification.go
package auth

import (
	"fmt"
	"math/rand"
	"net/http"
	"net/url"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type WhatsAppService struct {
	db *gorm.DB
}

func InitWhatsAppService2(db *gorm.DB) *WhatsAppService {
	return &WhatsAppService{db: db}
}

// Generate verification code (6 digits)
func generateVerificationCode2() string {
	rand.New(rand.NewSource(time.Now().UnixNano()))
	return fmt.Sprintf("%06d", rand.Intn(1000000))
}

// Format phone number for WhatsApp (remove non-digit characters)
func formatPhoneNumber2(phone string) string {
	// Remove any non-digit characters
	formatted := ""
	for _, char := range phone {
		if char >= '0' && char <= '9' {
			formatted += string(char)
		}
	}
	return formatted
}

// Create WhatsApp deep link with pre-filled message
func GenerateWhatsAppDeepLink2(phoneNumber, message string) string {
	// Format phone number (remove any non-digit characters)
	formattedPhone := formatPhoneNumber(phoneNumber)

	// URL encode the message
	encodedMessage := url.QueryEscape(message)

	// Create WhatsApp deep link
	// Format: https://wa.me/<number>?text=<message>
	return fmt.Sprintf("https://wa.me/%s?text=%s", formattedPhone, encodedMessage)
}

// Generate and store verification code
func (ws *WhatsAppService) GenerateVerificationCode(userID uint) (string, string, error) {
	// Generate verification code
	code := generateVerificationCode()
	expiry := time.Now().Add(10 * time.Minute) // Code expires in 10 minutes

	var user User
	if err := ws.db.First(&user, userID).Error; err != nil {
		return "", "", err
	}

	// Update user with verification code
	user.WhatsAppVerificationCode = code
	user.WhatsAppVerificationExpiry = expiry

	if err := ws.db.Save(&user).Error; err != nil {
		return "", "", err
	}

	// Create WhatsApp message
	message := fmt.Sprintf("Your Talodu verification code is: %s\n\nThis code will expire in 10 minutes.", code)

	// Generate WhatsApp deep link
	whatsappLink := GenerateWhatsAppDeepLink(user.Phone, message)

	return code, whatsappLink, nil
}

// Verify WhatsApp code
func (ws *WhatsAppService) VerifyCode(userID uint, code string) (bool, error) {
	var user User
	if err := ws.db.First(&user, userID).Error; err != nil {
		return false, err
	}

	// Check if code matches
	if user.WhatsAppVerificationCode != code {
		return false, nil
	}

	// Check if code has expired
	if time.Now().After(user.WhatsAppVerificationExpiry) {
		return false, fmt.Errorf("verification code has expired")
	}

	// Mark WhatsApp as verified
	user.IsWhatsAppVerified = true
	user.WhatsAppVerificationCode = ""
	user.WhatsAppVerificationExpiry = time.Time{}

	if err := ws.db.Save(&user).Error; err != nil {
		return false, err
	}

	return true, nil
}

// Check if user can request new code (rate limiting)
func (ws *WhatsAppService) CanRequestNewCode(userID uint) (bool, time.Duration) {
	var user User
	if err := ws.db.First(&user, userID).Error; err != nil {
		return true, 0
	}

	// Allow new request if code is expired or about to expire
	if user.WhatsAppVerificationExpiry.IsZero() || time.Now().After(user.WhatsAppVerificationExpiry.Add(-5*time.Minute)) {
		return true, 0
	}

	// Calculate remaining time until can request again
	remaining := time.Until(user.WhatsAppVerificationExpiry.Add(-5 * time.Minute))
	return false, remaining
}

// whatsapp_handlers.go

type WhatsAppRequest struct {
	Phone string `json:"phone" binding:"required"`
}

type WhatsAppVerifyRequest struct {
	Code string `json:"code" binding:"required"`
}

// Send WhatsApp verification handler
func SendWhatsAppVerificationHandler2(db *gorm.DB, whatsappService *WhatsAppService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var request WhatsAppRequest

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

		// Check rate limiting
		canRequest, remaining := whatsappService.CanRequestNewCode(userID.(uint))
		if !canRequest {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":               "Please wait before requesting a new code",
				"retry_after_seconds": int(remaining.Seconds()),
			})
			return
		}

		// Update user's phone number
		var user User
		if err := db.First(&user, userID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		user.Phone = request.Phone
		if err := db.Save(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update phone number"})
			return
		}

		// Generate verification code and WhatsApp link
		code, whatsappLink, err := whatsappService.GenerateVerificationCode(userID.(uint))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate verification code"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "WhatsApp verification ready",
			"success": true,
			"data": gin.H{
				"whatsapp_link": whatsappLink,
				"code":          code, // For development/testing only - remove in production
				"expires_in":    "10 minutes",
			},
		})
	}
}

// Verify WhatsApp code handler
func VerifyWhatsAppCodeHandler2(db *gorm.DB, whatsappService *WhatsAppService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var request WhatsAppVerifyRequest

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

		// Verify code
		success, err := whatsappService.VerifyCode(userID.(uint), request.Code)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if !success {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid verification code"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "WhatsApp verified successfully",
			"success": true,
		})
	}
}

// Get verification status handler
func GetWhatsAppStatusHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user from context
		userID, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			return
		}

		var user User
		if err := db.First(&user, userID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"is_verified": user.IsWhatsAppVerified,
			"phone":       user.Phone,
		})
	}
}
