
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, MapPin, Phone, User, CreditCard } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { useInputValidation } from '@/hooks/useInputValidation';
import PaymentMethodSelector from '@/components/payment/PaymentMethodSelector';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createOrder, loading } = useOrders();
  const { validateAndSanitize, sanitizeString, sanitizePhone, sanitizeEmail, schemas } = useInputValidation();

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'dinheiro' | 'cartao' | 'pix'>('dinheiro');
  const [observations, setObservations] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get cart items from localStorage
  const getCartItems = (): CartItem[] => {
    try {
      const cartData = localStorage.getItem('cart');
      return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
      console.error('Error loading cart:', error);
      return [];
    }
  };

  const cartItems = getCartItems();
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Sanitize inputs
      const sanitizedName = sanitizeString(customerName);
      const sanitizedPhone = sanitizePhone(customerPhone);
      const sanitizedEmail = sanitizeEmail(customerEmail);
      const sanitizedAddress = sanitizeString(deliveryAddress);
      const sanitizedObservations = sanitizeString(observations);

      // Validate required fields
      if (!sanitizedName || !sanitizedPhone || !sanitizedAddress) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha nome, telefone e endereço",
          variant: "destructive",
        });
        return;
      }

      if (cartItems.length === 0) {
        toast({
          title: "Carrinho vazio",
          description: "Adicione itens ao carrinho antes de finalizar o pedido",
          variant: "destructive",
        });
        return;
      }

      // Create order data matching the Order interface
      const orderData = {
        customer_name: sanitizedName,
        customer_phone: sanitizedPhone,
        customer_address: sanitizedAddress,
        items: cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        total_amount: totalAmount,
        payment_method: paymentMethod,
        payment_status: 'pending' as const,
        notes: sanitizedObservations || null,
        status: 'pending' as const
      };

      await createOrder(orderData);

      // Clear cart
      localStorage.removeItem('cart');

      toast({
        title: "Pedido realizado com sucesso!",
        description: "Você receberá uma confirmação em breve via WhatsApp",
      });

      navigate('/success');
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Erro ao criar pedido",
        description: "Tente novamente em alguns instantes",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <ShoppingCart className="h-6 w-6" />
                Carrinho Vazio
              </CardTitle>
              <CardDescription>
                Adicione itens ao seu carrinho antes de finalizar o pedido
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => navigate('/cardapio')}>
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
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-6 w-6" />
                Resumo do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">Qtd: {item.quantity}</p>
                    </div>
                    <p className="font-medium">
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total:</span>
                    <span>R$ {totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Form */}
          <Card>
            <CardHeader>
              <CardTitle>Dados para Entrega</CardTitle>
              <CardDescription>
                Preencha os dados abaixo para finalizar seu pedido
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Nome Completo *
                  </Label>
                  <Input
                    id="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Telefone *
                  </Label>
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
                    placeholder="seu-email@exemplo.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Endereço de Entrega *
                  </Label>
                  <Textarea
                    id="address"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Rua, número, bairro, cidade - CEP"
                    required
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Forma de Pagamento
                  </Label>
                  <PaymentMethodSelector
                    selectedMethod={paymentMethod}
                    onMethodChange={setPaymentMethod}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observations">Observações (opcional)</Label>
                  <Textarea
                    id="observations"
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    placeholder="Instruções especiais, ponto de referência, etc."
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || loading}
                >
                  {isSubmitting ? 'Finalizando...' : 'Finalizar Pedido'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
