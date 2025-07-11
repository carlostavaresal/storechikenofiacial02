
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, MapPin, Clock, DollarSign, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BusinessAddress } from "@/pages/delivery/DeliveryAreas";

interface DeliveryRadiusMapProps {
  address: BusinessAddress | null;
  onSave: (radius: string, fee: string) => void;
}

const DeliveryRadiusMap: React.FC<DeliveryRadiusMapProps> = ({ address, onSave }) => {
  const [deliveryRadius, setDeliveryRadius] = useState<string>("5");
  const [deliveryFee, setDeliveryFee] = useState<string>("5.00");
  const [estimatedTime, setEstimatedTime] = useState<string>("30-45");
  const [addressString, setAddressString] = useState<string>("");
  const { toast } = useToast();

  // Load saved settings
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("deliverySettings");
      
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setDeliveryRadius(settings.radius || "5");
        setDeliveryFee(settings.fee || "5.00");
        setEstimatedTime(settings.estimatedTime || "30-45");
      }
    } catch (error) {
      console.error("Error loading delivery settings:", error);
    }
  }, []);

  // Generate address string when address changes
  useEffect(() => {
    if (address) {
      const fullAddress = `${address.street}, ${address.number}, ${address.neighborhood}, ${address.city}, ${address.state}`;
      setAddressString(fullAddress);
    } else {
      setAddressString("");
    }
  }, [address]);

  const handleSave = () => {
    if (!address) {
      toast({
        title: "Endereço necessário",
        description: "Configure primeiro o endereço da empresa.",
        variant: "destructive",
      });
      return;
    }

    const settings = {
      radius: deliveryRadius,
      fee: deliveryFee,
      estimatedTime: estimatedTime,
    };
    localStorage.setItem("deliverySettings", JSON.stringify(settings));
    onSave(deliveryRadius, deliveryFee);
    
    toast({
      title: "Configurações salvas",
      description: `Raio de ${deliveryRadius}km, taxa de R$ ${deliveryFee} e tempo de ${estimatedTime} min salvos.`,
    });
  };

  const openInGoogleMaps = () => {
    if (addressString) {
      const url = `https://www.google.com/maps/search/${encodeURIComponent(addressString)}`;
      window.open(url, '_blank');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Configuração do Raio de Entrega
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {address && (
          <div className="space-y-4">
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm font-medium">Endereço base para entrega:</p>
              <p className="text-sm text-muted-foreground">{addressString}</p>
            </div>

            {/* Visualização Simplificada do Endereço */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Localização - Store Chicken</span>
              </div>
              
              <div className="h-80 rounded-lg border overflow-hidden bg-gradient-to-br from-blue-50 to-green-50">
                <div className="w-full h-full flex flex-col items-center justify-center p-8">
                  <div className="text-center space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">🍗</span>
                      </div>
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg text-gray-800">Store Chicken</h3>
                      <p className="text-sm text-gray-600 max-w-sm">
                        {addressString}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 text-sm text-blue-600 bg-white/80 rounded-full px-4 py-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Área de entrega: {deliveryRadius}km de raio</span>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={openInGoogleMaps}
                      className="gap-2 mt-4"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Ver no Google Maps
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-4 bg-blue-50 p-3 rounded-md">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-blue-700">🍗 Store Chicken</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-blue-700">Área de Entrega: {deliveryRadius}km</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-blue-700">Taxa: R$ {deliveryFee}</span>
                </div>
              </div>
            </div>

            {/* Configurações */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deliveryRadius" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Raio de Entrega (km)
                </Label>
                <Input
                  id="deliveryRadius"
                  type="number"
                  min="0"
                  step="0.1"
                  value={deliveryRadius}
                  onChange={(e) => setDeliveryRadius(e.target.value)}
                  placeholder="Ex: 5"
                />
                <p className="text-xs text-muted-foreground">
                  Distância máxima para entrega
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deliveryFee" className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Taxa de Entrega (R$)
                </Label>
                <Input
                  id="deliveryFee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  placeholder="Ex: 5.00"
                />
                <p className="text-xs text-muted-foreground">
                  Valor cobrado pela entrega
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedTime" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Tempo Estimado (min)
                </Label>
                <Input
                  id="estimatedTime"
                  type="text"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                  placeholder="Ex: 30-45"
                />
                <p className="text-xs text-muted-foreground">
                  Tempo de entrega estimado
                </p>
              </div>
            </div>

            <Button onClick={handleSave} className="flex items-center gap-2 w-full">
              <Save className="h-4 w-4" />
              Salvar Configurações de Entrega
            </Button>
          </div>
        )}

        {!address && (
          <div className="text-center p-8 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Configure o endereço primeiro</p>
            <p className="text-sm">
              Para definir o raio de entrega, você precisa primeiro configurar o endereço da sua empresa na seção acima.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeliveryRadiusMap;
