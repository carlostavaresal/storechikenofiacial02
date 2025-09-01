// Application Constants

// Google Maps API Key - Replace with your actual key in production
export const GOOGLE_MAPS_API_KEY = 'AIzaSyBDaeWicvigtP9xPv919E-RNoxfvC-Hqik';

// Order Status Options
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
} as const;

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Aguardando',
  [ORDER_STATUS.PROCESSING]: 'Saiu para entrega',
  [ORDER_STATUS.DELIVERED]: 'Entregue',
  [ORDER_STATUS.CANCELLED]: 'Cancelado'
} as const;

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'dinheiro',
  CREDIT_CARD: 'cartao_credito',
  DEBIT_CARD: 'cartao_debito',
  PIX: 'pix'
} as const;

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.CASH]: 'Dinheiro',
  [PAYMENT_METHODS.CREDIT_CARD]: 'Cartão de Crédito',
  [PAYMENT_METHODS.DEBIT_CARD]: 'Cartão de Débito',
  [PAYMENT_METHODS.PIX]: 'PIX'
} as const;

// Payment Status Options
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
} as const;

export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUS.PENDING]: 'Pendente',
  [PAYMENT_STATUS.PAID]: 'Pago',
  [PAYMENT_STATUS.FAILED]: 'Falha',
  [PAYMENT_STATUS.CANCELLED]: 'Cancelado'
} as const;

// Default Settings
export const DEFAULT_DELIVERY_SETTINGS = {
  radius: '5',
  fee: '5.00',
  estimatedTime: '40',
  preparationTime: '25-35',
  deliveryTime: '15-20'
} as const;

// System Limits
export const LIMITS = {
  MAX_ORDER_ITEMS: 100,
  MAX_PRODUCT_NAME_LENGTH: 100,
  MAX_CUSTOMER_NAME_LENGTH: 100,
  MAX_ADDRESS_LENGTH: 500,
  MAX_NOTES_LENGTH: 1000,
  MIN_PHONE_LENGTH: 8,
  MAX_PHONE_LENGTH: 20
} as const;

// Validation Regex
export const REGEX = {
  PHONE: /^[\d\s\-\(\)\+]+$/,
  NAME: /^[a-zA-ZÀ-ÿ\s]+$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  BUSINESS_ADDRESS: 'businessAddress',
  DELIVERY_SETTINGS: 'deliverySettings',
  COMPANY_SETTINGS: 'companySettings',
  PRODUCTS: 'products',
  AUTH_STATE: 'authState'
} as const;

// Company Information
export const COMPANY_INFO = {
  NAME: 'Store Chicken',
  DESCRIPTION: 'Sistema de delivery para restaurantes',
  SUPPORT_EMAIL: 'suporte@storechicken.com',
  SUPPORT_PHONE: '11948076105'
} as const;