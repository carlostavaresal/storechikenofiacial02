
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Download, Upload, HardDrive, Database, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const SystemBackup = () => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [lastBackup, setLastBackup] = useState<string | null>(
    localStorage.getItem('lastBackupDate')
  );
  const { toast } = useToast();

  const handleCreateBackup = async () => {
    setIsBackingUp(true);
    setBackupProgress(0);

    try {
      // Simular progresso do backup
      const progressInterval = setInterval(() => {
        setBackupProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      // Aguardar conclusão do progresso
      await new Promise(resolve => setTimeout(resolve, 2200));

      // Coletar dados do sistema
      const systemData = {
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        companySettings: JSON.parse(localStorage.getItem('companySettings') || '{}'),
        products: JSON.parse(localStorage.getItem('products') || '[]'),
        deliverySettings: JSON.parse(localStorage.getItem('deliverySettings') || '{}'),
        businessAddress: JSON.parse(localStorage.getItem('businessAddress') || '{}'),
        orders: JSON.parse(localStorage.getItem('orders') || '[]'),
        paymentMethods: JSON.parse(localStorage.getItem('paymentMethods') || '[]'),
        promotionalCodes: JSON.parse(localStorage.getItem('promotionalCodes') || '[]'),
        themeSettings: JSON.parse(localStorage.getItem('themeSettings') || '{}'),
      };

      // Criar arquivo de backup
      const backupData = JSON.stringify(systemData, null, 2);
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Criar link de download
      const link = document.createElement('a');
      link.href = url;
      link.download = `store-chicken-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Salvar data do último backup
      const backupDate = new Date().toLocaleString('pt-BR');
      localStorage.setItem('lastBackupDate', backupDate);
      setLastBackup(backupDate);

      toast({
        title: "Backup Criado com Sucesso!",
        description: "O arquivo de backup foi baixado para seu dispositivo.",
      });
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      toast({
        title: "Erro no Backup",
        description: "Falha ao criar o arquivo de backup.",
        variant: "destructive",
      });
    } finally {
      setIsBackingUp(false);
      setBackupProgress(0);
    }
  };

  const handleRestoreBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    setRestoreProgress(0);

    try {
      // Simular progresso da restauração
      const progressInterval = setInterval(() => {
        setRestoreProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 12;
        });
      }, 150);

      // Ler arquivo
      const fileContent = await file.text();
      const backupData = JSON.parse(fileContent);

      // Aguardar conclusão do progresso
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Restaurar dados
      if (backupData.companySettings) {
        localStorage.setItem('companySettings', JSON.stringify(backupData.companySettings));
      }
      if (backupData.products) {
        localStorage.setItem('products', JSON.stringify(backupData.products));
      }
      if (backupData.deliverySettings) {
        localStorage.setItem('deliverySettings', JSON.stringify(backupData.deliverySettings));
      }
      if (backupData.businessAddress) {
        localStorage.setItem('businessAddress', JSON.stringify(backupData.businessAddress));
      }
      if (backupData.orders) {
        localStorage.setItem('orders', JSON.stringify(backupData.orders));
      }
      if (backupData.paymentMethods) {
        localStorage.setItem('paymentMethods', JSON.stringify(backupData.paymentMethods));
      }
      if (backupData.promotionalCodes) {
        localStorage.setItem('promotionalCodes', JSON.stringify(backupData.promotionalCodes));
      }
      if (backupData.themeSettings) {
        localStorage.setItem('themeSettings', JSON.stringify(backupData.themeSettings));
      }

      toast({
        title: "Backup Restaurado com Sucesso!",
        description: "Todos os dados foram restaurados. Recarregue a página para ver as alterações.",
      });

      // Sugerir recarregar a página
      setTimeout(() => {
        if (confirm("Deseja recarregar a página para aplicar as alterações?")) {
          window.location.reload();
        }
      }, 2000);
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      toast({
        title: "Erro na Restauração",
        description: "Falha ao restaurar o arquivo de backup. Verifique se o arquivo é válido.",
        variant: "destructive",
      });
    } finally {
      setIsRestoring(false);
      setRestoreProgress(0);
      // Limpar input
      event.target.value = '';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Backup do Sistema</h2>
          <p className="text-muted-foreground">
            Faça backup e restaure os dados do sistema para pendrive ou armazenamento local.
          </p>
        </div>
        <Separator />
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Criar Backup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Criar Backup
              </CardTitle>
              <CardDescription>
                Baixe todos os dados do sistema em um arquivo JSON.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {lastBackup && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Último backup: {lastBackup}
                  </AlertDescription>
                </Alert>
              )}
              
              {isBackingUp && (
                <div className="space-y-2">
                  <Progress value={backupProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground">
                    Criando backup... {backupProgress}%
                  </p>
                </div>
              )}
              
              <Button 
                onClick={handleCreateBackup}
                disabled={isBackingUp}
                className="w-full"
              >
                <HardDrive className="mr-2 h-4 w-4" />
                {isBackingUp ? "Criando Backup..." : "Criar Backup"}
              </Button>
              
              <div className="text-xs text-muted-foreground">
                <p>O backup inclui:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Configurações da empresa</li>
                  <li>Produtos cadastrados</li>
                  <li>Configurações de entrega</li>
                  <li>Endereço do negócio</li>
                  <li>Histórico de pedidos</li>
                  <li>Métodos de pagamento</li>
                  <li>Códigos promocionais</li>
                  <li>Configurações de tema</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Restaurar Backup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Restaurar Backup
              </CardTitle>
              <CardDescription>
                Carregue um arquivo de backup para restaurar os dados.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Atenção:</strong> A restauração substituirá todos os dados atuais.
                </AlertDescription>
              </Alert>
              
              {isRestoring && (
                <div className="space-y-2">
                  <Progress value={restoreProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground">
                    Restaurando backup... {restoreProgress}%
                  </p>
                </div>
              )}
              
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestoreBackup}
                  disabled={isRestoring}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <Button 
                  variant="outline" 
                  disabled={isRestoring}
                  className="w-full"
                >
                  <Database className="mr-2 h-4 w-4" />
                  {isRestoring ? "Restaurando..." : "Selecionar Arquivo de Backup"}
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground">
                <p>Formatos aceitos: .json</p>
                <p>Certifique-se de que o arquivo é um backup válido do Store Chicken.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações Adicionais */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Importantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2">Recomendações de Backup:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Faça backups regulares (diário ou semanal)</li>
                  <li>• Mantenha múltiplas cópias em locais seguros</li>
                  <li>• Teste a restauração periodicamente</li>
                  <li>• Armazene em pendrive, nuvem ou HD externo</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Solução de Problemas:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Se houver problemas, restaure o último backup</li>
                  <li>• Verifique se o arquivo não está corrompido</li>
                  <li>• Recarregue a página após restaurar</li>
                  <li>• Entre em contato com suporte se necessário</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SystemBackup;
