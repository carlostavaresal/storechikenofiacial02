
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Phone, MessageSquare, Printer, AlertTriangle, Check, Truck, Trash2 } from "lucide-react";
import { PaymentMethod } from "../payment/PaymentMethodSelector";
import PaymentMethodDisplay from "../payment/PaymentMethodDisplay";
import { printOrder } from "@/lib/printUtils";
import { playNotificationSound, NOTIFICATION_SOUNDS } from "@/lib/soundUtils";

interface OrderItem {
  name: string;
  quantity: number;
  price: string;
}

interface Order {
  id: string;
  customer: string;
  status: "pending" | "processing" | "delivered" | "cancelled";
  total: string;
  date: Date;
  items: number;
  phone?: string;
  orderItems?: OrderItem[];
  address?: string;
  paymentMethod?: PaymentMethod;
}

interface OrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (orderId: string, status: Order["status"]) => void;
  onDeleteOrder?: (orderId: string) => void;
  onOutForDelivery?: (orderId: string) => void;
}

const getStatusBadgeVariant = (status: Order["status"]) => {
  switch (status) {
    case "delivered":
      return "outline";
    case "processing":
      return "secondary";
    case "pending":
      return "default";
    case "cancelled":
      return "destructive";
    default:
      return "outline";
  }
};

const getStatusLabel = (status: Order["status"]) => {
  switch (status) {
    case "delivered":
      return "Entregue";
    case "processing":
      return "Saiu para entrega";
    case "pending":
      return "Aguardando";
    case "cancelled":
      return "Cancelado";
    default:
      return status;
  }
};

const OrderModal: React.FC<OrderModalProps> = ({ order, isOpen, onClose, onStatusChange, onDeleteOrder, onOutForDelivery }) => {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    order?.paymentMethod || "cash"
  );

  if (!order) return null;

  const formatPhoneForWhatsApp = (phone: string) => {
    // Remove non-numeric characters
    const numericOnly = phone.replace(/\D/g, "");
    
    // Add country code if not present (assuming Brazil)
    if (numericOnly.length === 11 || numericOnly.length === 10) {
      return `55${numericOnly}`;
    }
    
    return numericOnly;
  };

  const handleWhatsAppMessage = () => {
    if (!order.phone) {
      toast({
        title: "Erro",
        description: "Número de telefone do cliente não disponível",
        variant: "destructive",
      });
      return;
    }

    const phoneNumber = formatPhoneForWhatsApp(order.phone);
    const encodedMessage = encodeURIComponent(
      `Olá ${order.customer}, sobre seu pedido ${order.id}: ${message}`
    );

    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
    
    toast({
      title: "WhatsApp aberto",
      description: "Mensagem preparada para envio",
    });
  };

  const handleSavePaymentMethod = () => {
    // In a real app, this would update the order in the database
    toast({
      title: "Forma de pagamento salva",
      description: `Forma de pagamento definida como ${getPaymentMethodLabel(paymentMethod)}`,
    });
  };

  const getPaymentMethodLabel = (method: PaymentMethod): string => {
    switch (method) {
      case "cash": return "Dinheiro";
      case "pix": return "Pix";
      case "credit": return "Cartão de Crédito";
      case "debit": return "Cartão de Débito";
      default: return "Desconhecido";
    }
  };

  const handlePrintOrder = () => {
    printOrder(order, 2); // Print 2 copies: one for customer and one for delivery person
    
    toast({
      title: "Imprimindo pedido",
      description: "Enviando 2 vias para impressão: cliente e entregador",
    });
  };

  const handleStatusChange = (newStatus: Order["status"]) => {
    if (onStatusChange) {
      onStatusChange(order.id, newStatus);
    }
  };

  const handleConfirmReceived = () => {
    // Marks order as processing (received and being prepared)
    if (order.status === "pending") {
      handleStatusChange("processing");
    }
  };

  const handleMarkAsOutForDelivery = () => {
    if (order.status === "processing" && onOutForDelivery) {
      onOutForDelivery(order.id);
    }
  };

  const handleDeleteOrder = () => {
    if (onDeleteOrder) {
      onDeleteOrder(order.id);
      onClose();
    }
  };

  const handleMarkAsDelivered = () => {
    if (order.status !== "delivered") {
      handleStatusChange("delivered");
    }
  };

  const orderItems = order.orderItems || [
    { name: "Item do pedido", quantity: 1, price: "R$ 25,00" },
    { name: "Item adicional", quantity: 2, price: "R$ 15,00" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalhes do Pedido {order.id}</span>
            <Badge variant={getStatusBadgeVariant(order.status)}>
              {getStatusLabel(order.status)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Pedido de {order.customer} • {formatDate(order.date)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Itens do Pedido</h3>
            <div className="space-y-2">
              {orderItems.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-medium">{item.price}</span>
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{order.total}</span>
          </div>
          
          <Separator />
          
          {/* Status update buttons */}
          <div className="space-y-3">
            <h3 className="font-medium">Ações do Pedido</h3>
            
            <div className="grid grid-cols-2 gap-2">
              {order.status === "pending" && (
                <Button 
                  variant="default" 
                  onClick={handleConfirmReceived}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Confirmar Recebimento
                </Button>
              )}
              
              {(order.status === "processing") && (
                <Button 
                  variant="secondary" 
                  onClick={handleMarkAsOutForDelivery}
                >
                  <Truck className="mr-2 h-4 w-4" />
                  Saiu para Entrega
                </Button>
              )}
              
              {order.status !== "delivered" && order.status !== "cancelled" && (
                <Button 
                  variant="outline" 
                  onClick={handleMarkAsDelivered}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Marcar como Entregue
                </Button>
              )}
              
              <Button 
                variant="destructive" 
                onClick={handleDeleteOrder}
                className="col-span-2"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir Pedido (Suspeito)
              </Button>
            </div>
          </div>
          
          {/* Print button section */}
          <div>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handlePrintOrder}
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimir 2 vias (Cliente/Entregador)
            </Button>
          </div>

          <Separator />
          
          {/* Utiliza o novo componente com visual destacado */}
          <PaymentMethodDisplay 
            selectedMethod={paymentMethod}
            onMethodChange={setPaymentMethod}
            onSave={handleSavePaymentMethod}
          />

          {order.phone && (
            <>
              <Separator />
              <div>
                <h3 className="font-medium mb-1">Telefone</h3>
                <p className="text-sm text-muted-foreground">{order.phone}</p>
              </div>
            </>
          )}

          {order.address && (
            <>
              <Separator />
              <div>
                <h3 className="font-medium mb-1">Endereço de Entrega</h3>
                <p className="text-sm text-muted-foreground">{order.address}</p>
              </div>
            </>
          )}
          
          <Separator />
          
          <div>
            <h3 className="font-medium mb-2">Contato com Cliente</h3>
            <Textarea
              placeholder="Digite uma mensagem para o cliente sobre o pedido..."
              className="mb-2"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleWhatsAppMessage}
                className="w-full"
                variant="default"
                disabled={!message || !order.phone}
              >
                <Phone className="mr-2 h-4 w-4" />
                Enviar WhatsApp
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={!message || !order.phone}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                SMS
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderModal;
