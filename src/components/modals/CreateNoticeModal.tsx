import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAddNoticeBoard } from "@/lib/api/mutations/use-notice-board-mutations";

interface CreateNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateNoticeModal({ isOpen, onClose }: CreateNoticeModalProps) {
  const [formData, setFormData] = useState({
    header: "",
    description: "",
    link: "",
  });

  const addNoticeMutation = useAddNoticeBoard();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.header.trim() || !formData.description.trim() || !formData.link.trim()) {
      return;
    }

    const payload = {
      header: formData.header.trim(),
      description: formData.description.trim(),
      link: formData.link.trim(),
    };

    try {
      await addNoticeMutation.mutateAsync(payload);
      setFormData({ header: "", description: "", link: "" });
      onClose();
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  };

  const handleClose = () => {
    setFormData({ header: "", description: "", link: "" });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Notice</DialogTitle>
          <DialogDescription>
            Add a new notice to inform your users about important updates or announcements.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="header">Header *</Label>
            <Input
              id="header"
              placeholder="Enter notice header..."
              value={formData.header}
              onChange={(e) => setFormData({ ...formData, header: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Enter notice description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">Link *</Label>
            <Input
              id="link"
              type="url"
              placeholder="https://example.com"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addNoticeMutation.isPending || !formData.header.trim() || !formData.description.trim() || !formData.link.trim()}
            >
              {addNoticeMutation.isPending ? "Creating..." : "Create Notice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
