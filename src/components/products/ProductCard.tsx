
import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { Product } from "./ProductsList";
import EditProductModal from "./EditProductModal";
import { useToast } from "@/hooks/use-toast";
import { useProducts } from "@/hooks/useProducts";
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

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { toast } = useToast();
  const { deleteProduct } = useProducts();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    
    try {
      // Try Supabase first
      const success = await deleteProduct(product.id);
      
      if (success) {
        toast({
          title: "Produto excluído",
          description: `${product.name} foi removido com sucesso.`,
        });
      } else {
        // Fallback to localStorage
        const savedProducts = localStorage.getItem("products");
        if (savedProducts) {
          const products = JSON.parse(savedProducts);
          const updatedProducts = products.filter((p: Product) => p.id !== product.id);
          localStorage.setItem("products", JSON.stringify(updatedProducts));
          
          // Dispatch event to notify components
          window.dispatchEvent(new Event("productsUpdated"));
          
          toast({
            title: "Produto excluído",
            description: `${product.name} foi removido com sucesso.`,
          });
        }
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir produto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <Card className="transition-all hover:shadow-md">
        <div className="relative pt-[75%]">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover rounded-t-lg"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium line-clamp-1 mb-1">{product.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{product.description}</p>
          <p className="text-lg font-semibold text-primary">{formatCurrency(product.price)}</p>
          <p className="text-xs text-muted-foreground mt-1">{product.category}</p>
        </CardContent>
        <CardFooter className="flex justify-between gap-2 p-4 pt-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowEditModal(true)}
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => setShowDeleteDialog(true)}
            disabled={isDeleting}
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? "Excluindo..." : "Excluir"}
          </Button>
        </CardFooter>
      </Card>

      {/* Edit Modal */}
      <EditProductModal 
        open={showEditModal} 
        onOpenChange={setShowEditModal} 
        product={product} 
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o produto "{product.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProductCard;
