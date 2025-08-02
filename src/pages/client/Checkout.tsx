
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PaymentMethodSelector from '@/components/payment/PaymentMethodSelector';
import { useToast } from '@/hooks/use-toast';
import { useOrders } from '@/hooks/useOrders';
import { useInputValidation } from '@/hooks/useInputValidation';
import { ShoppingCart, MapPin, CreditCard } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createOrder } = useOrders();
  const { sanitizeString, validatePhone, validateEmail } = useInputValidation();
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'dinheiro' | 'cartao' | 'pix'>('dinheiro');
  const [observations, setObservations] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get cart items from localStorage (this is client-side data, not sensitive)
  const cartItems: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs using the security hook
    const sanitizedName = sanitizeString(customerName);
    const sanitizedAddress = sanitizeString(deliveryAddress);
    const sanitizedObservations = sanitizeString(observations);
    
    if (!validatePhone(customerPhone)) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Número de telefone inválido',
      });
      return;
    }
    
    if (customerEmail && !validateEmail(customerEmail)) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Email inválido',
      });
      return;
    }

    if (!sanitizedName || !customerPhone || !sanitizedAddress) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        customer_name: sanitizedName,
        customer_phone: customerPhone,
        customer_email: customerEmail || '',
        delivery_address: sanitizedAddress,
        items: cartItems,
        total,
        payment_method: paymentMethod,
        payment_status: 'pending' as const,
        observations: sanitizedObservations,
        status: 'pending' as const
      };

      await createOrder(orderData);
      
      // Clear cart
      localStorage.removeItem('cart');
      
      toast({
        title: 'Pedido realizado!',
        description: 'Seu pedido foi enviado com sucesso.',
      });
      
      navigate('/client/success');
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível realizar o pedido.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-8">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold mb-2">Carrinho vazio</h2>
              <p className="text-gray-600 mb-4">Adicione alguns produtos antes de finalizar o pedido.</p>
              <Button onClick={() => navigate('/client')}>
                Ver Cardápio
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Finalizar Pedido
            </CardTitle>
            <CardDescription>
              Preencha seus dados para confirmar o pedido
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Dados do Cliente</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email (opcional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Endereço de Entrega
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço Completo *</Label>
                  <Textarea
                    id="address"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Rua, número, complemento, bairro, cidade"
                    required
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Forma de Pagamento
                </h3>
                
                <PaymentMethodSelector
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                />
              </div>

              {/* Observations */}
              <div className="space-y-2">
                <Label htmlFor="observations">Observações (opcional)</Label>
                <Textarea
                  id="observations"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Alguma observação sobre o pedido..."
                />
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-3">Resumo do Pedido</h3>
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} x{item.quantity}</span>
                      <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span>Total</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processando...' : 'Confirmar Pedido'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Checkout;
