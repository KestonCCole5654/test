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
      // Check business profile
      const { data: profile, error: profileError } = await supabase
        .from('business_profiles')
        .select('onboarding_completed')
        .eq('user_id', userId)
        .single()

      if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw profileError
      }

      // If no profile exists or onboarding is not completed, show onboarding
      if (!profile || !profile.onboarding_completed) {
        return true
      }

      // Check if we have any spreadsheets as a backup
      const { data: spreadsheets, error: sheetsError } = await supabase
        .from('spreadsheets')
        .select('*')
        .eq('user_id', userId)

      if (sheetsError) throw sheetsError

      // If we have spreadsheets but no profile, create a profile
      if (spreadsheets && spreadsheets.length > 0 && !profile) {
          await supabase
          .from('business_profiles')
          .insert({
            user_id: userId,
            onboarding_completed: true
          })
      }

      return false // Don't show onboarding if we have a completed profile
    } catch (err) {
      console.error('Error checking onboarding status:', err)
      return true // Default to showing onboarding if there's an error
    }
  }

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) throw error

        if (session) {
          // Store the session
          sessionStorage.setItem('supabase_token', session.access_token)
          if (session.provider_token) {
            sessionStorage.setItem('google_access_token', session.provider_token)
          }

          // Check if user needs onboarding
          const needsOnboarding = await checkUserOnboarding(session.user.id)

          // Get the previous location from state or default to invoices
          const from = location.state?.from || '/invoices'
          
          // Redirect to onboarding if needed, otherwise to the intended destination
          if (needsOnboarding) {
            window.location.href = '/Onboarding'
          } else {
          window.location.href = from
          }
        } else {
          window.location.href = '/login'
        }
      } catch (err: any) {
        console.error('Auth callback error:', err)
        setError(err.message)
        setTimeout(() => {
          window.location.href = '/login'
        }, 3000)
      }
    }

    handleAuthCallback()
  }, [location.state])

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