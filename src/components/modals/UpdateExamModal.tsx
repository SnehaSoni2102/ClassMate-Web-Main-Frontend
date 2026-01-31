import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useUpdateExam } from "@/lib/api/mutations/update-exam-mutation";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  exam: {
    _id: string;
    name: string;
    name_hi: string;
    logo: string;
  };
  onSuccess?: () => void;
}

export function UpdateExamModal({ isOpen, onClose, exam, onSuccess }: Props) {
  const [name, setName] = useState(exam.name);
  const [nameHi, setNameHi] = useState(exam.name_hi);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const { toast } = useToast();
  const updateExam = useUpdateExam();

  useEffect(() => {
    setName(exam.name);
    setNameHi(exam.name_hi);
    setLogoFile(null);
  }, [exam, isOpen]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLogoFile(file);
  };

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
    try {
      await updateExam.mutateAsync({
        id: exam._id,
        data: {
          name,
          name_hi: nameHi,
          ...(logoFile ? { logo: logoFile } : {}),
        },
      });
      toast({
        title: "Exam Updated",
        description: "Exam details updated successfully.",
      });
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast({
        title: "Failed to update exam",
        description: err?.response?.data?.message || err?.message || "Unknown error",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Exam</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Exam Name (English)</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name_hi">Exam Name (Hindi)</Label>
            <Input
              id="name_hi"
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
            {(logoFile || exam.logo) && (
              <div className="mt-2">
                <img
                  src={logoFile ? URL.createObjectURL(logoFile) : exam.logo}
                  alt="Preview"
                  className="h-20 w-20 object-contain border rounded"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateExam.isPending}>
              {updateExam.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 