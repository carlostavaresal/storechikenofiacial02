
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Truck, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { playNotificationSound, NOTIFICATION_SOUNDS } from "@/lib/soundUtils";
import { useCustomerNotifications } from "@/hooks/useCustomerNotifications";

interface OrderActionButtonsProps {
  order: any;
  onStatusChange: (orderId: string, status: string) => void;
  onDeleteOrder: (orderId: string) => void;
}

const OrderActionButtons: React.FC<OrderActionButtonsProps> = ({
  order,
  onStatusChange,
  onDeleteOrder
}) => {
  const { toast } = useToast();
  const { sendOrderReceived, sendDeliveryNotification } = useCustomerNotifications();
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleConfirmReceived = async () => {
    if (!order || order.status !== "pending" || isProcessing) {
      console.log('Order not available, not pending, or already processing:', order?.status);
      return;
    }

    setIsProcessing(true);
    console.log(`[ACTION] Confirmando recebimento do pedido: ${order.order_number}`);
    
    try {
      await onStatusChange(order.order_number, "processing");
      
      setTimeout(() => {
        sendOrderReceived(order);
      }, 500);
      
      toast({
        title: "Pedido Confirmado",
        description: `Pedido ${order.order_number} confirmado e cliente notificado`,
      });
      
      playNotificationSound(NOTIFICATION_SOUNDS.ORDER_PROCESSING, 0.5);
    } catch (error) {
      console.error('Error confirming order:', error);
      toast({
        title: "Erro",
        description: "Erro ao confirmar pedido",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOutForDelivery = async () => {
    if (!order || order.status !== "processing" || isProcessing) {
      console.log('Order not available, not processing, or already processing:', order?.status);
      return;
    }

    setIsProcessing(true);
    console.log(`[ACTION] Marcando pedido como saiu para entrega: ${order.order_number}`);
    
    try {
      await onStatusChange(order.order_number, "delivered");
      
      setTimeout(() => {
        sendDeliveryNotification(order);
      }, 500);
      
      toast({
        title: "Saiu para Entrega",
        description: `Cliente ${order.customer_name} foi notificado via WhatsApp`,
      });
      
      playNotificationSound(NOTIFICATION_SOUNDS.ORDER_PROCESSING, 0.5);
    } catch (error) {
      console.error('Error marking out for delivery:', error);
      toast({
        title: "Erro",
        description: "Erro ao marcar saída para entrega",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteSuspicious = async () => {
    if (!order || isProcessing) {
      console.log('Order not available or already processing');
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir o pedido ${order.order_number} por suspeita?`)) {
      setIsProcessing(true);
      console.log(`[ACTION] Excluindo pedido suspeito: ${order.order_number}`);
      
      try {
        await onDeleteOrder(order.id);
        
        toast({
          title: "Pedido Excluído",
          description: `Pedido ${order.order_number} foi excluído por suspeita`,
          variant: "destructive",
        });
        
        playNotificationSound(NOTIFICATION_SOUNDS.ORDER_CANCELLED, 0.5);
      } catch (error) {
        console.error('Error deleting order:', error);
        toast({
          title: "Erro",
          description: "Erro ao excluir pedido",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  if (!order) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {order.status === "pending" && (
        <Button 
          size="sm" 
          onClick={handleConfirmReceived}
          className="bg-green-600 hover:bg-green-700 text-white"
          disabled={!order.order_number || isProcessing}
        >
          <Check className="mr-1 h-3 w-3" />
          {isProcessing ? "Confirmando..." : "Confirmar"}
        </Button>
      )}
      
      {order.status === "processing" && (
        <Button 
          size="sm" 
          onClick={handleOutForDelivery}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          disabled={!order.order_number || isProcessing}
        >
          <Truck className="mr-1 h-3 w-3" />
          {isProcessing ? "Enviando..." : "Entrega"}
        </Button>
      )}
      
      {order.status !== "delivered" && order.status !== "cancelled" && (
        <Button 
          size="sm" 
          variant="destructive" 
          onClick={handleDeleteSuspicious}
          disabled={!order.id || isProcessing}
        >
          <Trash2 className="mr-1 h-3 w-3" />
          {isProcessing ? "Excluindo..." : "Excluir"}
        </Button>
      )}
      
      <Badge variant={
        order.status === "delivered" ? "outline" :
        order.status === "processing" ? "secondary" :
        order.status === "pending" ? "default" : "destructive"
      }>
        {order.status === "delivered" ? "Entregue" :
         order.status === "processing" ? "Preparando" :
         order.status === "pending" ? "Aguardando" : "Cancelado"}
      </Badge>
    </div>
  );
};

export default OrderActionButtons;
