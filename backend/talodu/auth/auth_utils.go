package auth

import (
	"errors"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"strings"
	"talodu/models"
	"talodu/utils/mail"
	"time"
	"unicode"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type UserResponse struct {
	ID        uint          `json:"id"`
	Username  string        `json:"username"`
	Email     string        `json:"email"`
	FirstName string        `json:"first_name"`
	LastName  string        `json:"last_name"`
	Roles     []models.Role `json:"roles"`
}

type AuthUser struct {
	ID       uint
	Username string
	Roles    []string
}

type (
	Role = models.Role
	User = models.User
)

// const JWT_SECRET = "your-secret-key-this-is-not-used-in-prod"

var JWT_SECRET string
var SUPER_USER_PASS string
var SUPER_USER_EMAIL string

var SUPER_USER_USERNAME string
var INITIAL_USER_PASS string

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}
	secret := os.Getenv("JWT_SECRET")
	super_user_pass := os.Getenv("SUPER_USER_PASS")
	super_user_email := os.Getenv("SUPER_USER_EMAIL")
	super_user_username := os.Getenv("SUPER_USER_USERNAME")
	initial_user_pass := os.Getenv("INITIAL_USER_PASS")

	if secret == "" {
		log.Fatal("FATAL: JWT_SECRET environment variable not set. Please set it before running the application.")
	}
	if super_user_pass == "" {
		log.Fatal("FATAL: SUPER_USER_PASS environment variable not set. Please set it before running the application.")
	}

	if super_user_email == "" {
		log.Fatal("FATAL: SUPER_USER_EMAIL environment variable not set. Please set it before running the application.")
	}

	JWT_SECRET = secret
	SUPER_USER_PASS = super_user_pass
	SUPER_USER_EMAIL = super_user_email
	SUPER_USER_USERNAME = super_user_username
	INITIAL_USER_PASS = initial_user_pass
}

func GetAuthUser(c *gin.Context) (*AuthUser, error) {
	tokenString := c.GetHeader("Authorization")
	if tokenString == "" {
		return nil, fmt.Errorf("no authorization header")
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		//return []byte(os.Getenv("JWT_SECRET")), nil
		return []byte(JWT_SECRET), nil
	})
	if err != nil {
		return nil, err
	}

	claims := token.Claims.(jwt.MapClaims)
	return &AuthUser{
		ID:       uint(claims["user_id"].(float64)),
		Username: claims["username"].(string),
		Roles:    convertToRoles(claims["roles"]),
	}, nil
}

func convertToRoles(roles interface{}) []string {
	var result []string
	if roles != nil {
		for _, r := range roles.([]interface{}) {
			result = append(result, r.(string))
		}
	}
	return result
}

