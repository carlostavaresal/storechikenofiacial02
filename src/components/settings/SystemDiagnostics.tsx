
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { DiagnosticRunner, DiagnosticResult } from './DiagnosticRunner';
import DiagnosticResultCard from './DiagnosticResultCard';
import { useErrorHandler } from '@/hooks/useErrorHandler';

const SystemDiagnostics = () => {
  const { toast } = useToast();
  const { executeAsync, isLoading } = useErrorHandler();
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);

  const runDiagnostics = async () => {
    console.log('Starting system diagnostics from UI...');
    setDiagnostics([]); // Clear previous results

    const results = await executeAsync(async () => {
      const diagnosticsResult = await DiagnosticRunner.runAllDiagnostics();
      setDiagnostics(diagnosticsResult);
      
      // Show summary toast
      const errors = diagnosticsResult.filter(r => r.status === 'error').length;
      const warnings = diagnosticsResult.filter(r => r.status === 'warning').length;
      
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
      
      return diagnosticsResult;
    }, 'Erro ao executar diagnósticos do sistema');

    if (!results) {
      setDiagnostics([{
        name: 'Sistema Geral',
        status: 'error',
        message: 'Falha crítica na execução dos diagnósticos'
      }]);
    }
  };

  useEffect(() => {
    // Run diagnostics automatically when component mounts
    console.log('SystemDiagnostics component mounted, running initial diagnostics...');
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
        <Button onClick={runDiagnostics} disabled={isLoading} className="w-full">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Executando Diagnóstico...' : 'Executar Diagnóstico'}
        </Button>

        {diagnostics.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Resultados ({diagnostics.length} verificações):</h4>
            <div className="space-y-2">
              {diagnostics.map((result, index) => (
                <DiagnosticResultCard key={index} result={result} />
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="text-center text-sm text-muted-foreground">
            Executando verificações do sistema...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SystemDiagnostics;
