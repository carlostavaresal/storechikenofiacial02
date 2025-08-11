
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'warning' | 'error';
  message: string;
}

const SystemDiagnostics = () => {
  const { toast } = useToast();
  const { settings, loading, error } = useCompanySettings();
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [running, setRunning] = useState(false);

  const runDiagnostics = async () => {
    setRunning(true);
    const results: DiagnosticResult[] = [];

    try {
      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        results.push({
          name: 'Autenticação',
          status: 'error',
          message: 'Usuário não autenticado. Faça login para acessar as configurações.'
        });
      } else {
        results.push({
          name: 'Autenticação',
          status: 'success',
          message: 'Usuário autenticado com sucesso.'
        });
      }

      // Check Supabase connection
      try {
        const { data, error: connectionError } = await supabase
          .from('company_settings')
          .select('count')
          .limit(1);
        
        if (connectionError) {
          results.push({
            name: 'Conexão Supabase',
            status: 'error',
            message: `Erro de conexão: ${connectionError.message}`
          });
        } else {
          results.push({
            name: 'Conexão Supabase',
            status: 'success',
            message: 'Conexão com o banco de dados funcionando.'
          });
        }
      } catch (err) {
        results.push({
          name: 'Conexão Supabase',
          status: 'error',
          message: 'Erro ao conectar com o banco de dados.'
        });
      }

      // Check company settings
      if (loading) {
        results.push({
          name: 'Configurações da Empresa',
          status: 'warning',
          message: 'Carregando configurações...'
        });
      } else if (error) {
        results.push({
          name: 'Configurações da Empresa',
          status: 'error',
          message: `Erro ao carregar: ${error}`
        });
      } else if (!settings) {
        results.push({
          name: 'Configurações da Empresa',
          status: 'warning',
          message: 'Nenhuma configuração encontrada. Configure sua empresa primeiro.'
        });
      } else {
        const missing = [];
        if (!settings.whatsapp_number) missing.push('WhatsApp');
        if (!settings.company_name) missing.push('Nome da empresa');
        if (!settings.company_address) missing.push('Endereço');
        
        if (missing.length > 0) {
          results.push({
            name: 'Configurações da Empresa',
            status: 'warning',
            message: `Campos em falta: ${missing.join(', ')}`
          });
        } else {
          results.push({
            name: 'Configurações da Empresa',
            status: 'success',
            message: 'Todas as configurações básicas estão preenchidas.'
          });
        }
      }

      // Check localStorage data
      const localStorageItems = ['companyLogo', 'companyPhone', 'selected-theme'];
      const missingLocalStorage = localStorageItems.filter(item => !localStorage.getItem(item));
      
      if (missingLocalStorage.length > 0) {
        results.push({
          name: 'Dados Locais',
          status: 'warning',
          message: `Dados opcionais em falta: ${missingLocalStorage.join(', ')}`
        });
      } else {
        results.push({
          name: 'Dados Locais',
          status: 'success',
          message: 'Todos os dados locais estão configurados.'
        });
      }

      // Check RLS policies
      try {
        const { data: testData, error: rlsError } = await supabase
          .from('company_settings')
          .select('*')
          .limit(1);
          
        if (rlsError) {
          results.push({
            name: 'Políticas de Segurança',
            status: 'error',
            message: `Erro nas políticas RLS: ${rlsError.message}`
          });
        } else {
          results.push({
            name: 'Políticas de Segurança',
            status: 'success',
            message: 'Políticas de segurança funcionando corretamente.'
          });
        }
      } catch (err) {
        results.push({
          name: 'Políticas de Segurança',
          status: 'error',
          message: 'Erro ao verificar políticas de segurança.'
        });
      }

    } catch (err) {
      results.push({
        name: 'Sistema Geral',
        status: 'error',
        message: 'Erro inesperado durante o diagnóstico.'
      });
    }

    setDiagnostics(results);
    setRunning(false);

    // Show summary toast
    const errors = results.filter(r => r.status === 'error').length;
    const warnings = results.filter(r => r.status === 'warning').length;
    
    if (errors > 0) {
      toast({
        title: "Diagnóstico concluído",
        description: `${errors} erro(s) e ${warnings} aviso(s) encontrados.`,
        variant: "destructive",
      });
    } else if (warnings > 0) {
      toast({
        title: "Diagnóstico concluído",
        description: `${warnings} aviso(s) encontrados.`,
      });
    } else {
      toast({
        title: "Sistema OK",
        description: "Nenhum problema encontrado no sistema.",
      });
    }
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">OK</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Aviso</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
    }
  };

  useEffect(() => {
    // Run diagnostics automatically when component mounts
    runDiagnostics();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Diagnóstico do Sistema
        </CardTitle>
        <CardDescription>
          Verificação automática de problemas e configurações do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runDiagnostics} disabled={running} className="w-full">
          <RefreshCw className={`h-4 w-4 mr-2 ${running ? 'animate-spin' : ''}`} />
          {running ? 'Executando Diagnóstico...' : 'Executar Diagnóstico'}
        </Button>

        {diagnostics.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Resultados:</h4>
            {diagnostics.map((result, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                {getStatusIcon(result.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{result.name}</span>
                    {getStatusBadge(result.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{result.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SystemDiagnostics;
