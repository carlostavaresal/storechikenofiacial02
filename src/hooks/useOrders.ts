import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useInputValidation } from './useInputValidation';

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: OrderItem[];
  total_amount: number;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'cancelled';
  paid_at?: string | null;
  notes?: string | null;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export const useOrders = () => {
  const { validateAndSanitize, schemas } = useInputValidation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedOrders: Order[] = (data || []).map(row => ({
        ...row,
        items: Array.isArray(row.items) ? (row.items as unknown as OrderItem[]) : [],
        notes: row.notes || null,
        status: row.status as 'pending' | 'processing' | 'delivered' | 'cancelled',
        payment_status: row.payment_status as 'pending' | 'paid' | 'failed' | 'cancelled',
        paid_at: row.paid_at || null
      }));
      
      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error instanceof Error ? error.message : 'Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Orders realtime update:', payload);
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const createOrder = async (orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      
      // Validar dados de entrada
      const validation = validateAndSanitize(schemas.order, orderData);
      if (!validation.success) {
        const errorMessage = validation.errors?.join(', ') || 'Dados inválidos';
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      const validatedData = validation.data!;
      
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          customer_name: validatedData.customer_name,
          customer_phone: validatedData.customer_phone,
          customer_address: validatedData.customer_address,
          items: validatedData.items as any,
          total_amount: validatedData.total_amount,
          payment_method: validatedData.payment_method,
          payment_status: validatedData.payment_status || 'pending',
          notes: validatedData.notes,
          status: validatedData.status,
          order_number: ''
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error creating order';
      setError(errorMessage);
      throw error;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      setError(null);
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      setError(error instanceof Error ? error.message : 'Error updating order status');
      return false;
    }
  };

  const updatePaymentStatus = async (orderId: string, paymentStatus: Order['payment_status']) => {
    try {
      setError(null);
      const updateData: any = { payment_status: paymentStatus };
      
      if (paymentStatus === 'paid') {
        updateData.paid_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating payment status:', error);
      setError(error instanceof Error ? error.message : 'Error updating payment status');
      return false;
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      setError(null);
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      setError(error instanceof Error ? error.message : 'Error deleting order');
      return false;
    }
  };

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrderStatus,
    updatePaymentStatus,
    deleteOrder,
    refetch: fetchOrders
  };
};
