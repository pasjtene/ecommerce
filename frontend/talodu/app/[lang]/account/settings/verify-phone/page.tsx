// app/[lang]/account/settings/verify-phone/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaSpinner, 
  FaWhatsapp, 
  FaSms, 
  FaPhone, 
  FaArrowLeft,
  FaEnvelope,
  FaShieldAlt
} from 'react-icons/fa'
import { useAuth } from '../../../contexts/AuthContextNext'

type VerificationMethod = 'whatsapp' | 'sms' | null;

export default function VerifyPhone() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'verifying' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, token } = useAuth()

  // Pre-fill phone number from query params if available
  useEffect(() => {
    const phone = searchParams.get('phone')
    if (phone) {
      setPhoneNumber(phone)
    }
  }, [searchParams])

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const sendVerificationCode = async (method: VerificationMethod) => {
    if (!phoneNumber) {
      setMessage('Please enter a phone number')
      setStatus('error')
      return
    }

    if (!method) {
      setMessage('Please select a verification method')
      setStatus('error')
      return
    }

    setStatus('sending')
    setVerificationMethod(method)
    
    try {
      const endpoint = method === 'whatsapp' 
        ? '/auth/send-whatsapp-verification'
        : '/auth/send-sms-verification'
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`,
        { 
          phoneNumber,
          userId: user?.id // If user is logged in
        }
      )

      if (response.data.success) {
        setMessage(`Verification code sent via ${method === 'whatsapp' ? 'WhatsApp' : 'SMS'}!`)
        setStatus('idle')
        setCountdown(60) // 60 seconds countdown for resend
      } else {
        setStatus('error')
        setMessage(response.data.error || `Failed to send ${method === 'whatsapp' ? 'WhatsApp' : 'SMS'} verification code`)
      }
    } catch (error: any) {
      setStatus('error')
      if (axios.isAxiosError(error)) {
        setMessage(error.response?.data?.error || `Failed to send ${method === 'whatsapp' ? 'WhatsApp' : 'SMS'} verification code`)
      } else {
        setMessage('An unexpected error occurred')
      }
    }
  }

  const verifyCode = async () => {
    if (!code) {
      setMessage('Please enter the verification code')
      setStatus('error')
      return
    }

    setStatus('verifying')
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/verify-phone`,
        { 
          phoneNumber,
          code,
          userId: user?.id // If user is logged in
        }
      )

      if (response.data.success) {
        setStatus('success')
        setMessage(response.data.message || 'Phone number verified successfully!')
        
        // Redirect after 5 seconds
        setTimeout(() => {
          if (user) {
            router.push('/account/settings')
          } else {
            router.push('/auth/login')
          }
        }, 5000)
      } else {
        setStatus('error')
        setMessage(response.data.error || 'Verification failed')
      }
    } catch (error: any) {
      setStatus('error')
      if (axios.isAxiosError(error)) {
        setMessage(error.response?.data?.error || 'Failed to verify code')
      } else {
        setMessage('An unexpected error occurred')
      }
    }
  }

  return (
    <div className="min-h-screen bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            
            {/* Back Button */}
            <button 
              onClick={() => router.back()} 
              className="btn btn-outline-secondary mb-4 d-flex align-items-center"
            >
              <FaArrowLeft className="me-2" /> Back
            </button>

            <div className="card shadow border-0 rounded-4">
              <div className="card-body p-5">
                
                {/* Header Section */}
                <div className="text-center mb-5">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-4 mb-3">
                    <FaShieldAlt className="text-primary" size={32} />
                  </div>
                  <h2 className="fw-bold text-dark mb-2">Verify Your Phone Number</h2>
                  <p className="text-muted">
                    We'll send a verification code to your phone for added security
                  </p>
                </div>

                {status === 'success' ? (
                  <div className="text-center py-4">
                    <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-4 mb-3">
                      <FaCheckCircle className="text-success" size={32} />
                    </div>
                    <h4 className="fw-semibold text-success mb-2">Verification Successful!</h4>
                    <p className="text-muted mb-4">{message}</p>
                    <div className="progress mb-3" style={{height: '4px'}}>
                      <div 
                        className="progress-bar bg-success" 
                        role="progressbar" 
                        style={{width: '100%'}} 
                        aria-valuenow={100} 
                        aria-valuemin={0} 
                        aria-valuemax={100}
                      ></div>
                    </div>
                    <p className="text-muted small">Redirecting to account settings...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    
                    {/* Phone Input */}
                    <div className="mb-4">
                      <label htmlFor="phone" className="form-label fw-semibold">
                        <FaPhone className="me-2 text-primary" />
                        Phone Number
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <FaPhone className="text-muted" />
                        </span>
                        <input
                          type="tel"
                          id="phone"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="form-control form-control-lg"
                          placeholder="+1234567890"
                          disabled={countdown > 0}
                        />
                      </div>
                      <div className="form-text">
                        Please include your country code (e.g., +1 for US/Canada, +44 for UK)
                      </div>
                    </div>

                    {countdown > 0 ? (
                      <>
                        {/* Verification Code Input */}
                        <div className="mb-4">
                          <label htmlFor="code" className="form-label fw-semibold">
                            <FaEnvelope className="me-2 text-primary" />
                            Verification Code
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-light">
                              <FaShieldAlt className="text-muted" />
                            </span>
                            <input
                              type="text"
                              id="code"
                              value={code}
                              onChange={(e) => setCode(e.target.value)}
                              className="form-control form-control-lg"
                              placeholder="Enter 6-digit code"
                              maxLength={6}
                            />
                          </div>
                          <div className="form-text">
                            Sent via {verificationMethod === 'whatsapp' ? 'WhatsApp' : 'SMS'}. Check your messages.
                          </div>
                        </div>

                        {/* Verify Button */}
                        <button
                          onClick={verifyCode}
                          disabled={status === 'verifying'}
                          className="btn btn-primary btn-lg w-100 py-3 mb-3 fw-semibold"
                        >
                          {status === 'verifying' ? (
                            <>
                              <FaSpinner className="animate-spin me-2" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              <FaCheckCircle className="me-2" />
                              Verify Code
                            </>
                          )}
                        </button>

                        {/* Resend Button */}
                        <button
                          onClick={() => sendVerificationCode(verificationMethod)}
                          disabled={countdown > 0}
                          className="btn btn-outline-secondary w-100 py-2"
                        >
                          Resend Code in {countdown}s
                        </button>
                      </>
                    ) : (
                      <div className="d-grid gap-3">
                        {/* WhatsApp Button */}
                        <button
                          onClick={() => sendVerificationCode('whatsapp')}
                          disabled={status === 'sending'}
                          className="btn btn-lg py-3 fw-semibold d-flex align-items-center justify-content-center"
                          style={{backgroundColor: '#25D366', color: 'white'}}
                        >
                          {status === 'sending' && verificationMethod === 'whatsapp' ? (
                            <>
                              <FaSpinner className="animate-spin me-2" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <FaWhatsapp className="me-2" size={20} />
                              Send WhatsApp Code
                            </>
                          )}
                        </button>

                        {/* SMS Button */}
                        <button
                          onClick={() => sendVerificationCode('sms')}
                          disabled={status === 'sending'}
                          className="btn btn-primary btn-lg py-3 fw-semibold d-flex align-items-center justify-content-center"
                        >
                          {status === 'sending' && verificationMethod === 'sms' ? (
                            <>
                              <FaSpinner className="animate-spin me-2" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <FaSms className="me-2" size={20} />
                              Send SMS Code
                            </>
                          )}
                        </button>

                        <div className="text-center text-muted my-3">
                          <span className="bg-light px-2">or</span>
                        </div>

                        {/* Alternative Option */}
                        <button 
                          onClick={() => router.push('/account/settings')}
                          className="btn btn-outline-primary"
                        >
                          Verify Later
                        </button>
                      </div>
                    )}

                    {/* Status Message */}
                    {message && (
                      <div className={`alert ${status === 'error' ? 'alert-danger' : 'alert-info'} mt-4 d-flex align-items-center`}>
                        {status === 'error' ? (
                          <FaTimesCircle className="me-2 flex-shrink-0" />
                        ) : (
                          <FaCheckCircle className="me-2 flex-shrink-0" />
                        )}
                        <span>{message}</span>
                      </div>
                    )}

                    {/* Help Text */}
                    <div className="alert alert-light mt-4 small">
                      <h6 className="alert-heading mb-2">
                        <FaShieldAlt className="me-2 text-primary" />
                        Why verify your phone?
                      </h6>
                      <ul className="mb-0 ps-3">
                        <li>Enhanced account security</li>
                        <li>Password recovery options</li>
                        <li>Important notification delivery</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}