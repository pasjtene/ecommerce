// app/[lang]/auth/verify-phone/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaWhatsapp, FaSms, FaPhone } from 'react-icons/fa'
import { useAuth } from '../../contexts/AuthContextNext'

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
            router.push('/dashboard')
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-6">
          <FaPhone className="text-blue-500 text-4xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Verify Your Phone Number</h2>
          <p className="text-gray-600 mt-2">
            We'll send a verification code to your phone
          </p>
        </div>

        {status === 'success' ? (
          <div className="text-center">
            <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900">Verification Successful!</h3>
            <p className="mt-2 text-gray-600">{message}</p>
            <p className="text-gray-500 text-sm mt-4">Redirecting in 5 seconds...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="tel"
                  id="phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="+1234567890"
                  disabled={countdown > 0}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Please include your country code (e.g., +1 for US)
              </p>
            </div>

            {countdown > 0 ? (
              <>
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                    Verification Code
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Sent via {verificationMethod === 'whatsapp' ? 'WhatsApp' : 'SMS'}. Check your messages.
                  </p>
                </div>

                <button
                  onClick={verifyCode}
                  disabled={status === 'verifying'}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {status === 'verifying' ? (
                    <FaSpinner className="animate-spin h-5 w-5" />
                  ) : (
                    'Verify Code'
                  )}
                </button>

                <button
                  onClick={() => sendVerificationCode(verificationMethod)}
                  disabled={countdown > 0}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Resend Code ({countdown})
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => sendVerificationCode('whatsapp')}
                  disabled={status === 'sending'}
                  className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {status === 'sending' && verificationMethod === 'whatsapp' ? (
                    <FaSpinner className="animate-spin h-5 w-5 mr-2" />
                  ) : (
                    <FaWhatsapp className="h-5 w-5 mr-2" />
                  )}
                  Send WhatsApp Code
                </button>

                <button
                  onClick={() => sendVerificationCode('sms')}
                  disabled={status === 'sending'}
                  className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {status === 'sending' && verificationMethod === 'sms' ? (
                    <FaSpinner className="animate-spin h-5 w-5 mr-2" />
                  ) : (
                    <FaSms className="h-5 w-5 mr-2" />
                  )}
                  Send SMS Code
                </button>
              </div>
            )}

            {message && (
              <div className={`rounded-md p-4 ${status === 'error' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                <p className="text-sm">{message}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}