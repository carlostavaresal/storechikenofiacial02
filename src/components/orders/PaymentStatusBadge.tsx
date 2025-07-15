
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Clock, X, AlertCircle } from "lucide-react";

interface PaymentStatusBadgeProps {
  paymentStatus: string;
  paymentMethod?: string;
  onMarkAsPaid?: () => void;
  showActions?: boolean;
}

const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({
  paymentStatus,
  paymentMethod,
  onMarkAsPaid,
  showActions = false
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'paid':
        return {
          variant: 'default' as const,
          icon: <Check className="h-3 w-3" />,
          label: 'Pago',
          color: 'bg-green-100 text-green-800 border-green-300'
        };
      case 'pending':
        return {
          variant: 'secondary' as const,
          icon: <Clock className="h-3 w-3" />,
          label: 'Aguardando',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300'
        };
      case 'failed':
        return {
          variant: 'destructive' as const,
          icon: <X className="h-3 w-3" />,
          label: 'Falhou',
          color: 'bg-red-100 text-red-800 border-red-300'
        };
      case 'cancelled':
        return {
          variant: 'outline' as const,
          icon: <X className="h-3 w-3" />,
          label: 'Cancelado',
          color: 'bg-gray-100 text-gray-800 border-gray-300'
        };
      default:
        return {
          variant: 'outline' as const,
          icon: <AlertCircle className="h-3 w-3" />,
          label: 'Desconhecido',
          color: 'bg-gray-100 text-gray-800 border-gray-300'
        };
    }
  };

  const statusConfig = getStatusConfig(paymentStatus);

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={statusConfig.variant}
        className={`${statusConfig.color} flex items-center gap-1`}
      >
        {statusConfig.icon}
        {statusConfig.label}
      </Badge>
      
      {showActions && paymentStatus === 'pending' && paymentMethod === 'pix' && onMarkAsPaid && (
        <Button
          size="sm"
          variant="outline"
          onClick={onMarkAsPaid}
          className="h-6 px-2 text-xs"
        >
          <Check className="h-3 w-3 mr-1" />
          Marcar como Pago
        </Button>
      )}
    </div>
  );
};

export default PaymentStatusBadge;