func SeedRoles(db *gorm.DB) {
	roles := []Role{
		{Name: "SuperAdmin", Description: "Full access"},
		{Name: "Admin", Description: "Manage products and users"},
		{Name: "Sales", Description: "View products and sales data"},
		{Name: "Visitor", Description: "View products and place orders"},
	}
	for _, role := range roles {
		db.FirstOrCreate(&role, Role{Name: role.Name})
	}
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func SeedSuperAdmin(db *gorm.DB) {
	// Check if SuperAdmin already exists
	var superAdminRole Role
	db.Where("name = ?", "SuperAdmin").First(&superAdminRole)

	var existingUser User
	if err := db.Where("username = ?", "superadmin").First(&existingUser).Error; err == nil {
		return // SuperAdmin already exists
	}
	// Create SuperAdmin user
	hashedPassword, _ := HashPassword(SUPER_USER_PASS) // We must Use a strong default password
	superAdmin := User{
		Username:  "superadmin",
		Email:     SUPER_USER_EMAIL,
		FirstName: "System",
		LastName:  "Administrator",
		Password:  hashedPassword,
		Roles:     []Role{superAdminRole},
	}
	if err := db.Create(&superAdmin).Error; err != nil {
		log.Fatal("Failed to seed SuperAdmin:", err)
	}
	fmt.Println("Seeded initial SuperAdmin user")
}

func GenerateToken(user *User) (string, error) {
	// Extract role names for JWT
	var roleNames []string
	for _, role := range user.Roles {
		roleNames = append(roleNames, role.Name)
	}
	claims := jwt.MapClaims{
		"user_id":  user.ID,
		"username": user.Username,
		"roles":    roleNames, // Now an array
		"exp":      time.Now().Add(time.Hour * 24).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(JWT_SECRET))
}

const (
	AccessTokenExpiry  = time.Hour * 1      // 1 hour for access tokens
	RefreshTokenExpiry = time.Hour * 24 * 7 // 7 days for refresh tokens
	//AccessTokenExpiry  = time.Hour * 1 // 1 hour for access tokens
	//RefreshTokenExpiry = time.Hour * 2 // 2 hours for test refresh tokens
)

// GenerateTokens: this creates both access and refresh tokens
func GenerateTokens(user *User) (accessToken string, refreshToken string, err error) {
	// Access token
	accessClaims := jwt.MapClaims{
		"user_id":  user.ID,
		"username": user.Username,
		"email":    user.Email,
		"roles":    getRoleNames(user.Roles),
		"exp":      time.Now().Add(AccessTokenExpiry).Unix(),
		"type":     "access",
	}
	accessToken, err = jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims).
		SignedString([]byte(JWT_SECRET))
	if err != nil {
		return "", "", err
	}
	// Refresh token
	refreshClaims := jwt.MapClaims{
		"user_id": user.ID,
		"exp":     time.Now().Add(RefreshTokenExpiry).Unix(),
		"type":    "refresh",
	}
	refreshToken, err = jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims).
		SignedString([]byte(JWT_SECRET))

	return accessToken, refreshToken, err
}

func getRoleNames(roles []Role) []string {
	var names []string
	for _, role := range roles {
		names = append(names, role.Name)
	}
	return names
}

func Logout(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Get user ID from context (set by AuthMiddleware)
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
			return
		}

		// 2. Get the actual JWT from the request
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		// 3. Verify the token matches the user
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(JWT_SECRET), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

		// Verify that token claims match the user from context
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			return
		}

		//tokenUserID, ok := claims["user_id"].(float64) // JWT numbers are float64
		tokenUserID, ok := claims["user_id"]
		if !ok || tokenUserID != userID {
			c.JSON(http.StatusForbidden, gin.H{"error": "Token does not match authenticated user"})
			return
		}

		// Invalidate refresh token
		result := db.Model(&User{}).Where("id = ?", userID).
			Updates(map[string]interface{}{
				"refresh_token":  nil,
				"refresh_expiry": nil,
			})

		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to logout"})
			return
		}

		// Verify the user was actually updated
		if result.RowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Successfully logged out"})
	}
}

