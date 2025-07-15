
import { useCompanySettings } from './useCompanySettings';

export const useCustomerNotifications = () => {
  const { settings } = useCompanySettings();

  const formatPhoneForWhatsApp = (phone: string) => {
    if (!phone) return '';
    const numericOnly = phone.replace(/\D/g, "");
    if (numericOnly.length === 11 || numericOnly.length === 10) {
      return `55${numericOnly}`;
    }
    return numericOnly;
  };

  const getDeliverySettings = () => {
    try {
      const savedSettings = localStorage.getItem("deliverySettings");
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        return {
          estimatedTime: settings.estimatedTime || "40",
          preparationTime: settings.preparationTime || "25-35",
          deliveryTime: settings.deliveryTime || "15-20"
        };
      }
    } catch (error) {
      console.error("Error loading delivery settings:", error);
    }
    
    return {
      estimatedTime: "40",
      preparationTime: "25-35", 
      deliveryTime: "15-20"
    };
  };

  const getPixInstructions = (paymentMethod: string) => {
    if (paymentMethod === 'pix' && settings?.pix_enabled && settings?.pix_email) {
      return `\n💳 *INSTRUÇÕES PIX:*
🔑 *Chave PIX (Email):* ${settings.pix_email}
📱 *Para pagar:*
1. Abra seu app bancário
2. Escolha PIX
3. Cole a chave: ${settings.pix_email}
4. Confirme o valor: R$ {total}
5. Finalize o pagamento

⚠️ *IMPORTANTE:* Após realizar o pagamento, envie o comprovante para confirmar o pedido!`;
    }
    return '';
  };

  const sendOrderConfirmation = (order: any) => {
    if (!order?.customer_phone) {
      console.log('Customer phone not available for order:', order?.order_number || 'unknown');
      return;
    }

    console.log(`[CONFIRMAÇÃO] Enviando confirmação de pedido para: ${order.customer_name} - ${order.order_number}`);

    const deliverySettings = getDeliverySettings();
    
    if (!order.items || !Array.isArray(order.items)) {
      console.error('Invalid order items for confirmation:', order.items);
      return;
    }

    const itemsList = order.items.map((item: any) => 
      `${item.quantity || 0}x ${item.name || 'Item'} - R$ ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}`
    ).join('\n');

    const pixInstructions = getPixInstructions(order.payment_method).replace('{total}', (order.total_amount || 0).toFixed(2));

    const message = `✅ *PEDIDO CONFIRMADO* - ${order.order_number || 'N/A'}

Olá ${order.customer_name || 'Cliente'}! Seu pedido foi confirmado com sucesso.

📋 *Resumo do Pedido:*
${itemsList}

💰 *Total:* R$ ${(order.total_amount || 0).toFixed(2)}
💳 *Pagamento:* ${order.payment_method || 'N/A'}

📍 *Endereço de Entrega:*
${order.customer_address || 'N/A'}

${order.notes ? `📝 *Observações:* ${order.notes}` : ''}

⏰ *Tempo estimado:* ${deliverySettings.estimatedTime} minutos${pixInstructions}

Obrigado pela preferência! 🍕`;

    const encodedMessage = encodeURIComponent(message);
    const customerPhone = formatPhoneForWhatsApp(order.customer_phone);
    
    if (!customerPhone) {
      console.error('Invalid customer phone for confirmation:', order.customer_phone);
      return;
    }

    const whatsappUrl = `https://wa.me/${customerPhone}?text=${encodedMessage}`;
    
    console.log(`[CONFIRMAÇÃO] URL gerada para cliente: ${customerPhone}`);
    window.open(whatsappUrl, '_blank');
  };

  const sendDeliveryNotification = (order: any) => {
    if (!order?.customer_phone) {
      console.log('Customer phone not available for delivery notification:', order?.order_number || 'unknown');
      return;
    }

    console.log(`[ENTREGA] Enviando notificação de entrega para: ${order.customer_name} - ${order.order_number}`);

    const deliverySettings = getDeliverySettings();
    const message = `🚚 *PEDIDO SAIU PARA ENTREGA* - ${order.order_number || 'N/A'}

Olá ${order.customer_name || 'Cliente'}!

Seu pedido saiu para entrega e chegará em breve! 🎉

📋 *Pedido:* ${order.order_number || 'N/A'}
📍 *Endereço:* ${order.customer_address || 'N/A'}
💰 *Total:* R$ ${(order.total_amount || 0).toFixed(2)}

⏰ *Previsão de chegada:* ${deliverySettings.deliveryTime} minutos

Fique tranquilo nosso Entregador já está à caminho da sua Residência com seu Pedido! 
Obrigado pela preferência! 🍕`;

    const encodedMessage = encodeURIComponent(message);
    const customerPhone = formatPhoneForWhatsApp(order.customer_phone);
    
    if (!customerPhone) {
      console.error('Invalid customer phone for delivery:', order.customer_phone);
      return;
    }

    const whatsappUrl = `https://wa.me/${customerPhone}?text=${encodedMessage}`;
    
    console.log(`[ENTREGA] URL gerada para cliente: ${customerPhone}`);
    window.open(whatsappUrl, '_blank');
  };

  const sendOrderReceived = (order: any) => {
    if (!order?.customer_phone) {
      console.log('Customer phone not available for received notification:', order?.order_number || 'unknown');
      return;
    }

    console.log(`[RECEBIDO] Enviando notificação de recebimento para: ${order.customer_name} - ${order.order_number}`);

    const deliverySettings = getDeliverySettings();
    const pixInstructions = getPixInstructions(order.payment_method).replace('{total}', (order.total_amount || 0).toFixed(2));

    const message = `✅ *PEDIDO RECEBIDO* - ${order.order_number || 'N/A'}

Olá ${order.customer_name || 'Cliente'}!

Recebemos seu pedido e já começamos a preparar! 👨‍🍳

📋 *Pedido:* ${order.order_number || 'N/A'}
💰 *Total:* R$ ${(order.total_amount || 0).toFixed(2)}
💳 *Pagamento:* ${order.payment_method || 'N/A'}

⏰ *Tempo estimado de preparo:* ${deliverySettings.preparationTime} minutos${pixInstructions}

Em breve você receberá uma nova notificação quando o pedido sair para entrega.

Obrigado pela preferência! 🍕`;

    const encodedMessage = encodeURIComponent(message);
    const customerPhone = formatPhoneForWhatsApp(order.customer_phone);
    
    if (!customerPhone) {
      console.error('Invalid customer phone for received notification:', order.customer_phone);
      return;
    }

    const whatsappUrl = `https://wa.me/${customerPhone}?text=${encodedMessage}`;
    
    console.log(`[RECEBIDO] URL gerada para cliente: ${customerPhone}`);
    window.open(whatsappUrl, '_blank');
  };

  return {
    sendOrderConfirmation,
    sendDeliveryNotification,
    sendOrderReceived
  };
};
