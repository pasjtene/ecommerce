// app/[lang]/auth/verify-phone/whatsapp-deeplink/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { 
  FaWhatsapp, 
  FaLink, 
  FaCopy, 
  FaCheckCircle,
  FaExternalLinkAlt,
  FaSpinner
} from 'react-icons/fa'

export default function WhatsAppDeepLinkVerification() {
  const [status, setStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [deepLink, setDeepLink] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const phone = searchParams.get('phone')
    if (phone) {
      setPhoneNumber(phone)
    }
  }, [searchParams])

  const generateDeepLink = async () => {
    if (!phoneNumber) {
      setMessage('Please enter a phone number')
      setStatus('error')
      return
    }

    setStatus('generating')
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/generate-whatsapp-deeplink`,
        { phoneNumber }
      )

      if (response.data.success) {
        setDeepLink(response.data.deepLink)
        setVerificationCode(response.data.verificationCode)
        setMessage('WhatsApp deep link generated successfully!')
        setStatus('success')
        
        // Try to open the deep link automatically
        if (response.data.deepLink) {
          window.open(response.data.deepLink, '_blank')
        }
      } else {
        setStatus('error')
        setMessage(response.data.error || 'Failed to generate WhatsApp link')
      }
    } catch (error: any) {
      setStatus('error')
      if (axios.isAxiosError(error)) {
        setMessage(error.response?.data?.error || 'Failed to generate WhatsApp link')
      } else {
        setMessage('An unexpected error occurred')
      }
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(deepLink)
      setMessage('Link copied to clipboard!')
    } catch (err) {
      setMessage('Failed to copy link')
    }
  }

  const openLink = () => {
    if (deepLink) {
      window.open(deepLink, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow border-0 rounded-4">
              <div className="card-body p-5">
                
                <div className="text-center mb-5">
                  <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-4 mb-3">
                    <FaWhatsapp className="text-success" size={32} />
                  </div>
                  <h2 className="fw-bold text-dark mb-2">WhatsApp Verification</h2>
                  <p className="text-muted">
                    We'll generate a WhatsApp message with your verification code
                  </p>
                </div>

                <div className="mb-4">
                  <label htmlFor="phone" className="form-label fw-semibold">
                    Phone Number
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <FaWhatsapp className="text-success" />
                    </span>
                    <input
                      type="tel"
                      id="phone"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="form-control form-control-lg"
                      placeholder="+1234567890"
                     // disabled={status === 'generating' || deepLink}
                    />
                  </div>
                  <div className="form-text">
                    Enter your WhatsApp number with country code
                  </div>
                </div>

                {!deepLink ? (
                  <button
                    onClick={generateDeepLink}
                    disabled={status === 'generating' || !phoneNumber}
                    className="btn btn-success btn-lg w-100 py-3 fw-semibold"
                  >
                    {status === 'generating' ? (
                      <>
                        <FaSpinner className="animate-spin me-2" />
                        Generating Link...
                      </>
                    ) : (
                      <>
                        <FaWhatsapp className="me-2" />
                        Generate WhatsApp Link
                      </>
                    )}
                  </button>
                ) : (
                  <div className="verification-section">
                    <div className="alert alert-success">
                      <FaCheckCircle className="me-2" />
                      Verification code generated: <strong>{verificationCode}</strong>
                    </div>

                    <div className="card bg-light border-0 mb-4">
                      <div className="card-body">
                        <h6 className="card-title d-flex align-items-center">
                          <FaLink className="me-2 text-muted" />
                          WhatsApp Verification Link
                        </h6>
                        <p className="text-muted small mb-2">
                          Click the link below to open WhatsApp with your verification code pre-filled:
                        </p>
                        <div className="input-group mb-3">
                          <input
                            type="text"
                            className="form-control"
                            value={deepLink}
                            readOnly
                          />
                          <button
                            onClick={copyToClipboard}
                            className="btn btn-outline-secondary"
                            type="button"
                          >
                            <FaCopy />
                          </button>
                        </div>
                        <button
                          onClick={openLink}
                          className="btn btn-success w-100"
                        >
                          <FaExternalLinkAlt className="me-2" />
                          Open in WhatsApp
                        </button>
                      </div>
                    </div>

                    <div className="d-grid gap-2">
                      <button
                        onClick={() => router.push('/auth/verify-code')}
                        className="btn btn-primary"
                      >
                        I've Sent the Message
                      </button>
                      <button
                        onClick={() => setDeepLink('')}
                        className="btn btn-outline-secondary"
                      >
                        Generate New Link
                      </button>
                    </div>
                  </div>
                )}

                {message && (
                  <div className={`alert ${status === 'error' ? 'alert-danger' : 'alert-info'} mt-4`}>
                    {message}
                  </div>
                )}

                <div className="alert alert-info mt-4">
                  <h6 className="alert-heading">How it works:</h6>
                  <ol className="mb-0 ps-3">
                    <li>We generate a special WhatsApp link with your verification code</li>
                    <li>Clicking the link opens WhatsApp with the message ready to send</li>
                    <li>Simply press send to verify your number</li>
                    
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}