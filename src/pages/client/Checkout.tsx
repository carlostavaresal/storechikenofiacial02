import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PaymentMethodSelector, PaymentMethod } from '@/components/payment/PaymentMethodSelector';
import { useToast } from '@/hooks/use-toast';
import { useOrders } from '@/hooks/useOrders';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { ShoppingCart, User, MapPin, CreditCard, Trash2 } from 'lucide-react';

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
  const { settings } = useCompanySettings();
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('dinheiro');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const cart = localStorage.getItem('cart');
    if (cart) {
      try {
        const parsedCart = JSON.parse(cart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Error parsing cart:', error);
        setCartItems([]);
      }
    }
  }, []);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }

    const updatedCart = cartItems.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeItem = (id: string) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = settings?.delivery_fee || 0;
  const finalTotal = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione itens ao carrinho antes de finalizar o pedido.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        items: cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        total_amount: finalTotal,
        payment_method: paymentMethod,
        payment_status: 'pending' as const,
        notes: notes,
        status: 'pending' as const
      };

      await createOrder(orderData);
      
      // Clear cart
      localStorage.removeItem('cart');
      
      toast({
        title: "Pedido realizado com sucesso!",
        description: "Seu pedido foi recebido e está sendo processado.",
      });

      navigate('/success');
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Erro ao criar pedido",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold mb-4">Carrinho Vazio</h1>
          <p className="text-gray-600 mb-6">Adicione alguns produtos ao seu carrinho para continuar.</p>
          <Button onClick={() => navigate('/menu')}>
            Ver Cardápio
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Finalizar Pedido</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações do Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome completo</Label>
                    <Input
                      id="name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Endereço completo</Label>
                    <Textarea
                      id="address"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      required
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Observações (opcional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      placeholder="Instruções especiais para entrega..."
                    />
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Forma de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentMethodSelector
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Resumo do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">R$ {item.price.toFixed(2)} cada</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="ml-4 font-medium">
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
                
                <div className="space-y-2 pt-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R$ {subtotal.toFixed(2)}</span>
                  </div>
                  {deliveryFee > 0 && (
                    <div className="flex justify-between">
                      <span>Taxa de entrega:</span>
                      <span>R$ {deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total:</span>
                      <span>R$ {finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? 'Finalizando...' : 'Finalizar Pedido'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
