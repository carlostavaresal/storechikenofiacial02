-- Criar função para atualizar automaticamente o campo updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Adicionar triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_company_settings_updated_at
  BEFORE UPDATE ON public.company_settings
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS nas tabelas (Row Level Security)
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Criar políticas permissivas para todas as operações (sem autenticação por enquanto)
-- Company Settings
CREATE POLICY "Allow all operations on company_settings" 
ON public.company_settings 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Products
CREATE POLICY "Allow all operations on products" 
ON public.products 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Orders
CREATE POLICY "Allow all operations on orders" 
ON public.orders 
FOR ALL 
USING (true) 
WITH CHECK (true);