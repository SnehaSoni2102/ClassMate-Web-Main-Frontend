import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useUpdateTopic } from "@/lib/api/mutations/update-topic-mutation";
import { Loader2 } from "lucide-react";
import { Topic } from "@/lib/api/queries/use-get-topic";
import { useQueryClient } from "@tanstack/react-query";

interface UpdateTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: Topic;
  onSuccess: () => void;
}

export function UpdateTopicModal({
  isOpen,
  onClose,
  topic,
  onSuccess,
}: UpdateTopicModalProps) {
  const { toast } = useToast();
  const updateTopic = useUpdateTopic();
  const [name, setName] = useState(topic.name);
  const [nameHi, setNameHi] = useState(topic.name_hi);
  const queryClient = useQueryClient();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !nameHi.trim()) {
      toast({
        title: "Error",
        description: "Topic names cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateTopic.mutateAsync({
        id: topic._id,
        name,
        name_hi: nameHi,
      });
      toast({
        title: "Topic Updated",
        description: `${name} has been updated successfully.`,
      });
      await queryClient.invalidateQueries({ queryKey: ["search-topics"] });
      onSuccess();
      onClose();
    } catch (err: any) {
      toast({
        title: "Failed to update topic",
        description: err?.response?.data?.message || err?.message || "Unknown error",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Topic</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Topic Name (English)</Label>
            <Input
              id="name"
              placeholder="e.g., Mechanics"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name_hi">Topic Name (Hindi)</Label>
            <Input
              id="name_hi"
              placeholder="e.g., यांत्रिकी"
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
              disabled={updateTopic.isPending}
            >
              {updateTopic.isPending ? (
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