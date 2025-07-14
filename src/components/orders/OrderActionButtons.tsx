
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Truck, Trash2, AlertTriangle } from "lucide-react";
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

  const handleConfirmReceived = async () => {
    if (order.status === "pending") {
      await onStatusChange(order.order_number, "processing");
      
      // Send WhatsApp notification to customer
      sendOrderReceived(order);
      
      toast({
        title: "Pedido Confirmado",
        description: `Pedido ${order.order_number} confirmado e cliente notificado`,
      });
      
      playNotificationSound(NOTIFICATION_SOUNDS.ORDER_PROCESSING, 0.5);
    }
  };

  const handleOutForDelivery = async () => {
    if (order.status === "processing") {
      await onStatusChange(order.order_number, "delivered");
      
      // Send WhatsApp notification to customer
      sendDeliveryNotification(order);
      
      toast({
        title: "Saiu para Entrega",
        description: `Cliente ${order.customer_name} foi notificado via WhatsApp`,
      });
      
      playNotificationSound(NOTIFICATION_SOUNDS.ORDER_PROCESSING, 0.5);
    }
  };

  const handleDeleteSuspicious = async () => {
    if (window.confirm(`Tem certeza que deseja excluir o pedido ${order.order_number} por suspeita?`)) {
      await onDeleteOrder(order.id);
      
      toast({
        title: "Pedido Excluído",
        description: `Pedido ${order.order_number} foi excluído por suspeita`,
        variant: "destructive",
      });
      
      playNotificationSound(NOTIFICATION_SOUNDS.ORDER_CANCELLED, 0.5);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {order.status === "pending" && (
        <Button 
          size="sm" 
          onClick={handleConfirmReceived}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Check className="mr-1 h-3 w-3" />
          Confirmar
        </Button>
      )}
      
      {order.status === "processing" && (
        <Button 
          size="sm" 
          variant="secondary" 
          onClick={handleOutForDelivery}
        >
          <Truck className="mr-1 h-3 w-3" />
          Saiu p/ Entrega
        </Button>
      )}
      
      {order.status !== "delivered" && order.status !== "cancelled" && (
        <Button 
          size="sm" 
          variant="destructive" 
          onClick={handleDeleteSuspicious}
        >
          <Trash2 className="mr-1 h-3 w-3" />
          Excluir
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