func Login(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input struct {
			Email    string `json:"email" binding:"required"`
			Password string `json:"password" binding:"required"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		var user User
		if err := db.Preload("Roles").Where("email = ?", input.Email).First(&user).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}

		// Check if user email is verified
		if !user.IsVerified {
			//c.JSON(http.StatusForbidden, gin.H{ "error": "Email not verified", "code":  "EMAIL_NOT_VERIFIED",})

			log.Printf("User not verified: %s", user.Email)

			//return
		}

		if !CheckPassword(input.Password, user.Password) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}

		accessToken, refreshToken, err := GenerateTokens(&user)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate tokens"})
			return
		}

		// Update user with refresh token

		user.RefreshToken = refreshToken
		user.RefreshExpiry = time.Now().Add(RefreshTokenExpiry)
		if err := db.Save(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store refresh token"})
			return
		}

		user.Pin = user.ID

		c.JSON(http.StatusOK, gin.H{
			"access_token":  accessToken,
			"refresh_token": refreshToken,
			"user":          user,
			"expires_in":    int(AccessTokenExpiry.Seconds()),
		})
	}
}

func RefreshToken(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get refresh token from request
		var input struct {
			RefreshToken string `json:"refresh_token" binding:"required"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		// Parse and validate refresh token
		token, err := jwt.Parse(input.RefreshToken, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(JWT_SECRET), nil
		})

		if err != nil || !token.Valid {
			//Invalid refresh token
			c.JSON(http.StatusBadRequest, gin.H{"error": "You are not connected. Please login to continue"})
			return
		}

		// Check token type
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok || claims["type"] != "refresh" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid token type"})
			return
		}

		// Get user ID from claims
		/**
		userID, ok := claims["user_id"].(string)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			return
		}
		*/

		userID, ok := claims["user_id"].(float64) // JWT numbers are float64
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid token claims"})
			return
		}

		// Verify refresh token against stored token
		var user User
		if err := db.Preload("Roles").Where("id = ? AND refresh_token = ?", userID, input.RefreshToken).First(&user).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid refresh token"})
			return
		}

		// Generate new tokens
		accessToken, refreshToken, err := GenerateTokens(&user)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate tokens"})
			return
		}

		// Update refresh token in database
		if err := db.Model(&user).Update("refresh_token", refreshToken).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store refresh token"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"access_token":  accessToken,
			"refresh_token": refreshToken,
			"expires_in":    int(AccessTokenExpiry.Seconds()),
		})
	}
}

func CheckPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func checkPasswordStrength(password string) error {
	var (
		hasMinLen  = false
		hasUpper   = false
		hasLower   = false
		hasNumber  = false
		hasSpecial = false
	)

	// First check minimum length. The password must have at least 8 char in all cases
	if len(password) < 8 {
		return errors.New("password must be at least 8 characters long")
	}

	if len(password) >= 8 {
		hasMinLen = true
	}
	for _, char := range password {
		switch {
		case unicode.IsUpper(char):
			hasUpper = true
		case unicode.IsLower(char):
			hasLower = true
		case unicode.IsNumber(char):
			hasNumber = true
		case strings.ContainsRune("!@#$%^&*()-_=+{};:,<.>/?", char):
			hasSpecial = true
		}
	}
	// Require at least 3 of 5 criteria
	criteriaMet := 0
	if hasMinLen {
		criteriaMet++
	}
	if hasUpper {
		criteriaMet++
	}
	if hasLower {
		criteriaMet++
	}
	if hasNumber {
		criteriaMet++
	}
	if hasSpecial {
		criteriaMet++
	}

	if criteriaMet < 3 {
		return errors.New("password does not meet strength requirements")
	}

	return nil
}

