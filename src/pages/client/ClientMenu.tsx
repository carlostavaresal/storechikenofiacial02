
import React, { useState, useEffect } from "react";
import ClientLayout from "@/components/layout/ClientLayout";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { useProducts } from "@/hooks/useProducts";
import { MapPin, Phone } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  imageUrl?: string;
}

const ClientMenu: React.FC = () => {
  const { products, loading } = useProducts();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
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

  // Processar produtos do Supabase ou localStorage
  useEffect(() => {
    console.log('Carregando produtos para o cardápio do cliente:', products);
    
    if (products.length > 0) {
      // Usar produtos do Supabase
      const formattedItems = products
        .filter(product => product.is_available !== false) // Apenas produtos disponíveis
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
      console.log('Items do Supabase carregados:', formattedItems);
    } else if (!loading) {
      // Fallback para localStorage
      const savedProducts = localStorage.getItem("products");
      console.log('Carregando do localStorage:', savedProducts);
      
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
        console.log('Items do localStorage carregados:', updatedItems);
      }
    }
  }, [products, loading]);

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
                  {items.map((item) => (
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
                        <div className="flex justify-between items-center">
                          <p className="text-2xl font-bold text-primary">
                            {formatCurrency(item.price)}
                          </p>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Disponível
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Informações de contato para pedidos */}
        <div className="bg-primary text-primary-foreground rounded-lg p-6 text-center">
          <h3 className="text-xl font-bold mb-2">Faça seu pedido!</h3>
          <p className="mb-4">Entre em contato conosco para fazer seu pedido</p>
          {companyPhone && (
            <a
              href={`https://wa.me/55${companyPhone.replace(/\D/g, '')}`}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Phone className="h-4 w-4" />
              Pedir pelo WhatsApp
            </a>
          )}
        </div>
      </div>
    </ClientLayout>
  );
};

export default ClientMenu;
