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

      if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Profile error:', profileError)
        throw profileError
      }

      console.log('Profile check result:', { profile, profileError })

      // If no profile exists or onboarding is not completed, show onboarding
      if (!profile || !profile.onboarding_completed) {
        console.log('User needs onboarding')
        return true
      }

      // Check if we have any spreadsheets as a backup
      const { data: spreadsheets, error: sheetsError } = await supabase
        .from('spreadsheets')
        .select('*')
        .eq('user_id', userId)

      if (sheetsError) {
        console.error('Spreadsheets error:', sheetsError)
        throw sheetsError
      }

      console.log('Spreadsheets check result:', { spreadsheets, sheetsError })

      // If we have spreadsheets but no profile, create a profile
      if (spreadsheets && spreadsheets.length > 0 && !profile) {
        console.log('Creating profile for user with spreadsheets')
        const { error: insertError } = await supabase
          .from('business_profiles')
          .insert({
            user_id: userId,
            onboarding_completed: true
          })
        
        if (insertError) {
          console.error('Error creating profile:', insertError)
          throw insertError
        }
      }

      console.log('User does not need onboarding')
      return false // Don't show onboarding if we have a completed profile
    } catch (err) {
      console.error('Error checking onboarding status:', err)
      throw err
    }
  }

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Starting auth callback handling')
        
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

        // Get the session from the URL hash
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          throw sessionError
        }

        if (!session) {
          console.error('No session found')
          throw new Error('No session found')
        }

        console.log('Session found:', session)

        // Store tokens
        try {
          localStorage.setItem('supabase_token', session.access_token)
          if (session.provider_token) {
            localStorage.setItem('google_access_token', session.provider_token)
          }
        } catch (e) {
          console.warn('localStorage not available:', e)
          try {
            sessionStorage.setItem('supabase_token', session.access_token)
            if (session.provider_token) {
              sessionStorage.setItem('google_access_token', session.provider_token)
            }
          } catch (e2) {
            console.warn('sessionStorage not available:', e2)
          }
        }

        try {
          // Check if user needs onboarding
          const needsOnboarding = await checkUserOnboarding(session.user.id)
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
        navigate('/login', { 
          replace: true,
          state: { 
            error: 'Authentication failed. Please try again.',
            details: err.message
          }
        })
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