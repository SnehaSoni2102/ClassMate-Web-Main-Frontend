import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCreateExam } from "@/lib/api/mutations/create-exam-mutation";
import { useQueryClient } from "@tanstack/react-query";
import { CategoryTree } from "@/lib/api/queries/use-get-category-tree";

interface CreateExamFromCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryTree;
  onSuccess?: () => void;
}

export function CreateExamFromCategoryModal({
  isOpen,
  onClose,
  category,
  onSuccess,
}: CreateExamFromCategoryModalProps) {
  const { toast } = useToast();
  const createExam = useCreateExam();
  const queryClient = useQueryClient();
  
  const [name, setName] = useState("");
  const [nameHi, setNameHi] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !nameHi.trim()) {
      toast({
        title: "Error",
        description: "Exam names cannot be empty",
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
    formData.append("categoryId", category._id);
    formData.append("logo", logoFile);

    try {
      await createExam.mutateAsync(formData);
      toast({
        title: "Exam Created",
        description: `${name} has been created successfully in ${category.name}.`,
      });
      
      // Reset form
      setName("");
      setNameHi("");
      setLogoFile(null);
      
      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: ["get-category-tree"] });
      await queryClient.invalidateQueries({ queryKey: ["search-exams"] });
      
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast({
        title: "Failed to create exam",
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
          <DialogTitle>Create New Exam in {category.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto pr-2">
          <div className="space-y-2">
            <Label htmlFor="name">Exam Name (English)</Label>
            <Input
              id="name"
              placeholder="e.g., SSC Constable"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name_hi">Exam Name (Hindi)</Label>
            <Input
              id="name_hi"
              placeholder="e.g., एसएससी कांस्टेबल"
              value={nameHi}
              onChange={(e) => setNameHi(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Logo</Label>
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
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
            disabled={createExam.isPending}
            onClick={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }}
          >
            {createExam.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Exam'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 