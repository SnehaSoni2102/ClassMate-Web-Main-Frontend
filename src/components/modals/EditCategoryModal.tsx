import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useUpdateCategory } from "@/lib/api/mutations/update-category-mutation";
import { useQueryClient } from "@tanstack/react-query";
import { CategoryTree } from "@/lib/api/queries/use-get-category-tree";

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryTree;
  onSuccess?: () => void;
}

export function EditCategoryModal({
  isOpen,
  onClose,
  category,
  onSuccess,
}: EditCategoryModalProps) {
  const { toast } = useToast();
  const updateCategory = useUpdateCategory();
  const queryClient = useQueryClient();
  
  const [name, setName] = useState("");
  const [nameHi, setNameHi] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionHi, setDescriptionHi] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  
  // Initialize form with current category data
  useEffect(() => {
    if (category) {
      setName(category.name || "");
      setNameHi(category.name_hi || "");
      setDescription(category.description || "");
      setDescriptionHi(category.description_hi || "");
      setLogoFile(null);
    }
  }, [category]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    
    // Only append fields that have values
    if (name.trim()) formData.append("name", name);
    if (nameHi.trim()) formData.append("name_hi", nameHi);
    if (description.trim()) formData.append("description", description);
    if (descriptionHi.trim()) formData.append("description_hi", descriptionHi);
    if (logoFile) formData.append("logo", logoFile);

    try {
      await updateCategory.mutateAsync({ id: category._id, formData });
      toast({
        title: "Category Updated",
        description: `${category.name} has been updated successfully.`,
      });
      
      // Reset form
      setName("");
      setNameHi("");
      setDescription("");
      setDescriptionHi("");
      setLogoFile(null);
      
      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: ["get-category-tree"] });
      await queryClient.invalidateQueries({ queryKey: ["get-top-categories"] });
      
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast({
        title: "Failed to update category",
        description: err?.response?.data?.message || err?.message || "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLogoFile(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Category: {category.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto pr-2">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name (English)</Label>
            <Input
              id="name"
              placeholder="e.g., SSC Constable"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name_hi">Category Name (Hindi)</Label>
            <Input
              id="name_hi"
              placeholder="e.g., एसएससी कांस्टेबल"
              value={nameHi}
              onChange={(e) => setNameHi(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (English)</Label>
            <Textarea
              id="description"
              placeholder="Enter category description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description_hi">Description (Hindi)</Label>
            <Textarea
              id="description_hi"
              placeholder="Enter category description in Hindi..."
              value={descriptionHi}
              onChange={(e) => setDescriptionHi(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Logo (Optional)</Label>
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
            />
            {(logoFile || category.logo) && (
              <div className="mt-2">
                <img
                  src={logoFile ? URL.createObjectURL(logoFile) : category.logo}
                  alt="Preview"
                  className="h-20 w-20 object-contain border rounded"
                />
              </div>
            )}
          </div>
        </form>

        <div className="flex items-center justify-end space-x-2 pt-4 border-t mt-4">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={updateCategory.isPending}
            onClick={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }}
          >
            {updateCategory.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Category'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 