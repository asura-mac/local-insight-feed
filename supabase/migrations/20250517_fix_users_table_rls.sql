
-- First check if RLS is enabled, if not enable it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'users' AND rowsecurity = TRUE
    ) THEN
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    END IF;
END
$$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Service role can manage all users" ON public.users;

-- Create policy for users to view their own data
CREATE POLICY "Users can view their own data" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

-- Create policy for users to update their own data
CREATE POLICY "Users can update their own data" 
ON public.users 
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create policy for service role to manage all user data
CREATE POLICY "Service role can manage all users"
ON public.users
TO service_role
USING (true)
WITH CHECK (true);

-- Allow users to insert their own record
CREATE POLICY "Users can insert their own data"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);
