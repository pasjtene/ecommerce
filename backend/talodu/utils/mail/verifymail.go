// utils/mail/verifymail.go
package mail

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	"strings"
	"time"
)

func SendVerificationEmail(to, verificationLink string) error {
	// Hardcode the recipient email for testing.
	log.Printf("Attempting to send verification email to: %s", to)
	log.Printf("Verification link: %s", verificationLink)

	//testRecipient := "pasjtene@yahoo.co.uk"
	testRecipient := to
	verificationLink = "https://" + getHostname() + verificationLink

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

func getHostname() string {
	hostname, err := os.Hostname()
	if err != nil {
		return "localhost"
	}
	return hostname
}
