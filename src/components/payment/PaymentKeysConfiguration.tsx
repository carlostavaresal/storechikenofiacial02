
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Smartphone, Key, Eye, EyeOff } from "lucide-react";

interface PaymentKeysConfigurationProps {
  onSave?: (keys: PaymentKeys) => void;
}

interface PaymentKeys {
  pixKey: string;
  creditCardKey: string;
  debitCardKey: string;
}

const PaymentKeysConfiguration: React.FC<PaymentKeysConfigurationProps> = ({
  onSave
}) => {
  const { toast } = useToast();
  const [keys, setKeys] = useState<PaymentKeys>({
    pixKey: "",
    creditCardKey: "",
    debitCardKey: ""
  });
  const [showKeys, setShowKeys] = useState({
    pix: false,
    credit: false,
    debit: false
  });

  const handleInputChange = (field: keyof PaymentKeys, value: string) => {
    setKeys(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleShowKey = (keyType: 'pix' | 'credit' | 'debit') => {
    setShowKeys(prev => ({
      ...prev,
      [keyType]: !prev[keyType]
    }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(keys);
    }
    
    toast({
      title: "Chaves de pagamento salvas",
      description: "As configurações de pagamento foram atualizadas com sucesso.",
    });
  };

  return (
    <Card className="border-2 border-primary/20 shadow-sm">
      <CardHeader className="bg-primary/5 pb-2">
        <CardTitle className="text-lg font-bold text-primary flex items-center gap-2">
          <Key className="h-5 w-5" />
          Configuração de Chaves de Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* PIX Key */}
        <div className="space-y-2">
          <Label htmlFor="pixKey" className="flex items-center gap-2 font-medium">
            <Smartphone className="h-4 w-4" />
            Chave PIX
          </Label>
          <div className="relative">
            <Input
              id="pixKey"
              type={showKeys.pix ? "text" : "password"}
              placeholder="Digite sua chave PIX (CPF, telefone, email ou chave aleatória)"
              value={keys.pixKey}
              onChange={(e) => handleInputChange("pixKey", e.target.value)}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => toggleShowKey('pix')}
            >
              {showKeys.pix ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Esta chave será usada para receber pagamentos via PIX
          </p>
        </div>

        {/* Credit Card Key */}
        <div className="space-y-2">
          <Label htmlFor="creditKey" className="flex items-center gap-2 font-medium">
            <Key className="h-4 w-4" />
            Chave/Token - Cartão de Crédito
          </Label>
          <div className="relative">
            <Input
              id="creditKey"
              type={showKeys.credit ? "text" : "password"}
              placeholder="Digite a chave/token para processamento de cartão de crédito"
              value={keys.creditCardKey}
              onChange={(e) => handleInputChange("creditCardKey", e.target.value)}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => toggleShowKey('credit')}
            >
              {showKeys.credit ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Chave para processar pagamentos com cartão de crédito
          </p>
        </div>

        {/* Debit Card Key */}
        <div className="space-y-2">
          <Label htmlFor="debitKey" className="flex items-center gap-2 font-medium">
            <Key className="h-4 w-4" />
            Chave/Token - Cartão de Débito
          </Label>
          <div className="relative">
            <Input
              id="debitKey"
              type={showKeys.debit ? "text" : "password"}
              placeholder="Digite a chave/token para processamento de cartão de débito"
              value={keys.debitCardKey}
              onChange={(e) => handleInputChange("debitCardKey", e.target.value)}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => toggleShowKey('debit')}
            >
              {showKeys.debit ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Chave para processar pagamentos com cartão de débito
          </p>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} className="min-w-[120px]">
            Salvar Chaves
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentKeysConfiguration;
