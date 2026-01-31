import { useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Plus, Search, Loader2, Trash2 } from "lucide-react";
import { useSearchTopics } from "@/lib/api/queries/use-search-topics";
import { useDeleteTopic } from "@/lib/api/mutations/delete-topic-mutation";
import { useToast } from "@/components/ui/use-toast";
import { ConfirmDeleteModal } from "@/components/modals/ConfirmDeleteModal";
import { useQueryClient } from "@tanstack/react-query";
import moment from "moment";

export default function TopicsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data, isLoading, error } = useSearchTopics(searchTerm);
  const deleteTopic = useDeleteTopic();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (!deleteId) return;
    deleteTopic.mutate(deleteId, {
      onSuccess: () => {
        toast({ title: "Topic Deleted", description: "Topic deleted successfully." });
        setDeleteId(null);
        queryClient.invalidateQueries({ queryKey: ["search-topics"] });
      },
      onError: (err: any) => {
        toast({
          title: "Failed to delete topic",
          description: err?.response?.data?.message || err?.message || "Unknown error",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Topics</h1>
            <p className="text-muted-foreground mt-1">
              Manage and organize your topics.
            </p>
          </div>
          <Button asChild>
            <Link to="/topics/create">
              <Plus className="h-4 w-4 mr-2" />
              Add Topic
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search topics..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            Failed to load topics. Please try again.
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name (English)</TableHead>
                  <TableHead>Name (Hindi)</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="w-16">Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((topic) => (
                  <TableRow key={topic._id}>
                    <TableCell>
                      <Link className="text-blue-500 hover:underline" to={`/topics/${topic._id}`}>
                        {topic.name}
                      </Link>
                    </TableCell>
                    <TableCell>{topic.name_hi || "-"}</TableCell>
                    <TableCell>
                      {moment(topic.createdAt).format("MMM D, YYYY")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => setDeleteId(topic._id)}
                        disabled={deleteTopic.isPending}
                        title="Delete Topic"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {data?.data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No topics found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <ConfirmDeleteModal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          isLoading={deleteTopic.isPending}
          title="Delete Topic"
          description="Are you sure you want to delete this topic? This action cannot be undone."
        />
      </div>
    </AdminLayout>
  );
}