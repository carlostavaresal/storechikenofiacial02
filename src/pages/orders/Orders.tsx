
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { HomeIcon, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import OrderModal from "@/components/orders/OrderModal";
import OrderActionButtons from "@/components/orders/OrderActionButtons";
import { PaymentMethod } from "@/components/payment/PaymentMethodSelector";
import { useToast } from "@/hooks/use-toast";
import { useOrders } from "@/hooks/useOrders";
import { useWhatsAppIntegration } from "@/hooks/useWhatsAppIntegration";

const Orders: React.FC = () => {
  const { toast } = useToast();
  const { orders, loading, error, updateOrderStatus, deleteOrder } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Integrate WhatsApp automatic sending
  useWhatsAppIntegration();

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

    console.log(`[ORDERS] Atualizando status do pedido ${orderId} para ${newStatus}`);
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

    console.log(`[ORDERS] Excluindo pedido: ${orderId}`);
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
      <DashboardLayout>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Pedidos</h1>
          </div>
          <div className="rounded-lg border bg-card shadow">
            <div className="p-6 text-center text-muted-foreground">
              <p>Carregando pedidos...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Pedidos</h1>
          </div>
          <div className="rounded-lg border bg-card shadow">
            <div className="p-6 text-center text-red-600">
              <p>Erro ao carregar pedidos: {error}</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">
                <HomeIcon className="h-3 w-3 mr-1" />
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Pedidos</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gerenciar Pedidos - Tempo Real</h1>
        </div>

        <div className="rounded-lg border bg-card shadow">
          <div className="overflow-x-auto">
            {!orders || orders.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <p>Nenhum pedido encontrado</p>
                <p className="text-sm mt-1">Os pedidos aparecerão aqui quando forem realizados</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow 
                      key={order.id}
                      className={`${
                        order.status === "pending" ? "bg-yellow-50 border-l-4 border-l-yellow-400" : 
                        order.status === "processing" ? "bg-blue-50 border-l-4 border-l-blue-400" :
                        order.status === "cancelled" ? "bg-red-50 border-l-4 border-l-red-400" : ""
                      }`}
                    >
                      <TableCell className="font-medium">{order.order_number || 'N/A'}</TableCell>
                      <TableCell>{order.customer_name || 'N/A'}</TableCell>
                      <TableCell>{order.customer_phone || 'N/A'}</TableCell>
                      <TableCell>R$ {(order.total_amount || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(order.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
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
                          <Eye className="mr-1 h-3 w-3" />
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">Sistema de Envio Automático:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>WhatsApp Business:</strong> Pedidos novos são enviados automaticamente em até 2 minutos</li>
            <li>• <strong>Confirmar:</strong> Confirma o recebimento do pedido e notifica o cliente via WhatsApp</li>
            <li>• <strong>Saiu p/ Entrega:</strong> Marca como saindo para entrega e notifica o cliente</li>
            <li>• <strong>Excluir:</strong> Remove pedidos suspeitos do sistema</li>
            <li>• <strong>Ver:</strong> Abre detalhes completos do pedido</li>
          </ul>
        </div>
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
    </DashboardLayout>
  );
};

export default Orders;
