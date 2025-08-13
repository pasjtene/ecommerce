// utils/mail/verifymail.go
package mail

import (
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"os/exec"
	"strings"
	"talodu/models"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SendVerificationEmail(to, verificationLink string) error {
	// Hardcode the recipient email for testing.
	log.Printf("Attempting to send verification email to: %s", to)
	log.Printf("Verification link: %s", verificationLink)

	testRecipient := to
	verificationLink = "https://" + getHostname() + "/auth" + verificationLink

	from := os.Getenv("MAIL_FROM")
	if from == "" {
		from = "no-reply@" + getHostname()
	}

	message := fmt.Sprintf(`From: %s
To: %s
Subject: Verify Your Email Address
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8

<html>
<body>
    <h2>Welcome to Our Service!</h2>
    <p>Please click the link below to verify your email address:</p>
    <p><a href="%s">%s</a></p>
    <p>This link will expire in 24 hours.</p>
</body>
</html>`, from, testRecipient, verificationLink, verificationLink)

	cmd := exec.Command("/usr/sbin/sendmail", "-t", "-i")
	cmd.Stdin = strings.NewReader(message)

	// Retry mechanism
	var err error
	for i := 0; i < 3; i++ {
		if err = cmd.Run(); err == nil {
			return nil
		}
		time.Sleep(2 * time.Second)
	}
	if err := cmd.Run(); err != nil {
		log.Printf("Sendmail error: %v", err) // Add this line
		return err
	}

	log.Printf("Email sent successfully to: %s", to)

	return fmt.Errorf("failed to send email: %v", err)
}

func ResendVerificationEmail(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input struct {
			Email string `json:"email" binding:"required"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var user models.User
		if err := db.Where("email = ?", input.Email).First(&user).Error; err != nil {
			// Don't reveal if user exists or not for security
			c.JSON(http.StatusOK, gin.H{"message": "If an account exists with this email, a verification email has been sent"})
			return
		}

		if user.IsVerified {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Email is already verified"})
			return
		}

		// Generate new verification token
		verificationToken := GenerateRandomToken(64)
		user.VerifyToken = verificationToken
		user.VerifyExpiry = time.Now().Add(24 * time.Hour) // 24 hours expiry
		if err := db.Save(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update verification token"})
			return
		}

		// Send verification email (implement your email sending logic here)
		err := SendVerificationEmail(user.Email, verificationToken)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send verification email"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Verification email resent successfully"})
	}
}

func GenerateRandomToken(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
}

func getHostname() string {
	hostname, err := os.Hostname()
	if err != nil {
		return "localhost"
	}
	return hostname
}
