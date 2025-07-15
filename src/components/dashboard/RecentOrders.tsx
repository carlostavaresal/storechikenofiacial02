
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { formatDistanceToNowLocalized } from "@/lib/formatters";
import OrderModal from "@/components/orders/OrderModal";
import OrderActionButtons from "@/components/orders/OrderActionButtons";
import { PaymentMethod } from "@/components/payment/PaymentMethodSelector";
import { useToast } from "@/hooks/use-toast";
import { useOrders } from "@/hooks/useOrders";

const RecentOrders: React.FC = () => {
  const { toast } = useToast();
  const { orders, loading, error, updateOrderStatus, deleteOrder } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenOrderDetails = (order: any) => {
    if (!order) {
      console.error('Invalid order for details:', order);
      return;
    }

    const formattedOrder = {
      id: order.order_number || '',
      customer: order.customer_name || '',
      status: order.status || 'pending',
      total: `R$ ${(order.total_amount || 0).toFixed(2)}`,
      date: new Date(order.created_at),
      items: Array.isArray(order.items) ? order.items.length : 0,
      address: order.customer_address || '',
      phone: order.customer_phone || '',
      orderItems: Array.isArray(order.items) ? order.items : [],
      paymentMethod: order.payment_method as PaymentMethod,
      notes: order.notes || ''
    };
    setSelectedOrder(formattedOrder);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (!orderId || !newStatus) {
      console.error('Invalid parameters for status change:', { orderId, newStatus });
      return;
    }

    const order = orders.find(o => o.order_number === orderId);
    if (!order) {
      console.error('Order not found:', orderId);
      return;
    }

    console.log(`[RECENT ORDERS] Atualizando status do pedido ${orderId} para ${newStatus}`);
    const success = await updateOrderStatus(order.id, newStatus as any);
    
    if (success) {
      toast({
        title: "Status Atualizado",
        description: `Pedido ${orderId} foi atualizado com sucesso`,
      });
    } else {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do pedido",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!orderId) {
      console.error('Invalid order ID for deletion:', orderId);
      return;
    }

    console.log(`[RECENT ORDERS] Excluindo pedido: ${orderId}`);
    const success = await deleteOrder(orderId);
    
    if (success) {
      toast({
        title: "Pedido Excluído",
        description: "Pedido foi excluído com sucesso",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Erro",
        description: "Erro ao excluir pedido",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border bg-card shadow animate-slide-in" style={{ animationDelay: "0.1s" }}>
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-semibold">Pedidos Recentes</h2>
        </div>
        <div className="p-6 text-center text-muted-foreground">
          <p>Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-card shadow animate-slide-in" style={{ animationDelay: "0.1s" }}>
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-semibold">Pedidos Recentes</h2>
        </div>
        <div className="p-6 text-center text-red-600">
          <p>Erro ao carregar pedidos: {error}</p>
        </div>
      </div>
    );
  }

  const recentOrders = (orders || []).slice(0, 5);

  return (
    <div className="rounded-lg border bg-card shadow animate-slide-in" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h2 className="font-semibold">Pedidos Recentes - Ações Rápidas</h2>
        <Link
          to="/orders"
          className="text-sm text-primary hover:underline"
        >
          Ver todos
        </Link>
      </div>
      <div className="overflow-x-auto">
        {recentOrders.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <p>Nenhum pedido encontrado</p>
            <p className="text-sm mt-1">Os pedidos aparecerão aqui em tempo real quando forem realizados</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
                <TableHead>Ver</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow 
                  key={order.id}
                  className={`${
                    order.status === "cancelled" ? "bg-muted/30" : ""
                  } ${
                    order.status === "pending" ? "bg-yellow-50 border-l-4 border-l-yellow-400" : 
                    order.status === "processing" ? "bg-blue-50 border-l-4 border-l-blue-400" : ""
                  }`}
                >
                  <TableCell className="font-medium">{order.order_number || 'N/A'}</TableCell>
                  <TableCell className="font-medium">{order.customer_name || 'N/A'}</TableCell>
                  <TableCell className="font-medium">R$ {(order.total_amount || 0).toFixed(2)}</TableCell>
                  <TableCell className="text-sm">
                    {formatDistanceToNowLocalized(new Date(order.created_at))}
                  </TableCell>
                  <TableCell>
                    <OrderActionButtons
                      order={order}
                      onStatusChange={handleStatusChange}
                      onDeleteOrder={handleDeleteOrder}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenOrderDetails(order)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {selectedOrder && (
        <OrderModal 
          order={selectedOrder}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onStatusChange={handleStatusChange}
          onDeleteOrder={handleDeleteOrder}
          onOutForDelivery={(orderId) => {
            const order = orders.find(o => o.order_number === orderId);
            if (order) {
              handleStatusChange(orderId, "delivered");
            }
          }}
        />
      )}
    </div>
  );
};

export default RecentOrders;
