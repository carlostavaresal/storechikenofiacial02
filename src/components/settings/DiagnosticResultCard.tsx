
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { DiagnosticResult } from './DiagnosticRunner';

interface DiagnosticResultCardProps {
  result: DiagnosticResult;
}

const DiagnosticResultCard: React.FC<DiagnosticResultCardProps> = ({ result }) => {
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

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border">
      {getStatusIcon(result.status)}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium">{result.name}</span>
          {getStatusBadge(result.status)}
        </div>
        <p className="text-sm text-muted-foreground">{result.message}</p>
      </div>
    </div>
  );
};

export default DiagnosticResultCard;
