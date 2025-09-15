package auth

import (
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/twilio/twilio-go"
	api "github.com/twilio/twilio-go/rest/api/v2010"
	"gorm.io/gorm"
)

type PhoneVerificationService struct {
	twilioClient *twilio.RestClient
	whatsappFrom string
	smsFrom      string
	db           *gorm.DB
}

// In-memory storage for verification codes (use Redis in production)
var verificationCodes = make(map[string]struct {
	code      string
	expiresAt time.Time
	verified  bool
})

func InitPhoneVerification(db *gorm.DB) *PhoneVerificationService {
	accountSID := getEnv("TWILIO_ACCOUNT_SID", "")
	authToken := getEnv("TWILIO_AUTH_TOKEN", "")
	whatsappNumber := getEnv("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886") // Default to sandbox
	smsNumber := getEnv("TWILIO_SMS_NUMBER", "")                                // Your Twilio phone number for SMS

	if accountSID == "" || authToken == "" {
		log.Println("Twilio credentials not set. Phone verification will be disabled.")
		return nil
	}

	client := twilio.NewRestClientWithParams(twilio.ClientParams{
		Username: accountSID,
		Password: authToken,
	})

	return &PhoneVerificationService{
		twilioClient: client,
		whatsappFrom: whatsappNumber,
		smsFrom:      smsNumber,
		db:           db,
	}
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

// Send verification code via WhatsApp
func (s *PhoneVerificationService) SendWhatsAppCode(phoneNumber string) (string, error) {
	toNumber := fmt.Sprintf("whatsapp:%s", formatPhoneNumber(phoneNumber))
	code := generateRandomCode(6)

	params := &api.CreateMessageParams{}
	params.SetTo(toNumber)
	params.SetFrom(s.whatsappFrom)
	params.SetBody(fmt.Sprintf("Your Talodu verification code is: %s. It will expire in 10 minutes.", code))

	resp, err := s.twilioClient.Api.CreateMessage(params)
	if err != nil {
		log.Printf("Twilio API error: %v", err)
		return "", fmt.Errorf("failed to send WhatsApp message: %v", err)
	}

	if resp != nil && resp.Sid != nil {
		log.Printf("WhatsApp message sent successfully: %s", *resp.Sid)
	}

	// Store the code with expiration time (10 minutes)
	verificationCodes[phoneNumber] = struct {
		code      string
		expiresAt time.Time
		verified  bool
	}{
		code:      code,
		expiresAt: time.Now().Add(10 * time.Minute),
		verified:  false,
	}

	log.Printf("Verification code stored for %s: %s", phoneNumber, code)
	return code, nil
}

// Send verification code via SMS
func (s *PhoneVerificationService) SendSMSCode(phoneNumber string) (string, error) {
	if s.smsFrom == "" {
		return "", fmt.Errorf("SMS verification is not configured")
	}

	code := generateRandomCode(6)

	params := &api.CreateMessageParams{}
	params.SetTo(formatPhoneNumber(phoneNumber))
	params.SetFrom(s.smsFrom)
	params.SetBody(fmt.Sprintf("Your Talodu verification code is: %s. It will expire in 10 minutes.", code))

	resp, err := s.twilioClient.Api.CreateMessage(params)
	if err != nil {
		log.Printf("Twilio API error: %v", err)
		return "", fmt.Errorf("failed to send SMS: %v", err)
	}

	if resp != nil && resp.Sid != nil {
		log.Printf("SMS sent successfully: %s", *resp.Sid)
	}

	// Store the code with expiration time (10 minutes)
	verificationCodes[phoneNumber] = struct {
		code      string
		expiresAt time.Time
		verified  bool
	}{
		code:      code,
		expiresAt: time.Now().Add(10 * time.Minute),
		verified:  false,
	}

	log.Printf("SMS verification code stored for %s: %s", phoneNumber, code)
	return code, nil
}

// Verify code
func (s *PhoneVerificationService) VerifyCode(phoneNumber, code string) (bool, error) {
	// Retrieve the stored code
	data, exists := verificationCodes[phoneNumber]
	if !exists {
		return false, fmt.Errorf("verification code not found")
	}

	// Check if code has expired
	if time.Now().After(data.expiresAt) {
		delete(verificationCodes, phoneNumber) // Clean up expired code
		return false, fmt.Errorf("verification code has expired")
	}

	// Check if code matches
	if data.code != code {
		return false, fmt.Errorf("invalid verification code")
	}

	// Code is valid, mark as verified but don't delete yet (for UI confirmation)
	data.verified = true
	verificationCodes[phoneNumber] = data

	return true, nil
}

// Helper function to generate random code
func generateRandomCode(length int) string {
	rand.Seed(time.Now().UnixNano())
	code := ""
	for i := 0; i < length; i++ {
		code += fmt.Sprintf("%d", rand.Intn(10))
	}
	return code
}

func formatPhoneNumber(phone string) string {
	// Remove any non-digit characters except +
	cleaned := ""
	for _, char := range phone {
		if char >= '0' && char <= '9' || char == '+' {
			cleaned += string(char)
		}
	}

	// Ensure it starts with +
	if len(cleaned) > 0 && cleaned[0] != '+' {
		// Add country code if missing (default to +1 for US)
		cleaned = "+1" + cleaned
	}

	return cleaned
}

func isValidPhoneNumber(phone string) bool {
	// Basic validation - should start with + and have at least 10 digits
	if len(phone) < 10 || phone[0] != '+' {
		return false
	}

	// Count digits
	digitCount := 0
	for _, char := range phone {
		if char >= '0' && char <= '9' {
			digitCount++
		}
	}

	return digitCount >= 10
}

// Handler for sending WhatsApp verification code
func SendWhatsAppVerificationHandler(db *gorm.DB, verificationService *PhoneVerificationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			PhoneNumber string `json:"phoneNumber"`
			UserID      string `json:"userId"` // Optional, if user is logged in
		}

		if err := c.BindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		// Validate phone number format
		if !isValidPhoneNumber(req.PhoneNumber) {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid phone number format. Please use international format (e.g., +1234567890)",
			})
			return
		}

		// Check if verification service is available
		if verificationService == nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{
				"error": "Phone verification is not configured. Please contact support.",
			})
			return
		}

		_, err := verificationService.SendWhatsAppCode(req.PhoneNumber)
		if err != nil {
			log.Printf("Error sending WhatsApp verification: %v", err)

			// Check if it's a Twilio error
			if strings.Contains(err.Error(), "twilio") {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Failed to send verification code. Please try again or use SMS.",
				})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": err.Error(),
				})
			}
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Verification code sent via WhatsApp",
		})
	}
}

