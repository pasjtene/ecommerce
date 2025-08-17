// auth/mail.go
// By Pascal Tene
package auth

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

func getPreferredLanguage(c *gin.Context) string {
	// Check Accept-Language header first
	acceptLang := c.GetHeader("Accept-Language")
	if acceptLang != "" {

		return acceptLang

	}

	// Default to English
	return "en"
}

// mail.go
func SendVerificationEmail(to, verificationLink string, lang string) error {
	log.Printf("Attempting to send verification email to: %s", to)
	log.Printf("Verification link: %s", verificationLink)

	from := os.Getenv("MAIL_FROM")
	if from == "" {
		from = "no-reply@" + getHostname()
	}

	var subject string
	var messageBody string

	switch lang {
	case "fr":
		subject = "Vérifiez votre adresse email"
		messageBody = fmt.Sprintf(`<html>
<body>
    <h2>Bienvenue sur Talodu.com !</h2>
    <p>Veuillez cliquer sur le lien ci-dessous pour vérifier votre adresse email :</p>
    <p><a href="%s">%s</a></p>
    <p>Ce lien expirera dans 24 heures.</p>
</body>
</html>`, verificationLink, verificationLink)
	case "es":
		subject = "Verifica tu dirección de correo electrónico"
		messageBody = fmt.Sprintf(`<html>
<body>
    <h2>¡Bienvenido a Talodu.com!</h2>
    <p>Por favor, haz clic en el siguiente enlace para verificar tu dirección de correo electrónico:</p>
    <p><a href="%s">%s</a></p>
    <p>Este enlace expirará en 24 horas.</p>
</body>
</html>`, verificationLink, verificationLink)
	default: // English
		subject = "Verify Your Email Address"
		messageBody = fmt.Sprintf(`<html>
<body>
    <h2>Welcome to Talodu.com !</h2>
    <p>Please click the link below to verify your email address:</p>
    <p><a href="%s">%s</a></p>
    <p>This link will expire in 24 hours.</p>
</body>
</html>`, verificationLink, verificationLink)
	}

	message := fmt.Sprintf(`From: %s
To: %s
Subject: %s
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8

%s`, from, to, subject, messageBody)

	cmd := exec.Command("/usr/sbin/sendmail", "-t", "-i")
	cmd.Stdin = strings.NewReader(message)

	// Retry mechanism remains the same
	var err error
	for i := 0; i < 3; i++ {
		if err = cmd.Run(); err == nil {
			return nil
		}
		time.Sleep(2 * time.Second)
	}
	if err := cmd.Run(); err != nil {
		log.Printf("Sendmail error: %v", err)
		return err
	}

	log.Printf("Email sent successfully to: %s", to)
	return nil
}

func SendVerificationEmail2(to, verificationLink string) error {
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
    <h2>Welcome to Talodu.com !</h2>
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
			// We Don't reveal if user exists or not for security
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

		verificationLink := fmt.Sprintf(
			"%s/verify-email?token=%s&email=%s",
			os.Getenv("FRONTEND_URL"),
			verificationToken,
			user.Email,
		)

		// Send verification email
		lang := getPreferredLanguage(c)
		err := SendVerificationEmail(user.Email, verificationLink, lang)
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

func SendPasswordResetEmail(to, resetLink string) error {
	log.Printf("Attempting to send password reset email to: %s", to)
	log.Printf("Reset link: %s", resetLink)

	resetLink = "https://" + getHostname() + "/auth" + resetLink

	from := os.Getenv("MAIL_FROM")
	if from == "" {
		from = "no-reply@" + getHostname()
	}

	message := fmt.Sprintf(`From: %s
To: %s
Subject: Password Reset Request
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8

<html>
<body>
    <h2>Password Reset Request</h2>
    <p>We received a request to reset your password. Click the link below to proceed:</p>
    <p><a href="%s">%s</a></p>
    <p>This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
</body>
</html>`, from, to, resetLink, resetLink)

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
		log.Printf("Sendmail error for password reset: %v", err)
		return err
	}

	log.Printf("Password reset email sent successfully to: %s", to)
	return nil
}

func InitiatePasswordReset(db *gorm.DB) gin.HandlerFunc {
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
			// We Don't reveal if user exists or not for security
			c.JSON(http.StatusOK, gin.H{"message": "If an account exists with this email, a password reset link has been sent"})
			return
		}

		// Generate reset token
		resetToken := GenerateRandomToken(64)
		user.ResetPwToken = resetToken
		user.ResetPwExpiry = time.Now().Add(1 * time.Hour) // 1 hour expiry
		if err := db.Save(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate reset token"})
			return
		}

		resetLink := fmt.Sprintf(
			"%s/reset-password?token=%s&email=%s",
			os.Getenv("FRONTEND_URL"),
			resetToken,
			user.Email,
		)

		err := SendPasswordResetEmail(user.Email, resetLink)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send password reset email"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Password reset email sent successfully"})
	}
}

func CompletePasswordReset(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input struct {
			Token    string `json:"token" binding:"required"`
			Email    string `json:"email" binding:"required"`
			Password string `json:"password" binding:"required,min=8"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var user models.User
		if err := db.Where("email = ? AND reset_pw_token = ?", input.Email, input.Token).First(&user).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired reset token"})
			return
		}

		// Check if token is expired
		if time.Now().After(user.ResetPwExpiry) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Reset token has expired"})
			return
		}

		// Hash new password
		hashedPassword, err := HashPassword(input.Password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
			return
		}

		// Update user
		user.Password = hashedPassword
		user.ResetPwToken = ""
		user.ResetPwExpiry = time.Time{}
		if err := db.Save(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Password reset successfully"})
	}
}
