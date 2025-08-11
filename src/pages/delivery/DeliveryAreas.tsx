
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import AddressSetupCard from "@/components/delivery/AddressSetupCard";
import DeliveryRadiusMap from "@/components/delivery/DeliveryRadiusMap";
import { useBusinessAddress } from "@/hooks/useBusinessAddress";

// Define the BusinessAddress interface to be used throughout the component
export interface BusinessAddress {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  complement?: string;
}

const DeliveryAreas: React.FC = () => {
  const { businessAddress, updateAddress, loading } = useBusinessAddress();
  const { toast } = useToast();

  // Handler for updating the business address
  const handleSetBusinessAddress = (address: BusinessAddress) => {
    const success = updateAddress(address);
    if (success) {
      toast({
        title: "Endereço atualizado",
        description: "O endereço da empresa foi atualizado com sucesso.",
      });
    } else {
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar o endereço.",
        variant: "destructive",
      });
    }
  };

  // Handler for saving delivery settings
  const handleSaveDeliverySettings = (radius: string, fee: string) => {
    console.log('Delivery settings saved:', { radius, fee });
    // This will be handled by the DeliveryRadiusMap component
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Carregando...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Áreas de Entrega</h1>
          <p className="text-muted-foreground">
            Configure o endereço da sua empresa e defina o raio de entregas com as respectivas taxas.
          </p>
        </div>
        
        {/* Business Address Setup */}
        <AddressSetupCard
          address={businessAddress ? {
            street: businessAddress.street,
            number: businessAddress.number,
            neighborhood: businessAddress.neighborhood,
            city: businessAddress.city,
            state: businessAddress.state,
            zipCode: businessAddress.postalCode,
            complement: businessAddress.complement || ""
          } : {
            street: "",
            number: "",
            neighborhood: "",
            city: "",
            state: "",
            zipCode: "",
            complement: ""
          }}
          onAddressUpdate={handleSetBusinessAddress}
        />

        {/* Delivery Radius Map */}
        <DeliveryRadiusMap
          address={businessAddress}
          onSave={handleSaveDeliverySettings}
        />
      </div>
    </DashboardLayout>
  );
};

export default DeliveryAreas;
