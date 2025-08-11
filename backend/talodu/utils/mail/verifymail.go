// utils/mail/verifymail.go
package mail

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"
	"strings"
	"time"
)

func SendVerificationEmail2(to, verificationLink string) error {
	from := os.Getenv("MAIL_FROM")
	if from == "" {
		from = "no-reply@" + getHostname()
	}

	subject := "Verify Your Email Address"
	body := fmt.Sprintf(`
From: %s
To: %s
Subject: %s
MIME-version: 1.0
Content-Type: text/html; charset=UTF-8

<html>
<body>
    <h2>Welcome to Our Service!</h2>
    <p>Please click the link below to verify your email address:</p>
    <p><a href="%s">%s</a></p>
    <p>This link will expire in 24 hours.</p>
</body>
</html>
`, from, to, subject, verificationLink, verificationLink)

	cmd := exec.Command("/usr/sbin/sendmail", "-t", "-i")
	cmd.Stdin = bytes.NewBufferString(body)

	// Retry mechanism (3 attempts)
	var err error
	for i := 0; i < 3; i++ {
		if err = cmd.Run(); err == nil {
			return nil
		}
		time.Sleep(2 * time.Second)
	}

	return fmt.Errorf("failed to send verification email via exim4: %v", err)
}

func SendVerificationEmail(to, verificationLink string) error {
	from := os.Getenv("MAIL_FROM")
	if from == "" {
		from = "no-reply@" + getHostname()
	}

	// Proper MIME format
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
</html>`, from, to, verificationLink, verificationLink)

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
	return fmt.Errorf("failed to send email: %v", err)
}

func getHostname() string {
	hostname, err := os.Hostname()
	if err != nil {
		return "localhost"
	}
	return hostname
}