func RegisterUser(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		type RegisterInput struct {
			//Username  string   `json:"username" binding:"required"`
			Username  string
			Email     string   `json:"email" binding:"required,email"`
			FirstName string   `json:"first_name" binding:"required"`
			LastName  string   `json:"last_name" binding:"required"`
			Password  string   `json:"password" binding:"required"`
			Roles     []string `json:"roles"` // e.g., ["Admin", "Sales"]
		}

		var input RegisterInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Check password strength
		if err := checkPasswordStrength(input.Password); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
				"code":  "WEAK_PASSWORD",
				"details": map[string]interface{}{
					"minimum_length": 8,
					"requirements": []string{
						"At least one uppercase letter (A-Z)",
						"At least one lowercase letter (a-z)",
						"At least one number (0-9)",
						"At least one special character (!@#$%^&*)",
					},
					"required_meet": 3, // Must meet 3 of the above
				},
			})
			return
		}

		// Check if email already exists
		var existingUser User
		if err := db.Where("email = ?", input.Email).First(&existingUser).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{
				"error": "Email already registered",
				"code":  "EMAIL_EXISTS",
			})
			return
		}

		// Check if assigning restricted roles (e.g., SuperAdmin)
		currentUserRoles, _ := c.Get("roles")
		for _, roleName := range input.Roles {
			if roleName == "SuperAdmin" {
				isSuperAdmin := false
				for _, r := range currentUserRoles.([]interface{}) {
					if r.(string) == "SuperAdmin" {
						isSuperAdmin = true
						break
					}
				}
				if !isSuperAdmin {
					c.JSON(http.StatusForbidden, gin.H{"error": "Only SuperAdmin can assign SuperAdmin role"})
					return
				}
			}
		}

		// Generate verification token
		verifyToken := GenerateRandomToken(64)
		verifyExpiry := time.Now().Add(24 * time.Hour)

		// Create user
		hashedPassword, _ := HashPassword(input.Password)
		user := User{
			Username:     input.Email,
			Email:        input.Email,
			FirstName:    input.FirstName,
			LastName:     input.LastName,
			Password:     hashedPassword,
			IsVerified:   false,
			VerifyToken:  verifyToken,
			VerifyExpiry: verifyExpiry,
		}

		// Assign roles
		var roles []Role
		for _, roleName := range input.Roles {
			var role Role
			//db.Where("name = ?", roleName).First(&role)

			if err := db.Where("name = ?", roleName).First(&role).Error; err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Role '%s' not found", roleName)})
				return
			}

			roles = append(roles, role)
		}
		user.Roles = roles

		if err := db.Create(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
			return
		}

		// Send verification email
		verificationLink := fmt.Sprintf(
			"%s/verify-email?token=%s&email=%s",
			os.Getenv("FRONTEND_URL"),
			verifyToken,
			user.Email,
		)

		if err := mail.SendVerificationEmail(user.Email, verificationLink); err != nil {
			log.Printf("Failed to send verification email: %v", err)
			// Continue anyway, but log the error
		}

		//
		frontendUser := user.ToFrontend() // this is to match what React expects at frontend

		c.JSON(http.StatusCreated, gin.H{
			"message": "You have been registered successfully. Please check your email to verify your account.",
			"user":    frontendUser,
		})

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

func VerifyEmail(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.Query("token")
		email := c.Query("email")

		if token == "" || email == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Token and email are required"})
			return
		}

		var user User
		if err := db.Where("email = ? AND verify_token = ?", email, token).First(&user).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid verification token"})
			return
		}

		// Check if token is expired
		if time.Now().After(user.VerifyExpiry) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Verification token has expired"})
			return
		}

		// Mark as verified and clear token
		user.IsVerified = true
		user.VerifyToken = ""
		user.VerifyExpiry = time.Time{}

		if err := db.Save(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify email"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Email verified successfully"})
	}
}

// Pre-check if email exists
func CheckEmail(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		email := c.Query("email")
		if email == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Email parameter is required"})
			return
		}

		var user User
		if err := db.Where("email = ?", email).First(&user).Error; err == nil {
			c.JSON(http.StatusOK, gin.H{"exists": true})
		} else if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusOK, gin.H{"exists": false})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error checking email"})
		}
	}
}

