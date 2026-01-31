import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useUpdateSubject } from "@/lib/api/mutations/update-subject-mutation";
import { Loader2 } from "lucide-react";
import { Subject } from "@/lib/api/queries/use-get-subject";

interface UpdateSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject;
  onSuccess: () => void;
}

export function UpdateSubjectModal({
  isOpen,
  onClose,
  subject,
  onSuccess,
}: UpdateSubjectModalProps) {
  const { toast } = useToast();
  const updateSubject = useUpdateSubject();
  const [name, setName] = useState(subject.name);
  const [nameHi, setNameHi] = useState(subject.name_hi || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !nameHi.trim()) {
      toast({
        title: "Error",
        description: "Subject names cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateSubject.mutateAsync({
        id: subject._id,
        name,
        name_hi: nameHi,
      });
      toast({
        title: "Subject Updated",
        description: `${name} has been updated successfully.`,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      toast({
        title: "Failed to update subject",
        description: err?.response?.data?.message || err?.message || "Unknown error",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Subject</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Subject Name (English)</Label>
            <Input
              id="name"
              placeholder="e.g., Physics"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name_hi">Subject Name (Hindi)</Label>
            <Input
              id="name_hi"
              placeholder="e.g., भौतिक विज्ञान"
              value={nameHi}
              onChange={(e) => setNameHi(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={updateSubject.isPending}
            >
              {updateSubject.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 