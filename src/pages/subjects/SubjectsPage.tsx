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
import { useSearchSubjects } from "@/lib/api/queries/use-search-subjects";
import moment from "moment";
import { useDeleteSubject } from "@/lib/api/mutations/delete-subject-mutation";
import { useToast } from "@/components/ui/use-toast";
import { ConfirmDeleteModal } from "@/components/modals/ConfirmDeleteModal";
import { useQueryClient } from "@tanstack/react-query";

export default function SubjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data, isLoading, error } = useSearchSubjects(searchTerm);
  const deleteSubject = useDeleteSubject();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (!deleteId) return;
    deleteSubject.mutate(deleteId, {
      onSuccess: () => {
        toast({ title: "Subject Deleted", description: "Subject deleted successfully." });
        setDeleteId(null);
        queryClient.invalidateQueries({ queryKey: ["search-subjects"] });
      },
      onError: (err: any) => {
        toast({
          title: "Failed to delete subject",
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
            <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
            <p className="text-muted-foreground mt-1">
              Manage and organize your subjects.
            </p>
          </div>
          <Button asChild>
            <Link to="/subjects/create">
              <Plus className="h-4 w-4 mr-2" />
              Add Subject
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subjects..."
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
            Failed to load subjects. Please try again.
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
                {data?.data.map((subject) => (
                  <TableRow key={subject._id}>
                    <TableCell>
                      <Link className="text-blue-500 hover:underline" to={`/subjects/${subject._id}`}>
                        {subject.name}
                      </Link>
                    </TableCell>
                    <TableCell>{subject.name_hi || "-"}</TableCell>
                    <TableCell>
                      {moment(subject.createdAt).format("MMM D, YYYY")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => setDeleteId(subject._id)}
                        disabled={deleteSubject.isPending}
                        title="Delete Subject"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {data?.data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No subjects found
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
          isLoading={deleteSubject.isPending}
          title="Delete Subject"
          description="Are you sure you want to delete this subject? This action cannot be undone."
        />
      </div>
    </AdminLayout>
  );
}