func CreateUser(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		type RegisterInput struct {
			//Username  string `json:"username" binding:"required"`
			Username  string
			Email     string `json:"email" binding:"required,email"`
			FirstName string `json:"first_name" binding:"required"`
			LastName  string `json:"last_name" binding:"required"`
			//Password  string `json:"password" binding:"required"`
			Password string

			Roles []int `json:"roles"` // e.g., ["Admin", "Sales"]
		}

		var input RegisterInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		// Check if assigning restricted roles (e.g., SuperAdmin)
		currentUserRoles, _ := c.Get("roles")
		for _, roleName := range input.Roles {
			//if roleName == "SuperAdmin" {
			if roleName == 1 {
				isSuperAdmin := false
				for _, r := range currentUserRoles.([]interface{}) {
					if r.(string) == "SuperAdmin" {
						isSuperAdmin = true
						break
					}
				}
				if !isSuperAdmin {
					c.JSON(http.StatusForbidden, gin.H{"error": "Only SuperAdmin can assign SuperAdmin role"})
					return
				}
			}
		}
		// Create user
		hashedPassword, _ := HashPassword(INITIAL_USER_PASS)
		user := User{
			//Username:  input.Username,
			Username:  input.Email,
			Email:     input.Email,
			FirstName: input.FirstName,
			LastName:  input.LastName,
			Password:  hashedPassword,
		}

		// Assign roles
		var roles []Role
		for _, roleId := range input.Roles {
			var role Role
			if err := db.Where("id = ?", roleId).First(&role).Error; err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Role not found is %d ", roleId)})
				return
			}

			roles = append(roles, role)
		}
		user.Roles = roles

		db.Create(&user)

		// Return user data (excluding password)
		frontendUser := user.ToFrontend()

		c.JSON(http.StatusOK, gin.H{
			"message": "User updated successfully",
			"user":    frontendUser,
		})

	}
}

func AuthMiddleware2(requiredRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")
		if tokenString == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized Authentication required"})
			return
		}
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte(JWT_SECRET), nil
		})
		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

		claims := token.Claims.(jwt.MapClaims)
		userRoles := claims["roles"].([]interface{}) // Extract roles from JWT

		// Check if user has at least one required role
		if len(requiredRoles) > 0 {
			hasPermission := false
			for _, requiredRole := range requiredRoles {
				for _, userRole := range userRoles {
					if userRole.(string) == requiredRole {
						hasPermission = true
						break
					}
				}
			}
			if !hasPermission {
				c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
				return
			}
		}
		c.Set("userID", claims["user_id"])
		c.Set("user_id", claims["user_id"]) //Logout func checks for this
		c.Set("username", claims["username"])
		c.Set("roles", userRoles)
		c.Next()
	}
}

func AuthMiddleware(requiredRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")
		if tokenString == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			return
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte(JWT_SECRET), nil
		})

		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			return
		}

		// Extract roles
		var roles []string
		if rolesClaim, ok := claims["roles"]; ok { // Check if "roles" key exists
			if rolesSlice, ok := rolesClaim.([]interface{}); ok {
				for _, r := range rolesSlice {
					if role, ok := r.(string); ok {
						roles = append(roles, role)
					} else {
						// This case should be rare if your JWT creation is consistent
						c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid role, must be a string"})
						return
					}
				}
			} else if rolesStringSlice, ok := rolesClaim.([]string); ok { // Or directly to []string
				roles = rolesStringSlice // This is the most likely path for your JWT
			} else {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or unexpected roles format in token claims"})
				return
			}
		} else {

			// If roles are mandatory, we can uncomment this: For now some users have no roles in the system
			// c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "'roles' claim missing in token"})
			// return
		}

		// Check required roles
		if len(requiredRoles) > 0 && !HasAnyRole(roles, requiredRoles) {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
			return
		}

		// Set context values
		c.Set("userID", claims["user_id"])
		c.Set("user_id", claims["user_id"])
		//c.Set("userID", userID)
		c.Set("username", claims["username"].(string))
		c.Set("roles", roles)
		c.Next()
	}
}

// hasAnyRole checks if the user has at least one of the required roles
func HasAnyRole(userRoles []string, requiredRoles []string) bool {
	for _, requiredRole := range requiredRoles {
		for _, userRole := range userRoles {
			if userRole == requiredRole {
				return true
			}
		}
	}
	return false
}

func IsAdminOrIsSuperAdmin(c *gin.Context) bool {
	authUser, err := GetAuthUser(c)
	if err != nil {
		return false
	}

	// Check if authUser is not nil (since GetAuthUser returns a pointer)
	if authUser == nil {
		return false
	}

	for _, role := range authUser.Roles {
		if role == "SuperAdmin" || role == "Admin" {
			return true
		}
	}

	return false
}
