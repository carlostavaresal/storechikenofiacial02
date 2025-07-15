
import { useCompanySettings } from './useCompanySettings';

export const useCustomerNotifications = () => {
  const { settings } = useCompanySettings();

  const formatPhoneForWhatsApp = (phone: string) => {
    const numericOnly = phone.replace(/\D/g, "");
    if (numericOnly.length === 11 || numericOnly.length === 10) {
      return `55${numericOnly}`;
    }
    return numericOnly;
  };

  // Função para obter configurações de entrega do localStorage
  const getDeliverySettings = () => {
    try {
      const savedSettings = localStorage.getItem("deliverySettings");
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        return {
          estimatedTime: settings.estimatedTime || "30-45",
          preparationTime: settings.preparationTime || "25-35",
          deliveryTime: settings.deliveryTime || "15-20"
        };
      }
    } catch (error) {
      console.error("Error loading delivery settings:", error);
    }
    
    // Valores padrão se não houver configurações salvas
    return {
      estimatedTime: "30-45",
      preparationTime: "25-35", 
      deliveryTime: "15-20"
    };
  };

  const sendOrderConfirmation = (order: any) => {
    if (!order.customer_phone) {
      console.log('Customer phone not available for order:', order.order_number);
      return;
    }

    console.log(`Enviando confirmação de pedido para: ${order.customer_name} - ${order.order_number}`);

    const deliverySettings = getDeliverySettings();
    const itemsList = order.items.map((item: any) => 
      `${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    const message = `✅ *PEDIDO CONFIRMADO* - ${order.order_number}

Olá ${order.customer_name}! Seu pedido foi confirmado com sucesso.

📋 *Resumo do Pedido:*
${itemsList}

💰 *Total:* R$ ${order.total_amount.toFixed(2)}
💳 *Pagamento:* ${order.payment_method}

📍 *Endereço de Entrega:*
${order.customer_address}

${order.notes ? `📝 *Observações:* ${order.notes}` : ''}

⏰ *Tempo estimado:* ${deliverySettings.estimatedTime} minutos

Obrigado pela preferência! 🍕`;

    const encodedMessage = encodeURIComponent(message);
    const customerPhone = formatPhoneForWhatsApp(order.customer_phone);
    const whatsappUrl = `https://wa.me/${customerPhone}?text=${encodedMessage}`;
    
    console.log(`Enviando confirmação para cliente: ${customerPhone}`);
    window.open(whatsappUrl, '_blank');
  };

  const sendDeliveryNotification = (order: any) => {
    if (!order.customer_phone) {
      console.log('Customer phone not available for delivery notification:', order.order_number);
      return;
    }

    console.log(`Enviando notificação de entrega para: ${order.customer_name} - ${order.order_number}`);

    const deliverySettings = getDeliverySettings();
    const message = `🚚 *PEDIDO SAIU PARA ENTREGA* - ${order.order_number}

Olá ${order.customer_name}!

Seu pedido saiu para entrega e chegará em breve! 🎉

📋 *Pedido:* ${order.order_number}
📍 *Endereço:* ${order.customer_address}
💰 *Total:* R$ ${order.total_amount.toFixed(2)}

⏰ *Previsão de chegada:* ${deliverySettings.deliveryTime} minutos

Fique tranquilo nosso Entregador já está à caminho da sua Residência com seu Pedido! 
Obrigado pela preferência! 🍕`;

    const encodedMessage = encodeURIComponent(message);
    const customerPhone = formatPhoneForWhatsApp(order.customer_phone);
    const whatsappUrl = `https://wa.me/${customerPhone}?text=${encodedMessage}`;
    
    console.log(`Enviando notificação de entrega para cliente: ${customerPhone}`);
    window.open(whatsappUrl, '_blank');
  };

  const sendOrderReceived = (order: any) => {
    if (!order.customer_phone) {
      console.log('Customer phone not available for received notification:', order.order_number);
      return;
    }

    console.log(`Enviando notificação de recebimento para: ${order.customer_name} - ${order.order_number}`);

    const deliverySettings = getDeliverySettings();
    const message = `✅ *PEDIDO RECEBIDO* - ${order.order_number}

Olá ${order.customer_name}!

Recebemos seu pedido e já começamos a preparar! 👨‍🍳

📋 *Pedido:* ${order.order_number}
💰 *Total:* R$ ${order.total_amount.toFixed(2)}
💳 *Pagamento:* ${order.payment_method}

⏰ *Tempo estimado de preparo:* ${deliverySettings.preparationTime} minutos

Em breve você receberá uma nova notificação quando o pedido sair para entrega.

Obrigado pela preferência! 🍕`;

    const encodedMessage = encodeURIComponent(message);
    const customerPhone = formatPhoneForWhatsApp(order.customer_phone);
    const whatsappUrl = `https://wa.me/${customerPhone}?text=${encodedMessage}`;
    
    console.log(`Enviando notificação de recebimento para cliente: ${customerPhone}`);
    window.open(whatsappUrl, '_blank');
  };

  return {
    sendOrderConfirmation,
    sendDeliveryNotification,
    sendOrderReceived
  };
};
