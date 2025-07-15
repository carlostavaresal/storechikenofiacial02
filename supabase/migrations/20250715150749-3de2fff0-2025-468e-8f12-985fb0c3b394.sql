
-- Adicionar campos para configurações de PIX na tabela company_settings
ALTER TABLE public.company_settings 
ADD COLUMN IF NOT EXISTS pix_email TEXT,
ADD COLUMN IF NOT EXISTS pix_enabled BOOLEAN DEFAULT false;

-- Adicionar campo para status de pagamento na tabela orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'cancelled'));

-- Adicionar campo para data do pagamento
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;
