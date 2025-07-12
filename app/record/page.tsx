// src/hooks/use-auth.ts - DEBUG VERSION
// Check your useAuth hook for conditional hooks

import { useState, useEffect } from 'react';

export function useAuth() {
  // ❌ NEVER DO THIS - Conditional hooks
  // if (someCondition) {
  //   const [state, setState] = useState(null);
  // }

  // ✅ ALWAYS DO THIS - All hooks at the top level
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ❌ NEVER DO THIS - Hook inside condition
  // if (user) {
  //   useEffect(() => {
  //     // This will cause the hooks error
  //   }, []);
  // }

  // ✅ ALWAYS DO THIS - useEffect always called
  useEffect(() => {
    // Conditional logic INSIDE the effect is fine
    if (user) {
      // Do something with user
    }
  }, [user]);

  // ❌ NEVER DO THIS - Early return before hooks
  // if (someCondition) {
  //   return { user: null, profile: null, isLoading: false };
  // }
  // const [anotherState, setAnotherState] = useState(null); // This hook would be skipped

  // ✅ ALWAYS DO THIS - All hooks called before any returns
  return {
    user,
    profile,
    isLoading,
    // ... other auth methods
  };
}