import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useCategories, Category } from "@/hooks/useCategories";
import { CategoryModal } from "@/components/categories/CategoryModal";
import { CategoryCard } from "@/components/categories/CategoryCard";
import LoadingSpinner from "@/components/layout/LoadingSpinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Categories = () => {
  const { categories, loading, addCategory, updateCategory, deleteCategory } = useCategories();
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAddClick = () => {
    setEditingCategory(null);
    setShowModal(true);
  };

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleSave = async (categoryData: any) => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, categoryData);
    } else {
      await addCategory(categoryData);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingId) {
      await deleteCategory(deletingId);
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Categorias</h2>
            <p className="text-muted-foreground">
              Organize seus produtos em categorias para facilitar a navegação
            </p>
          </div>
          <Button onClick={handleAddClick}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Categoria
          </Button>
        </div>
        
        <Separator />

        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Nenhuma categoria cadastrada ainda
            </p>
            <Button onClick={handleAddClick}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeira Categoria
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={handleEditClick}
                onDelete={setDeletingId}
              />
            ))}
          </div>
        )}

        <CategoryModal
          open={showModal}
          onOpenChange={setShowModal}
          onSave={handleSave}
          category={editingCategory}
        />

        <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.
                Os produtos desta categoria não serão excluídos, apenas desvinculados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default Categories;
