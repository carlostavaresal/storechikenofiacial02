
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  image_url: string | null;
  is_available: boolean | null;
  created_at: string;
  updated_at: string;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      return !!user;
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      return false;
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const savedProducts = localStorage.getItem("products");
      if (savedProducts) {
        const parsedProducts = JSON.parse(savedProducts);
        console.log('Loaded products from localStorage:', parsedProducts);
        setProducts(parsedProducts);
        return true;
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
    return false;
  };

  const saveToLocalStorage = (productsData: Product[]) => {
    try {
      localStorage.setItem("products", JSON.stringify(productsData));
      window.dispatchEvent(new Event("productsUpdated"));
      console.log('Products saved to localStorage:', productsData);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setError(null);
      console.log('Fetching products...');
      
      const isAuth = await checkAuth();
      
      if (isAuth) {
        console.log('User authenticated, fetching from Supabase...');
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        
        console.log('Products fetched from Supabase:', data);
        setProducts(data || []);
        
        // Also save to localStorage as backup
        if (data && data.length > 0) {
          saveToLocalStorage(data);
        }
      } else {
        console.log('User not authenticated, loading from localStorage...');
        loadFromLocalStorage();
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error instanceof Error ? error.message : 'Error fetching products');
      
      // Fallback to localStorage
      console.log('Falling back to localStorage...');
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    
    // Setup realtime subscription only if authenticated
    const setupRealtime = async () => {
      const isAuth = await checkAuth();
      if (!isAuth) return;

      const channel = supabase
        .channel('products-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'products'
          },
          (payload) => {
            console.log('Products realtime update:', payload);
            fetchProducts();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtime();

    // Listen for localStorage updates
    const handleStorageUpdate = () => {
      fetchProducts();
    };

    window.addEventListener('productsUpdated', handleStorageUpdate);

    return () => {
      window.removeEventListener('productsUpdated', handleStorageUpdate);
    };
  }, []);

  const createProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      console.log('Creating product:', productData);
      
      const isAuth = await checkAuth();
      
      if (isAuth) {
        console.log('Creating product in Supabase...');
        const { data, error } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();

        if (error) throw error;
        
        console.log('Product created in Supabase:', data);
        await fetchProducts(); // Refresh the list
        return data;
      } else {
        // Fallback to localStorage
        console.log('Creating product in localStorage...');
        const newProduct: Product = {
          id: crypto.randomUUID(),
          ...productData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        const updatedProducts = [newProduct, ...products];
        setProducts(updatedProducts);
        saveToLocalStorage(updatedProducts);
        
        console.log('Product created in localStorage:', newProduct);
        return newProduct;
      }
    } catch (error) {
      console.error('Error creating product:', error);
      setError(error instanceof Error ? error.message : 'Error creating product');
      throw error;
    }
  };

  const updateProduct = async (productId: string, productData: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      setError(null);
      console.log('Updating product:', productId, productData);
      
      const isAuth = await checkAuth();
      
      if (isAuth) {
        console.log('Updating product in Supabase...');
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', productId);

        if (error) throw error;
        
        console.log('Product updated in Supabase');
        await fetchProducts(); // Refresh the list
        return true;
      } else {
        // Fallback to localStorage
        console.log('Updating product in localStorage...');
        const updatedProducts = products.map(p => {
          if (p.id === productId) {
            return {
              ...p,
              ...productData,
              updated_at: new Date().toISOString(),
            };
          }
          return p;
        });
        
        setProducts(updatedProducts);
        saveToLocalStorage(updatedProducts);
        
        console.log('Product updated in localStorage');
        return true;
      }
    } catch (error) {
      console.error('Error updating product:', error);
      setError(error instanceof Error ? error.message : 'Error updating product');
      return false;
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      setError(null);
      console.log('Deleting product:', productId);
      
      const isAuth = await checkAuth();
      
      if (isAuth) {
        console.log('Deleting product from Supabase...');
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', productId);

        if (error) throw error;
        
        console.log('Product deleted from Supabase');
        await fetchProducts(); // Refresh the list
        return true;
      } else {
        // Fallback to localStorage
        console.log('Deleting product from localStorage...');
        const updatedProducts = products.filter(p => p.id !== productId);
        setProducts(updatedProducts);
        saveToLocalStorage(updatedProducts);
        
        console.log('Product deleted from localStorage');
        return true;
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setError(error instanceof Error ? error.message : 'Error deleting product');
      return false;
    }
  };

  return {
    products,
    loading,
    error,
    isAuthenticated,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts
  };
};
