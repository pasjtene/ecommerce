// app/[lang]/auth/verify-email/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'
import { useRouter } from 'next/navigation'

export default function VerifyEmail() {
  const [status, setStatus] = useState('verifying')
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token')
      const email = searchParams.get('email')

      if (!token || !email) {
        setStatus('error')
        setError('Invalid verification link')
        return
      }

      try {
        const response = await axios.get('/api/auth/verify-email', {
          params: { token, email }
        })

        if (response.data.success) {
          setStatus('success')
          // Redirect after 3 seconds
          setTimeout(() => router.push('/login'), 3000)
        } else {
          setStatus('error')
          setError(response.data.error || 'Verification failed')
        }
      } catch (err) {
        setStatus('error')
        setError('Failed to verify email. Please try again.')
      }
    }

    verifyEmail()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        {status === 'verifying' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Verifying your email...</h2>
            <p>Please wait while we verify your email address.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-green-600">
              Email Verified!
            </h2>
            <p>Your email has been successfully verified. Redirecting to login...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-600">
              Verification Failed
            </h2>
            <p className="mb-4">{error}</p>
            <button
              onClick={() => window.location.href = '/register'}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Go to Registration
            </button>
          </div>
        )}
      </div>
    </div>
  )
}