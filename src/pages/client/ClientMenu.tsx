
import React, { useState, useEffect } from "react";
import ClientLayout from "@/components/layout/ClientLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formatters";
import { useProducts } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, ShoppingCart, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  imageUrl?: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

const ClientMenu: React.FC = () => {
  const { products, loading } = useProducts();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [companyName, setCompanyName] = useState("Entrega Rápida");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Carregar dados da empresa
  useEffect(() => {
    const savedName = localStorage.getItem("companyName");
    const savedAddress = localStorage.getItem("companyAddress");
    const savedPhone = localStorage.getItem("companyPhone");
    const savedLogo = localStorage.getItem("companyLogo");
    
    if (savedName) setCompanyName(savedName);
    if (savedAddress) setCompanyAddress(savedAddress);
    if (savedPhone) setCompanyPhone(savedPhone);
    if (savedLogo) setLogoPreview(savedLogo);
  }, []);

  // Carregar carrinho do localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error("Erro ao carregar carrinho:", error);
      }
    }
  }, []);

  // Salvar carrinho no localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Processar produtos do Supabase ou localStorage
  useEffect(() => {
    console.log('Carregando produtos para o cardápio do cliente:', products);
    
    if (products.length > 0) {
      // Usar produtos do Supabase
      const formattedItems = products
        .filter(product => product.is_available !== false)
        .map((product) => ({
          id: product.id,
          name: product.name || '',
          description: product.description || '',
          price: Number(product.price) || 0,
          category: product.category || "Geral",
          isAvailable: true,
          imageUrl: product.image_url || ''
        }));
      setMenuItems(formattedItems);
    } else if (!loading) {
      // Fallback para localStorage
      const savedProducts = localStorage.getItem("products");
      
      if (savedProducts) {
        const products = JSON.parse(savedProducts);
        const updatedItems = products.map((product: any) => {
          let imageUrl = '';
          
          if (product.image) {
            if (typeof product.image === 'string') {
              imageUrl = product.image;
            } else if (typeof product.image === 'object') {
              if (product.image.value) {
                imageUrl = product.image.value;
              } else if (product.image._type === 'String' && product.image.value) {
                imageUrl = product.image.value;
              }
            }
          }
          
          return {
            id: product.id,
            name: product.name || '',
            description: product.description || '',
            price: Number(product.price) || 0,
            category: product.category || "Geral",
            isAvailable: true,
            imageUrl: imageUrl
          };
        });
        setMenuItems(updatedItems);
      }
    }
  }, [products, loading]);

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }

    toast({
      title: "Item adicionado!",
      description: `${item.name} foi adicionado ao carrinho`,
    });
  };

  const removeFromCart = (itemId: string) => {
    const existingItem = cart.find(cartItem => cartItem.id === itemId);
    
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(cartItem => 
        cartItem.id === itemId 
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      ));
    } else {
      setCart(cart.filter(cartItem => cartItem.id !== itemId));
    }
  };

  const getCartItemQuantity = (itemId: string) => {
    const item = cart.find(cartItem => cartItem.id === itemId);
    return item ? item.quantity : 0;
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const proceedToCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione itens ao carrinho antes de finalizar",
        variant: "destructive",
      });
      return;
    }
    navigate('/checkout');
  };

  // Agrupar por categoria
  const categories = [...new Set(menuItems.map(item => item.category))];
  const itemsByCategory = categories.map(category => ({
    name: category,
    items: menuItems.filter(item => item.category === category)
  }));

  return (
    <ClientLayout>
      <div className="container mx-auto p-6 space-y-8">
        {/* Cabeçalho da empresa */}
        <div className="text-center space-y-4 bg-background rounded-lg p-6 shadow-sm">
          {logoPreview && (
            <div className="flex justify-center">
              <img src={logoPreview} alt="Logo" className="h-20 w-auto" />
            </div>
          )}
          <h1 className="text-3xl font-bold text-primary">{companyName}</h1>
          {companyAddress && (
            <p className="text-muted-foreground flex items-center justify-center gap-2">
              <MapPin className="h-4 w-4" />
              {companyAddress}
            </p>
          )}
          {companyPhone && (
            <p className="text-muted-foreground flex items-center justify-center gap-2">
              <Phone className="h-4 w-4" />
              {companyPhone}
            </p>
          )}
        </div>

        {/* Carrinho fixo */}
        {cart.length > 0 && (
          <div className="fixed bottom-4 right-4 z-50">
            <Card className="bg-primary text-primary-foreground shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    <Badge variant="secondary" className="bg-white text-primary">
                      {getTotalItems()}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(getTotalPrice())}</p>
                    <p className="text-sm opacity-90">{cart.length} itens</p>
                  </div>
                  <Button 
                    onClick={proceedToCheckout}
                    variant="secondary"
                    size="sm"
                  >
                    Finalizar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lista de produtos */}
        <div className="space-y-8">
          {loading ? (
            <div className="text-center p-12">
              <p className="text-xl text-muted-foreground">Carregando cardápio...</p>
            </div>
          ) : menuItems.length === 0 ? (
            <div className="text-center p-12">
              <p className="text-xl text-muted-foreground">Cardápio temporariamente indisponível</p>
              <p className="text-sm text-muted-foreground mt-2">
                Tente novamente em alguns minutos.
              </p>
            </div>
          ) : (
            itemsByCategory.map(({ name, items }) => (
              <div key={name} className="space-y-4">
                <h2 className="text-2xl font-bold border-b border-border pb-2">
                  {name}
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => {
                    const quantity = getCartItemQuantity(item.id);
                    return (
                      <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative pt-[60%]">
                          <img
                            src={item.imageUrl || "/placeholder.svg"}
                            alt={item.name}
                            className="absolute inset-0 h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg";
                            }}
                          />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {item.description}
                          </p>
                          <div className="flex justify-between items-center mb-3">
                            <p className="text-2xl font-bold text-primary">
                              {formatCurrency(item.price)}
                            </p>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Disponível
                            </span>
                          </div>
                          
                          {quantity > 0 ? (
                            <div className="flex items-center justify-between gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeFromCart(item.id)}
                                className="w-10 h-10 p-0"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="font-bold text-lg">{quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addToCart(item)}
                                className="w-10 h-10 p-0"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              onClick={() => addToCart(item)}
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Adicionar
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Informações de contato para pedidos */}
        <div className="bg-primary text-primary-foreground rounded-lg p-6 text-center">
          <h3 className="text-xl font-bold mb-2">Dúvidas? Entre em contato!</h3>
          <p className="mb-4">Estamos aqui para ajudar você</p>
          {companyPhone && (
            <a
              href={`https://wa.me/55${companyPhone.replace(/\D/g, '')}`}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Phone className="h-4 w-4" />
              Falar no WhatsApp
            </a>
          )}
        </div>
      </div>
    </ClientLayout>
  );
};

export default ClientMenu;
