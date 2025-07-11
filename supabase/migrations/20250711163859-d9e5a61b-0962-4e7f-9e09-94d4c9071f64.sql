
-- Criar tabela de configurações da empresa
CREATE TABLE public.company_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  whatsapp_number TEXT NOT NULL,
  company_name TEXT,
  company_address TEXT,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  minimum_order DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de produtos
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de pedidos
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  items JSONB NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'delivered', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar função para gerar número do pedido automaticamente
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'PED' || LPAD(nextval('order_number_seq')::text, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar sequência para número do pedido
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Criar trigger para gerar número do pedido
CREATE TRIGGER trigger_generate_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_number();

-- Habilitar realtime para as tabelas
ALTER TABLE public.company_settings REPLICA IDENTITY FULL;
ALTER TABLE public.products REPLICA IDENTITY FULL;
ALTER TABLE public.orders REPLICA IDENTITY FULL;

-- Adicionar tabelas ao publication do realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.company_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
