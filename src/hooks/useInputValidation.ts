
import { z } from 'zod';

// Schemas de validação para diferentes tipos de entrada
export const phoneSchema = z.string()
  .min(8, 'Telefone deve ter pelo menos 8 dígitos')
  .max(20, 'Telefone deve ter no máximo 20 dígitos')
  .regex(/^[\d\s\-\(\)\+]+$/, 'Telefone contém caracteres inválidos');

export const nameSchema = z.string()
  .min(2, 'Nome deve ter pelo menos 2 caracteres')
  .max(100, 'Nome deve ter no máximo 100 caracteres')
  .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços');

export const addressSchema = z.string()
  .min(5, 'Endereço deve ter pelo menos 5 caracteres')
  .max(500, 'Endereço deve ter no máximo 500 caracteres');

export const emailSchema = z.string()
  .email('Email inválido')
  .max(255, 'Email deve ter no máximo 255 caracteres');

export const priceSchema = z.number()
  .min(0, 'Preço deve ser maior ou igual a zero')
  .max(99999.99, 'Preço deve ser menor que R$ 99.999,99');

export const orderItemSchema = z.object({
  name: nameSchema,
  quantity: z.number().min(1, 'Quantidade deve ser pelo menos 1').max(100, 'Quantidade máxima é 100'),
  price: priceSchema
});

export const orderSchema = z.object({
  customer_name: nameSchema,
  customer_phone: phoneSchema,
  customer_address: addressSchema,
  items: z.array(orderItemSchema).min(1, 'Pedido deve ter pelo menos 1 item'),
  total_amount: priceSchema,
  payment_method: z.enum(['dinheiro', 'cartao_credito', 'cartao_debito', 'pix']),
  payment_status: z.enum(['pending', 'paid', 'failed', 'cancelled']).default('pending'),
  notes: z.string().max(1000, 'Observações devem ter no máximo 1000 caracteres').optional(),
  status: z.enum(['pending', 'processing', 'delivered', 'cancelled']).default('pending')
});

export const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z.string().max(500, 'Descrição deve ter no máximo 500 caracteres').optional(),
  price: priceSchema,
  category: z.string().max(50, 'Categoria deve ter no máximo 50 caracteres').optional(),
  image_url: z.string().url('URL da imagem inválida').optional(),
  is_available: z.boolean().default(true)
});

// Hook para sanitização de strings
export const useSanitization = () => {
  const sanitizeString = (input: string): string => {
    return input
      .trim()
      .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove scripts
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+\s*=/gi, ''); // Remove event handlers
  };

  const sanitizePhone = (phone: string): string => {
    return phone.replace(/[^\d\s\-\(\)\+]/g, '');
  };

  const sanitizeEmail = (email: string): string => {
    return email.trim().toLowerCase();
  };

  return {
    sanitizeString,
    sanitizePhone,
    sanitizeEmail
  };
};

// Hook principal de validação
export const useInputValidation = () => {
  const { sanitizeString, sanitizePhone, sanitizeEmail } = useSanitization();

  const validateAndSanitize = <T>(schema: z.ZodSchema<T>, data: unknown): { 
    success: boolean; 
    data?: T; 
    errors?: string[] 
  } => {
    try {
      const validatedData = schema.parse(data);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => err.message);
        return { success: false, errors };
      }
      return { success: false, errors: ['Erro de validação desconhecido'] };
    }
  };

  return {
    validateAndSanitize,
    sanitizeString,
    sanitizePhone,
    sanitizeEmail,
    schemas: {
      phone: phoneSchema,
      name: nameSchema,
      address: addressSchema,
      email: emailSchema,
      price: priceSchema,
      order: orderSchema,
      product: productSchema,
      orderItem: orderItemSchema
    }
  };
};
