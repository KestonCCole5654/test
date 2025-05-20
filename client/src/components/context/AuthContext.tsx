import React, { createContext, useContext } from 'react';
import { useUser, useAuth, useSession } from '@clerk/clerk-react';

interface User {
  id: string;
  name?: string;
  email?: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOAuthLoading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  initiateGoogleLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isLoaded, user: clerkUser } = useUser();
  const { getToken } = useAuth();
  const { session } = useSession();

  // Clerk already handles session management
  const mappedUser: User | null = clerkUser ? {
    id: clerkUser.id,
    name: clerkUser.fullName ?? undefined,
    email: clerkUser.primaryEmailAddress?.emailAddress,
    picture: clerkUser.imageUrl
  } : null;

  const login = () => {
    // Clerk handles login automatically
  };

  const logout = async () => {
    if (session) {
      await session.end();
    }
  };

  const initiateGoogleLogin = () => {
    window.location.href = '/sign-in#/factor-one';
  };

  const value = {
    user: mappedUser,
    isAuthenticated: !!mappedUser,
    isLoading: !isLoaded,
    isOAuthLoading: false, // Clerk handles loading states internally
    login,
    logout,
    initiateGoogleLogin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within an AuthProvider');
  return context;
}