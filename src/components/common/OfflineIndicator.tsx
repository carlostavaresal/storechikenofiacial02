import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WifiOff, Wifi } from 'lucide-react';
import { useNetwork } from '@/hooks/useNetwork';
import { cn } from '@/lib/utils';

const OfflineIndicator: React.FC = () => {
  const { online } = useNetwork();

  if (online) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-bottom-4">
      <Card className="border-destructive">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 text-sm">
            <WifiOff className="h-4 w-4 text-destructive" />
            <span className="font-medium">Sem conexão</span>
            <span className="text-muted-foreground">
              Funcionando no modo offline
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const NetworkStatus: React.FC<{ className?: string }> = ({ className }) => {
  const { online, effectiveType, downlink } = useNetwork();

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {online ? (
        <Wifi className="h-3 w-3 text-green-500" />
      ) : (
        <WifiOff className="h-3 w-3 text-destructive" />
      )}
      <span className="text-xs text-muted-foreground">
        {online 
          ? `${effectiveType || 'Online'}${downlink ? ` (${Math.round(downlink)} Mbps)` : ''}`
          : 'Offline'
        }
      </span>
    </div>
  );
};

export default OfflineIndicator;