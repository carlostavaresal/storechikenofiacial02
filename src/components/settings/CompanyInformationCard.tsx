
import React, { useState, useEffect } from "react";
import { Upload, FileImage, UploadCloud, MapPin, Phone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCompanySettings } from "@/hooks/useCompanySettings";

const CompanyInformationCard = () => {
  const { toast } = useToast();
  const { settings, updateSettings, loading } = useCompanySettings();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load from Supabase settings first, then fallback to localStorage
    if (settings) {
      setCompanyName(settings.company_name || "");
      setCompanyAddress(settings.company_address || "");
    } else {
      // Fallback to localStorage for backwards compatibility
      const savedName = localStorage.getItem("companyName");
      const savedAddress = localStorage.getItem("companyAddress");
      if (savedName) setCompanyName(savedName);
      if (savedAddress) setCompanyAddress(savedAddress);
    }

    // Logo and phone are still stored in localStorage for now
    const savedLogo = localStorage.getItem("companyLogo");
    const savedPhone = localStorage.getItem("companyPhone");
    if (savedLogo) setLogoPreview(savedLogo);
    if (savedPhone) setCompanyPhone(savedPhone);
  }, [settings]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "A imagem deve ter menos de 5MB.",
          variant: "destructive",
        });
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast({
          title: "Formato inválido",
          description: "Por favor, envie apenas arquivos de imagem.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        localStorage.setItem("companyLogo", result);
        
        toast({
          title: "Logo atualizado",
          description: "O logotipo da empresa foi atualizado com sucesso.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCompanyInfo = async () => {
    setSaving(true);
    try {
      // Save company name and address to Supabase
      const success = await updateSettings({
        company_name: companyName,
        company_address: companyAddress,
      });

      if (success) {
        // Save phone to localStorage (for now)
        localStorage.setItem("companyPhone", companyPhone);
        
        toast({
          title: "Informações salvas",
          description: "As informações da empresa foram atualizadas com sucesso.",
        });
      } else {
        toast({
          title: "Erro",
          description: "Erro ao salvar as informações da empresa.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar as informações.",
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
          <CardTitle>Informações da Empresa</CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Informações da Empresa</CardTitle>
          <CardDescription>
            Configure as informações básicas da sua empresa que serão exibidas aos clientes.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="company-name">Nome da Empresa</Label>
            <Input 
              id="company-name" 
              value={companyName} 
              onChange={(e) => setCompanyName(e.target.value)} 
              placeholder="Nome da sua empresa" 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company-phone">Telefone da Empresa</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                id="company-phone" 
                value={companyPhone} 
                onChange={(e) => setCompanyPhone(e.target.value)} 
                placeholder="(00) 00000-0000"
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company-address">Endereço da Empresa</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              id="company-address" 
              value={companyAddress} 
              onChange={(e) => setCompanyAddress(e.target.value)} 
              placeholder="Endereço completo da empresa"
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="logo">Logotipo da Empresa</Label>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="flex h-40 w-40 items-center justify-center rounded-md border border-dashed">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-1 text-center">
                  <FileImage className="h-10 w-10 text-muted-foreground" />
                  <div className="text-xs text-muted-foreground">
                    Nenhum logo<br />carregado
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 hover:bg-accent">
                    <UploadCloud className="h-4 w-4" />
                    <span>Carregar logo</span>
                  </div>
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </Label>
                <p className="text-xs text-muted-foreground">
                  Recomendado: 300x300 pixels, JPG ou PNG, máximo de 5MB.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <Button onClick={handleSaveCompanyInfo} disabled={saving}>
          {saving ? "Salvando..." : "Salvar Informações"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CompanyInformationCard;
