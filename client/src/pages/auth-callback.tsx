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
        
        // Get the state parameter from the URL
        const params = new URLSearchParams(location.search)
        const stateParam = params.get('state')
        let redirectTo = '/invoices'
        
        if (stateParam) {
          try {
            const state = JSON.parse(stateParam)
            if (state.redirectTo) {
              redirectTo = state.redirectTo
            }
          } catch (e) {
            console.warn('Failed to parse state parameter:', e)
          }
        }

        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          throw error
        }

        if (!session) {
          console.log('No session found, redirecting to login')
          navigate('/login', { 
            replace: true,
            state: { error: 'Authentication failed. Please try again.' }
          })
          return
        }

        console.log('Session found, storing tokens')
        // Store the session in both localStorage and sessionStorage for redundancy
        localStorage.setItem('supabase_token', session.access_token)
        sessionStorage.setItem('supabase_token', session.access_token)
        
        if (session.provider_token) {
          localStorage.setItem('google_access_token', session.provider_token)
          sessionStorage.setItem('google_access_token', session.provider_token)
        }

        try {
          // Check if user needs onboarding
          const needsOnboarding = await checkUserOnboarding(session.user.id)
          console.log('Onboarding check result:', needsOnboarding)
          
          // Use React Router navigation instead of window.location
          if (needsOnboarding) {
            console.log('Redirecting to onboarding')
            navigate('/Onboarding', { replace: true })
          } else {
            console.log('Redirecting to:', redirectTo)
            navigate(redirectTo, { replace: true })
          }
        } catch (onboardingError) {
          console.error('Onboarding check failed:', onboardingError)
          // If onboarding check fails, redirect to login with error
          navigate('/login', { 
            replace: true,
            state: { error: 'Failed to verify account status' }
          })
        }
      } catch (err: any) {
        console.error('Auth callback error:', err)
        setError(err.message)
        // Use React Router navigation with delay
        setTimeout(() => {
          navigate('/login', { 
            replace: true,
            state: { error: err.message }
          })
        }, 3000)
      }
    }

    handleAuthCallback()
  }, [navigate, location])

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