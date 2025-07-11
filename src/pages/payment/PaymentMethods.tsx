
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { HomeIcon, CreditCard, Banknote, Coins } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import PaymentMethodDisplay from "@/components/payment/PaymentMethodDisplay";
import PaymentKeysConfiguration from "@/components/payment/PaymentKeysConfiguration";
import { PaymentMethod } from "@/components/payment/PaymentMethodSelector";

const PaymentMethods: React.FC = () => {
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("cash");

  const handleSavePaymentMethod = () => {
    // Em uma aplicação real, isso salvaria no banco de dados
    toast({
      title: "Configuração salva",
      description: "Suas preferências de pagamento foram atualizadas.",
    });
  };

  const handleSavePaymentKeys = (keys: any) => {
    // Em uma aplicação real, isso salvaria as chaves no banco de dados
    console.log("Chaves de pagamento salvas:", keys);
    toast({
      title: "Chaves salvas",
      description: "As chaves de pagamento foram configuradas com sucesso.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">
                <HomeIcon className="h-3 w-3 mr-1" />
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Formas de Pagamento</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div>
          <h2 className="text-3xl font-bold tracking-tight">Formas de Pagamento</h2>
          <p className="text-muted-foreground">
            Configure as formas de pagamento aceitas pelo seu estabelecimento e suas chaves de recebimento
          </p>
        </div>

        <Separator />

        <div className="grid gap-6">
          {/* Configuração de Chaves de Pagamento */}
          <PaymentKeysConfiguration onSave={handleSavePaymentKeys} />

          <div className="grid md:grid-cols-2 gap-6">
            {/* Seleção de Método de Pagamento */}
            <PaymentMethodDisplay
              selectedMethod={selectedMethod}
              onMethodChange={setSelectedMethod}
              onSave={handleSavePaymentMethod}
            />

            {/* Métodos Disponíveis */}
            <Card>
              <CardHeader>
                <CardTitle>Métodos de Pagamento Disponíveis</CardTitle>
                <CardDescription>Todos os métodos que seu estabelecimento aceita</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center p-3 border rounded-md">
                  <Banknote className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <h3 className="font-medium">Dinheiro</h3>
                    <p className="text-sm text-muted-foreground">Pagamento em espécie na entrega</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 border rounded-md">
                  <Coins className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <h3 className="font-medium">PIX</h3>
                    <p className="text-sm text-muted-foreground">Pagamento instantâneo via PIX</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 border rounded-md">
                  <CreditCard className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <h3 className="font-medium">Cartão de Crédito</h3>
                    <p className="text-sm text-muted-foreground">Pagamento com cartão de crédito</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 border rounded-md">
                  <CreditCard className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <h3 className="font-medium">Cartão de Débito</h3>
                    <p className="text-sm text-muted-foreground">Pagamento com cartão de débito</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PaymentMethods;
