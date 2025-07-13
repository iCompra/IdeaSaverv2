"use client"; // CRITICAL: Ensure this is present as it uses client-side hooks

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/hooks/use-auth'; // CRITICAL: It MUST import useAuth, not define it
import RecordingControls from '@/src/components/RecordingControls'; // Assuming this component exists
import LoadingSpinner from '@/src/components/ui/LoadingSpinner'; // Assuming this component exists

/**
 * Record page component - Protected voice recording interface
 * Only accessible to authenticated users with defensive loading state handling
 */
export default function RecordPage() {
  // --- ALL HOOKS MUST BE CALLED UNCONDITIONALLY AT THE TOP ---
  const { user, profile, isLoading } = useAuth(); // Called unconditionally
  const router = useRouter(); // Called unconditionally

  // --- CRITICAL: Redirection for unauthenticated users (useEffect always called) ---
  useEffect(() => {
    // Only redirect if authentication is NOT loading AND there's no user.
    // This useEffect runs after every render, checking the latest state.
    if (!isLoading && !user) {
      console.log('RecordPage (useEffect): Not authenticated, redirecting to /login...');
      router.push('/login');
    }
    // No redirection needed if user is present. The component's render logic (below)
    // will handle loading states (for profile) or render content.
  }, [user, isLoading, router]); // Dependencies: user, isLoading, router are essential


  // --- CRITICAL: Defensive rendering logic based on state ---
  // This section only contains conditional RETURN statements for JSX,
  // not conditional hook calls.

  if (isLoading) {
    console.log('RecordPage (render): Still loading auth state...');
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center bg-dark-primary-bg">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-dark-text-muted mt-4">Loading application...</p>
        </div>
      </div>
    );
  }

  // If we reach here and !user, it means useEffect above has initiated the redirection.
  // We return null to avoid rendering any content while the redirect happens.
  if (!user) {
      console.log('RecordPage (render): No user, returning null (should be redirecting).');
      return null; 
  }

  // If user is present but profile is not yet loaded (e.g., initial fetch, or after upsert)
  if (!profile) {
    console.log('RecordPage (render): User detected, but profile still loading...');
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center bg-dark-primary-bg">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-dark-text-muted mt-4">Loading user profile...</p>
        </div>
      </div>
    );
  }

  // --- SUCCESS: User and profile are fully loaded, render main content ---
  console.log('RecordPage (render): Rendering main content for user:', user.id, 'with profile:', profile.id);

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col justify-center px-4">
      <div className="text-center mb-6 max-w-sm mx-auto">
        <h1 className="text-xl font-bold mb-2 text-foreground gradient-text">
          Welcome back, {profile.email?.split('@')[0] || 'Creator'}!
        </h1>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          Ready to capture your next brilliant idea?
        </p>
        <div className="text-xs text-muted-foreground">
          Credits: {profile.credits.toLocaleString()}
        </div>
      </div>
      
      <RecordingControls />
    </div>
  );
}