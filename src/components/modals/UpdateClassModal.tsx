import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useUpdateClass } from "@/lib/api/mutations/update-class-mutation";
import { Class } from "@/lib/api/queries/use-get-class";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface UpdateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData: Class;
  onSuccess: () => void;
}

export function UpdateClassModal({ isOpen, onClose, classData, onSuccess }: UpdateClassModalProps) {
  const [name, setName] = useState(classData.name);
  const { toast } = useToast();
  const updateClass = useUpdateClass();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Class name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateClass.mutateAsync({ id: classData._id, name });
      toast({
        title: "Class Updated",
        description: `${name} has been updated successfully.`,
      });
      await queryClient.invalidateQueries({ queryKey: ["search-classes"] });
      onSuccess();
      onClose();
    } catch (err: any) {
      toast({
        title: "Failed to update class",
        description: err?.response?.data?.message || err?.message || "Unknown error",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Class</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Class Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter class name"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateClass.isPending}>
              {updateClass.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 