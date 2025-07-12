// src/hooks/use-auth.tsx

"use client"; 

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/src/lib/supabaseClient'; 

interface UserProfile {
  id: string;
  email: string;
  credits: number;
  current_plan: 'free' | 'full_app_purchase';
  has_purchased_app: boolean;
  cloud_sync_enabled: boolean;
  auto_cloud_sync: boolean;
  deletion_policy_days: number;
  created_at: string;
}

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  updateCredits: (newCredits: number) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Always start as true
  const router = useRouter();

  const updateCredits = useCallback((newCredits: number) => {
    setProfile(prevProfile => {
      if (prevProfile) {
        return { ...prevProfile, credits: newCredits };
      }
      return null;
    });
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true); // Set loading while signing out
    await getSupabaseBrowserClient().auth.signOut(); 
    // onAuthStateChange will handle setting user/profile to null and isLoading to false
    router.push('/'); 
  }, [router]);

  useEffect(() => {
    // This flag ensures isLoading is set to false only once after the initial auth state is determined
    let isInitialLoadHandled = false; 

    const { data: authListener } = getSupabaseBrowserClient().auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 useAuth: Auth State Change Event:', event, 'Session User ID:', session?.user?.id || 'none');
      // No setIsLoading(true) here, it's already true on mount.
      // This prevents potential race conditions from setting it true multiple times.

      if (session?.user) {
        console.log('✅ useAuth: User detected, fetching profile for ID:', session.user.id, 'Email:', session.user.email);
        setUser(session.user);
        
        const { data: profileData, error: profileUpsertError } = await getSupabaseBrowserClient()
          .from('profiles')
          .upsert({
            id: session.user.id,
            email: session.user.email,
            credits: 25, 
            current_plan: 'free',
            has_purchased_app: false,
            cloud_sync_enabled: false,
            auto_cloud_sync: false,
            deletion_policy_days: 0,
            created_at: new Date().toISOString()
          }, { onConflict: 'id' })
          .select('*')
          .single();

        if (profileUpsertError) {
          console.error('❌ useAuth: Error upserting user profile:', profileUpsertError);
          setProfile(null);
        } else {
          console.log('✅ useAuth: Profile upserted/fetched successfully:', profileData?.id, 'Credits:', profileData?.credits);
          setProfile(profileData as UserProfile);
        }
      } else {
        console.log('🚪 useAuth: No user detected (logged out or initial load)');
        setUser(null);
        setProfile(null);
      }

      // CRITICAL: Set isLoading to false ONLY after the initial auth state is processed.
      if (!isInitialLoadHandled) {
        setIsLoading(false);
        isInitialLoadHandled = true;
        console.log('🔄 useAuth: Initial auth state processed. isLoading set to false.');
      }
      // For subsequent changes (login/logout), isLoading will be managed by specific actions (e.g. signOut).
    });

    // The listener itself will handle the initial session.
    // No separate getSession() call needed here.
    console.log('🔍 useAuth: onAuthStateChange listener initialized.');

    return () => {
      // CRITICAL: Correct way to unsubscribe from Supabase auth listener
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []); // Dependency array is empty: this useEffect runs once on mount.

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, isAuthenticated: !!user, updateCredits, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};