// Handler for sending SMS verification code
func SendSMSVerificationHandler(db *gorm.DB, verificationService *PhoneVerificationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			PhoneNumber string `json:"phoneNumber"`
			UserID      string `json:"userId"` // Optional, if user is logged in
		}

		if err := c.BindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		// Validate phone number format
		if !isValidPhoneNumber(req.PhoneNumber) {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid phone number format. Please use international format (e.g., +1234567890)",
			})
			return
		}

		// Check if verification service is available
		if verificationService == nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{
				"error": "Phone verification is not configured. Please contact support.",
			})
			return
		}

		_, err := verificationService.SendSMSCode(req.PhoneNumber)
		if err != nil {
			log.Printf("Error sending SMS verification: %v", err)

			// Check if it's a Twilio error
			if strings.Contains(err.Error(), "twilio") {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Failed to send verification code. Please try again later.",
				})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": err.Error(),
				})
			}
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Verification code sent via SMS",
		})
	}
}

// Handler for verifying code
func VerifyPhoneCodeHandler(db *gorm.DB, verificationService *PhoneVerificationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			PhoneNumber string `json:"phoneNumber"`
			Code        string `json:"code"`
			UserID      string `json:"userId"` // Optional, if user is logged in
		}

		if err := c.BindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		// Validate code format
		if len(req.Code) != 6 {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Verification code must be 6 digits",
			})
			return
		}

		// Check if verification service is available
		if verificationService == nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{
				"error": "Phone verification is not configured",
			})
			return
		}

		verified, err := verificationService.VerifyCode(req.PhoneNumber, req.Code)
		if err != nil {
			log.Printf("Error verifying code: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if verified {
			// Update user's phone verification status in database if userID is provided
			if req.UserID != "" {
				// Update user's phone number and verification status
				result := db.Model(&User{}).Where("id = ?", req.UserID).Updates(map[string]interface{}{
					"phone":          req.PhoneNumber,
					"phone_verified": true,
				})

				if result.Error != nil {
					log.Printf("Error updating user phone verification: %v", result.Error)
					c.JSON(http.StatusInternalServerError, gin.H{
						"error": "Failed to update user profile",
					})
					return
				}
			}

			c.JSON(http.StatusOK, gin.H{
				"success": true,
				"message": "Phone number verified successfully",
			})
		} else {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error":   "Invalid verification code",
			})
		}
	}
}
