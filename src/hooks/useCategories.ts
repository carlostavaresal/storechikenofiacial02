import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Category {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // @ts-ignore - Categories table will be created via migration
      const { data, error } = await (supabase as any)
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setCategories((data || []) as Category[]);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Erro ao carregar categorias",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (category: Omit<Category, "id" | "created_at" | "updated_at">) => {
    try {
      // @ts-ignore - Categories table will be created via migration
      const { data, error } = await (supabase as any)
        .from("categories")
        .insert([category])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Categoria adicionada",
        description: "A categoria foi criada com sucesso!",
      });

      await fetchCategories();
      return data;
    } catch (error: any) {
      console.error("Error adding category:", error);
      toast({
        title: "Erro ao adicionar categoria",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      // @ts-ignore - Categories table will be created via migration
      const { error } = await (supabase as any)
        .from("categories")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Categoria atualizada",
        description: "As alterações foram salvas com sucesso!",
      });

      await fetchCategories();
    } catch (error: any) {
      console.error("Error updating category:", error);
      toast({
        title: "Erro ao atualizar categoria",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      // @ts-ignore - Categories table will be created via migration
      const { error} = await (supabase as any)
        .from("categories")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Categoria excluída",
        description: "A categoria foi removida com sucesso!",
      });

      await fetchCategories();
    } catch (error: any) {
      console.error("Error deleting category:", error);
      toast({
        title: "Erro ao excluir categoria",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  };
};
