import { useState, useEffect } from "react";
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
import { useUpdateNoticeBoard } from "@/lib/api/mutations/use-notice-board-mutations";

interface NoticeBoard {
  _id: string;
  user: string;
  header: string;
  description: string;
  link: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface EditNoticeModalProps {
  notice: NoticeBoard;
  isOpen: boolean;
  onClose: () => void;
}

export function EditNoticeModal({ notice, isOpen, onClose }: EditNoticeModalProps) {
  const [formData, setFormData] = useState({
    header: "",
    description: "",
    link: "",
  });

  const updateNoticeMutation = useUpdateNoticeBoard();

  useEffect(() => {
    if (notice) {
      setFormData({
        header: notice.header,
        description: notice.description,
        link: notice.link,
      });
    }
  }, [notice]);

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
      await updateNoticeMutation.mutateAsync({
        id: notice._id,
        payload,
      });
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
          <DialogTitle>Edit Notice</DialogTitle>
          <DialogDescription>
            Update the notice information and content.
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
              disabled={updateNoticeMutation.isPending || !formData.header.trim() || !formData.description.trim() || !formData.link.trim()}
            >
              {updateNoticeMutation.isPending ? "Updating..." : "Update Notice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
