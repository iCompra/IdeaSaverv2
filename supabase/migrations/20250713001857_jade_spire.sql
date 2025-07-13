/*
  # Fix Profile RLS INSERT Policy for New User Registration

  1. Policy Updates
    - Drop and recreate INSERT policy without 'TO authenticated' restriction
    - This allows new users to create their initial profile during sign-up
    - The WITH CHECK clause still ensures users can only insert their own profile (auth.uid() = id)

  2. Security
    - INSERT policy allows any user to insert their own profile (necessary for registration)
    - SELECT and UPDATE policies remain restricted to authenticated users
    - Maintains data integrity while enabling proper user onboarding
*/

-- Drop the overly restrictive INSERT policy
DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile." ON public.profiles;

-- Create new INSERT policy without 'TO authenticated' restriction
-- This allows new users to create their profile during sign-up process
CREATE POLICY "Users can insert their own profile during registration" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);