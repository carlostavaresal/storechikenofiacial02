
import { useEffect, useRef } from 'react';
import { useOrders } from './useOrders';
import { useCompanySettings } from './useCompanySettings';
import { useToast } from './use-toast';

export const useWhatsAppIntegration = () => {
  const { orders } = useOrders();
  const { settings } = useCompanySettings();
  const { toast } = useToast();
  const processedOrdersRef = useRef(new Set<string>());

  // Format WhatsApp number for proper linking
  const formatPhoneForWhatsApp = (phone: string) => {
    if (!phone) return '';
    const numericOnly = phone.replace(/\D/g, "");
    if (numericOnly.length === 11 || numericOnly.length === 10) {
      return `55${numericOnly}`;
    }
    return numericOnly;
  };

  const getPixInstructions = (order: any) => {
    if (order.payment_method === 'pix' && settings?.pix_enabled && settings?.pix_email) {
      return `\n💳 *INSTRUÇÕES PIX:*
🔑 *Chave PIX (Email):* ${settings.pix_email}
💰 *Valor:* R$ ${(order.total_amount || 0).toFixed(2)}

📱 *Para pagar:*
1. Abra seu app bancário
2. Escolha PIX
3. Cole a chave: ${settings.pix_email}
4. Confirme o valor: R$ ${(order.total_amount || 0).toFixed(2)}
5. Finalize o pagamento

⚠️ *IMPORTANTE:* Após realizar o pagamento PIX, envie o comprovante para este WhatsApp para confirmar o pedido!`;
    }
    return '';
  };

  const sendOrderToWhatsApp = (order: any) => {
    if (!settings?.whatsapp_number) {
      console.log('WhatsApp Business number not configured');
      toast({
        title: "Configuração necessária",
        description: "Configure o número do WhatsApp Business nas configurações",
        variant: "destructive",
      });
      return;
    }

    if (!order?.items || !Array.isArray(order.items)) {
      console.error('Invalid order items:', order.items);
      return;
    }

    const itemsList = order.items.map((item: any) => 
      `${item.quantity || 0}x ${item.name || 'Item'} - R$ ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}`
    ).join('\n');

    const pixInstructions = getPixInstructions(order);

    const message = `🍕 *NOVO PEDIDO* - ${order.order_number || 'N/A'}

👤 *Cliente:* ${order.customer_name || 'N/A'}
📞 *Telefone:* ${order.customer_phone || 'N/A'}
📍 *Endereço:* ${order.customer_address || 'N/A'}

📝 *Itens:*
${itemsList}

💰 *Total:* R$ ${(order.total_amount || 0).toFixed(2)}
💳 *Pagamento:* ${order.payment_method || 'N/A'}
${order.notes ? `📋 *Observações:* ${order.notes}` : ''}

⏰ *Pedido realizado em:* ${new Date(order.created_at).toLocaleString('pt-BR')}${pixInstructions}

Por favor, confirme o recebimento deste pedido.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappBusinessNumber = formatPhoneForWhatsApp(settings.whatsapp_number);
    
    if (!whatsappBusinessNumber) {
      console.error('Invalid WhatsApp number:', settings.whatsapp_number);
      return;
    }

    const whatsappUrl = `https://wa.me/${whatsappBusinessNumber}?text=${encodedMessage}`;
    
    // Open WhatsApp Business automatically
    console.log(`Enviando pedido ${order.order_number} para WhatsApp Business: ${whatsappBusinessNumber}`);
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "Pedido enviado para WhatsApp Business",
      description: `Pedido ${order.order_number} foi redirecionado automaticamente`,
    });

    // Mark order as processed
    processedOrdersRef.current.add(order.id);
  };

  // Monitor new orders and automatically send to WhatsApp
  useEffect(() => {
    if (!orders || orders.length === 0 || !settings?.whatsapp_number) return;

    // Check for new orders that haven't been processed
    const newOrders = orders.filter(order => {      
      // Only process pending orders
      if (order.status !== 'pending') return false;
      
      // Skip if already processed
      if (processedOrdersRef.current.has(order.id)) return false;
      
      // Check if it's a new order (created within last 2 minutes)
      const orderTime = new Date(order.created_at).getTime();
      const now = new Date().getTime();
      const timeDiff = now - orderTime;
      const twoMinutesInMs = 2 * 60 * 1000;
      
      return timeDiff < twoMinutesInMs;
    });

    // Process each new order (limit to prevent spam)
    newOrders.slice(0, 3).forEach(order => {
      console.log(`Processando novo pedido: ${order.order_number}`);
      sendOrderToWhatsApp(order);
    });

  }, [orders, settings]);

  // Reset processed orders when orders list changes significantly
  useEffect(() => {
    if (!orders || orders.length === 0) return;
    
    const currentOrderIds = new Set(orders.map(order => order.id));
    const processedIds = Array.from(processedOrdersRef.current);
    
    // Remove processed IDs that are no longer in the orders list
    processedIds.forEach(id => {
      if (!currentOrderIds.has(id)) {
        processedOrdersRef.current.delete(id);
      }
    });
  }, [orders]);

  return {
    sendOrderToWhatsApp
  };
};
