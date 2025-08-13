// app/[lang]/auth/verify-email/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa'
import { useAuth } from '../../contexts/AuthContextNext';
//import dynamic from 'next/dynamic';

//const Login = dynamic(() => import('../../Login'), { ssr: false });

export default function VerifyEmail() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, token, showLogin, onRequireLogin } = useAuth();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token')
      const email = searchParams.get('email')

      if (!token || !email) {
        setStatus('error')
        setMessage('Invalid verification link - missing parameters')
        return
      }

      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/verify-email`, {
          params: { token, email }
        })

        if (response.data.success) {
          setStatus('success')
          setMessage(response.data.message || 'Email verified successfully. You will be redirected to home page in 15 seconds!')
          // Redirect to home page after 30 seconds
          setTimeout(() => router.push('/'), 15000) // We need to redirect to a login page. That needs to be created.
         // showLogin()
        } else {
          setStatus('error')
          setMessage(response.data.error || 'Verification failed')
        }
      } catch (error) {
        setStatus('error')
        if (axios.isAxiosError(error)) {
          setMessage(error.response?.data?.error || 'Failed to verify email')
        } else {
          setMessage('An unexpected error occurred')
        }
      }
    }

    verifyEmail()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center">
          {status === 'verifying' && (
            <>
              <FaSpinner className="animate-spin text-blue-500 text-5xl mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Verifying Your Email</h2>
              <p>Please wait while we verify your email address...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Email Verified!</h2>
              <p className="mb-4">{message}</p>
              <p className="text-gray-500">You will be redirected shortly...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <FaTimesCircle className="text-red-500 text-5xl mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
              <p className="mb-4">{message}</p>
              <button
                onClick={() => router.push('/')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Go to Home page
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}