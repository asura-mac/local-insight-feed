
-- First check if RLS is enabled, if not enable it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'emergency_alerts' AND rowsecurity = TRUE
    ) THEN
        ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;
    END IF;
END
$$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Only service role can create emergency alerts" ON public.emergency_alerts;
DROP POLICY IF EXISTS "Public can view emergency alerts" ON public.emergency_alerts;

-- Create policy for inserting alerts via service role
CREATE POLICY "Service role can manage emergency alerts"
ON public.emergency_alerts
TO service_role
USING (true)
WITH CHECK (true);

-- Create policy for public read access to emergency alerts
CREATE POLICY "Public can view emergency alerts"
ON public.emergency_alerts
FOR SELECT
USING (true);
