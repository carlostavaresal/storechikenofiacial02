
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { Smartphone, Mail } from "lucide-react";

const PixConfiguration: React.FC = () => {
  const { toast } = useToast();
  const { settings, updateSettings, loading } = useCompanySettings();
  const [pixEmail, setPixEmail] = useState(settings?.pix_email || '');
  const [pixEnabled, setPixEnabled] = useState(settings?.pix_enabled || false);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (settings) {
      setPixEmail(settings.pix_email || '');
      setPixEnabled(settings.pix_enabled || false);
    }
  }, [settings]);

  const handleSavePixSettings = async () => {
    setSaving(true);
    try {
      const success = await updateSettings({
        pix_email: pixEmail,
        pix_enabled: pixEnabled
      });

      if (success) {
        toast({
          title: "Configurações PIX salvas",
          description: "As configurações do PIX foram atualizadas com sucesso",
        });
      } else {
        toast({
          title: "Erro",
          description: "Erro ao salvar configurações PIX",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações PIX",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Configurações PIX
          </CardTitle>
          <CardDescription>Carregando configurações...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Configurações PIX
        </CardTitle>
        <CardDescription>
          Configure sua chave PIX para receber pagamentos instantâneos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="pix-enabled"
            checked={pixEnabled}
            onCheckedChange={setPixEnabled}
          />
          <Label htmlFor="pix-enabled">Habilitar PIX</Label>
        </div>

        {pixEnabled && (
          <div className="space-y-2">
            <Label htmlFor="pix-email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Chave PIX (Email)
            </Label>
            <Input
              id="pix-email"
              type="email"
              placeholder="seu-email@exemplo.com"
              value={pixEmail}
              onChange={(e) => setPixEmail(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Esta chave será mostrada para os clientes quando escolherem PIX como forma de pagamento
            </p>
          </div>
        )}

        <Button 
          onClick={handleSavePixSettings}
          disabled={saving || (pixEnabled && !pixEmail)}
        >
          {saving ? "Salvando..." : "Salvar Configurações PIX"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PixConfiguration;
