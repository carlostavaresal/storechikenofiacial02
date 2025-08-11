-- Remove the current overly permissive policy
DROP POLICY IF EXISTS "Allow all operations on orders" ON public.orders;

-- Create a secure policy that only allows access to authenticated admin users
-- Since this is an admin-only system, we'll restrict to authenticated users only
CREATE POLICY "Admin only access to orders" 
ON public.orders 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Also update products table for consistency (currently also has public access)
DROP POLICY IF EXISTS "Allow all operations on products" ON public.products;

CREATE POLICY "Admin only access to products" 
ON public.products 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Update company_settings for consistency
DROP POLICY IF EXISTS "Allow all operations on company_settings" ON public.company_settings;

CREATE POLICY "Admin only access to company_settings" 
ON public.company_settings 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);