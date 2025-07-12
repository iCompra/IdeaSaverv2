'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/hooks/use-auth';
// Temporarily comment out components that might be causing the error to isolate
// import RecordingControls from '@/src/components/RecordingControls'; 
// import LoadingSpinner from '@/src/components/ui/LoadingSpinner';

/**
 * Record page component - DIAGNOSTIC MODE
 * Temporarily simplified to isolate hooks error
 */
export default function RecordPage() {
  // --- ALL HOOKS MUST BE CALLED UNCONDITIONALLY AT THE TOP ---
  const { user, profile, isLoading } = useAuth(); 
  const router = useRouter(); 

  // --- This useEffect MUST always be called ---
  useEffect(() => {
    if (!isLoading && !user) {
      console.log('RecordPage (useEffect): Not authenticated, redirecting to /login...');
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // --- TEMPORARY: Render only a basic loading/status message ---
  if (isLoading) {
    console.log('RecordPage (render): Still loading auth state...');
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center bg-dark-primary-bg text-dark-text-light">
        <p>Loading application (Diagnostic Mode)...</p>
      </div>
    );
  }

  if (!user) {
    console.log('RecordPage (render): No user, returning null (should be redirecting).');
    return null; // Should redirect via useEffect
  }

  if (!profile) {
    console.log('RecordPage (render): User detected, but profile still loading...');
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center bg-dark-primary-bg text-dark-text-light">
        <p>Loading user profile (Diagnostic Mode)...</p>
      </div>
    );
  }

  // If everything loaded, just show a success message
  console.log('RecordPage (render): Rendering diagnostic content for user:', user.id, 'with profile:', profile.id);
  return (
    <div className="h-[calc(100vh-120px)] flex flex-col justify-center px-4 bg-dark-primary-bg text-dark-text-light text-center">
      <h1 className="text-xl font-bold mb-4">RecordPage: Auth OK (Diagnostic Mode)</h1>
      <p className="mb-2">User: {profile.email}</p>
      <p className="mb-2">Credits: {profile.credits.toLocaleString()}</p>
      <p className="text-sm text-dark-text-muted">All hooks are working correctly</p>
    </div>
  );
}