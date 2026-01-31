import { useState } from "react";
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
import { useCreateCategory } from "@/lib/api/mutations/create-category-mutation";
import { useQueryClient } from "@tanstack/react-query";
import { CategoryTree } from "@/lib/api/queries/use-get-category-tree";

interface CreateChildCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentCategory: CategoryTree;
  onSuccess?: () => void;
}

export function CreateChildCategoryModal({
  isOpen,
  onClose,
  parentCategory,
  onSuccess,
}: CreateChildCategoryModalProps) {
  const { toast } = useToast();
  const createCategory = useCreateCategory();
  const queryClient = useQueryClient();
  
  const [name, setName] = useState("");
  const [nameHi, setNameHi] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionHi, setDescriptionHi] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !nameHi.trim() || !description.trim() || !descriptionHi.trim()) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    if (!logoFile) {
      toast({
        title: "Error",
        description: "Please select a logo image",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("name_hi", nameHi);
    formData.append("description", description);
    formData.append("description_hi", descriptionHi);
    formData.append("logo", logoFile);
    formData.append("parent", parentCategory._id);

    try {
      await createCategory.mutateAsync(formData);
      toast({
        title: "Child Category Created",
        description: `${name} has been created successfully under ${parentCategory.name}.`,
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
        title: "Failed to create child category",
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
          <DialogTitle>Create Child Category under {parentCategory.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto pr-2">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name (English) *</Label>
            <Input
              id="name"
              placeholder="e.g., TIER 1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name_hi">Category Name (Hindi) *</Label>
            <Input
              id="name_hi"
              placeholder="e.g., टियर 1"
              value={nameHi}
              onChange={(e) => setNameHi(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (English) *</Label>
            <Textarea
              id="description"
              placeholder="Enter category description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description_hi">Description (Hindi) *</Label>
            <Textarea
              id="description_hi"
              placeholder="Enter category description in Hindi..."
              value={descriptionHi}
              onChange={(e) => setDescriptionHi(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Logo *</Label>
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              required
            />
            {logoFile && (
              <div className="mt-2">
                <img
                  src={URL.createObjectURL(logoFile)}
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
            disabled={createCategory.isPending}
            onClick={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }}
          >
            {createCategory.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Child Category'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 