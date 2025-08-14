
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Phone, ArrowLeft } from 'lucide-react';
import { useCompanySettings } from '@/hooks/useCompanySettings';

const Success: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useCompanySettings();

  // Auto-redirect after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/client');
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleWhatsAppClick = () => {
    if (settings?.whatsapp_number) {
      const whatsappNumber = settings.whatsapp_number.replace(/\D/g, '');
      const message = encodeURIComponent('Olá! Acabei de fazer um pedido pelo cardápio online.');
      const whatsappUrl = `https://wa.me/55${whatsappNumber}?text=${message}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <div className="max-w-md mx-auto px-4">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-green-600">
              Pedido Realizado com Sucesso!
            </CardTitle>
            <CardDescription className="text-lg">
              Seu pedido foi enviado e em breve você receberá uma confirmação via WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Próximos passos:</h3>
              <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
                <li>Aguarde a confirmação do pedido via WhatsApp</li>
                <li>Se escolheu PIX, envie o comprovante quando solicitado</li>
                <li>Acompanhe o status da entrega</li>
              </ol>
            </div>

            <div className="space-y-3">
              {settings?.whatsapp_number && (
                <Button 
                  onClick={handleWhatsAppClick}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Falar no WhatsApp
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/client')}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Cardápio
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Você será redirecionado automaticamente em alguns segundos...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Success;
