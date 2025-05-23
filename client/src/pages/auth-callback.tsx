import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import supabase from '../components/Auth/supabaseClient'
import { LoadingSpinner } from '../components/ui/loadingSpinner'

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

  const checkUserOnboarding = async (userId: string) => {
    try {
      console.log('Checking onboarding status for user:', userId)
      
      // Check business profile
      const { data: profile, error: profileError } = await supabase
        .from('business_profiles')
        .select('onboarding_completed')
        .eq('user_id', userId)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile error:', profileError)
        throw profileError
      }

      console.log('Profile check result:', { profile, profileError })

      // If no profile exists or onboarding is not completed, show onboarding
      if (!profile || !profile.onboarding_completed) {
        console.log('User needs onboarding')
        return true
      }

      console.log('User does not need onboarding')
      return false
    } catch (err) {
      console.error('Error checking onboarding status:', err)
      throw err
    }
  }

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Starting auth callback handling')
        
        // Check for error in URL first
        const searchParams = new URLSearchParams(window.location.search)
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        
        // Special handling for database errors
        if (error === 'server_error' && errorDescription?.includes('Database error updating user')) {
          console.log('Database error detected, proceeding with auth flow')
          // Clear the error from URL to prevent redirect loops
          window.history.replaceState({}, document.title, window.location.pathname)
        } else if (error) {
          console.error('Auth error from Supabase:', { error, errorDescription })
          throw new Error(errorDescription || 'Authentication failed')
        }

        // Get the redirect path from storage (try both methods)
        let redirectPath = '/invoices'
        try {
          redirectPath = sessionStorage.getItem('auth_redirect') || localStorage.getItem('auth_redirect') || '/invoices'
          // Clear stored paths
          sessionStorage.removeItem('auth_redirect')
          localStorage.removeItem('auth_redirect')
        } catch (e) {
          console.warn('Storage access error:', e)
        }
        
        console.log('Retrieved redirect path:', redirectPath)

        // Get the session from the URL hash or search params
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        
        // Try to get the session from Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          throw sessionError
        }

        if (!session) {
          // If no session, try to get it from the URL
          const accessToken = hashParams.get('access_token')
          const refreshToken = hashParams.get('refresh_token')

          if (!accessToken) {
            console.error('No access token found in URL')
            throw new Error('No access token found')
          }

          console.log('Found access token in URL')
          
          try {
            // Set the session using the tokens from the URL
            const { data: { session: newSession }, error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ''
            })

            if (setSessionError) {
              console.error('Error setting session:', setSessionError)
              // If it's a database error, we should still try to proceed
              if (setSessionError.message?.includes('Database error')) {
                console.log('Database error occurred, but proceeding with auth flow')
              } else {
                throw setSessionError
              }
            }

            if (!newSession) {
              console.error('No session after setting tokens')
              throw new Error('Failed to establish session')
            }

            console.log('Session established successfully')
          } catch (setSessionError: any) {
            console.error('Error setting session:', setSessionError)
            // If it's a database error, we should still try to proceed
            if (setSessionError.message?.includes('Database error')) {
              console.log('Database error occurred, but proceeding with auth flow')
            } else {
              throw setSessionError
            }
          }
        } else {
          console.log('Existing session found')
        }

        // Get the final session state
        const { data: { session: finalSession }, error: finalSessionError } = await supabase.auth.getSession()
        
        if (finalSessionError) {
          console.error('Final session check failed:', finalSessionError)
          throw finalSessionError
        }

        if (!finalSession) {
          console.error('No final session found')
          throw new Error('Failed to verify session')
        }

        console.log('Final session check successful')

        // Store tokens with fallback
        const storeToken = (key: string, value: string) => {
          try {
            localStorage.setItem(key, value)
          } catch (e) {
            console.warn('localStorage failed:', e)
            try {
              sessionStorage.setItem(key, value)
            } catch (e2) {
              console.warn('sessionStorage failed:', e2)
            }
          }
        }

        storeToken('supabase_token', finalSession.access_token)
        if (finalSession.provider_token) {
          storeToken('google_access_token', finalSession.provider_token)
        }

        try {
          // Check if user needs onboarding
          const needsOnboarding = await checkUserOnboarding(finalSession.user.id)
          console.log('Onboarding check result:', needsOnboarding)
          
          if (needsOnboarding) {
            console.log('Redirecting to onboarding')
            navigate('/Onboarding', { replace: true })
          } else {
            console.log('Redirecting to:', redirectPath)
            navigate(redirectPath, { replace: true })
          }
        } catch (onboardingError) {
          console.error('Onboarding check failed:', onboardingError)
          // If onboarding check fails, still allow access but log the error
          console.log('Proceeding to main app despite onboarding check failure')
          navigate(redirectPath, { replace: true })
        }
      } catch (err: any) {
        console.error('Auth callback error:', err)
        // If it's a database error, we should still try to proceed
        if (err.message?.includes('Database error')) {
          console.log('Database error occurred, but proceeding with auth flow')
          navigate('/invoices', { replace: true })
        } else {
          navigate('/login', { 
            replace: true,
            state: { 
              error: 'Authentication failed. Please try again.',
              details: err.message
            }
          })
        }
      }
    }

    handleAuthCallback()
  }, [navigate])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-slate-600 text-sm font-medium">
          Setting up your account...
        </p>
      </div>
    </div>
  )
} 