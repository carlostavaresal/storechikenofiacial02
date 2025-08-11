-- Fix RLS policies to properly restrict access to authenticated users only
-- Remove the insecure policies that allow public access
DROP POLICY IF EXISTS "Admin only access to orders" ON public.orders;
DROP POLICY IF EXISTS "Admin only access to products" ON public.products;
DROP POLICY IF EXISTS "Admin only access to company_settings" ON public.company_settings;

-- Create secure policies that require authentication
CREATE POLICY "Authenticated users can access orders" 
ON public.orders 
FOR ALL 
TO authenticated 
USING (auth.uid() IS NOT NULL) 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access products" 
ON public.products 
FOR ALL 
TO authenticated 
USING (auth.uid() IS NOT NULL) 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access company_settings" 
ON public.company_settings 
FOR ALL 
TO authenticated 
USING (auth.uid() IS NOT NULL) 
WITH CHECK (auth.uid() IS NOT NULL);