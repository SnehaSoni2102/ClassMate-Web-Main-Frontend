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
import moment from "moment";
import { useSearchExams } from "@/lib/api/queries/use-search-exams";
import { Loader2, Plus, Search, Trash2 } from "lucide-react";
import { useDeleteExam } from "@/lib/api/mutations/delete-exam-mutation";
import { ConfirmDeleteModal } from "@/components/modals/ConfirmDeleteModal";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function ExamsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data, isLoading, error } = useSearchExams(searchTerm);
  const deleteExam = useDeleteExam();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (!deleteId) return;
    deleteExam.mutate(deleteId, {
      onSuccess: () => {
        toast({ title: "Exam Deleted", description: "Exam deleted successfully." });
        setDeleteId(null);
        queryClient.invalidateQueries({ queryKey: ["search-exams"] });
      },
      onError: (err: any) => {
        toast({
          title: "Failed to delete exam",
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
            <h1 className="text-3xl font-bold tracking-tight">Exams</h1>
            <p className="text-muted-foreground mt-1">
              View and manage existing exams. Create new exams from category details.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search exams..."
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
            Failed to load exams. Please try again.
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Logo</TableHead>
                  <TableHead>Name (English)</TableHead>
                  <TableHead>Name (Hindi)</TableHead>
                  {/* <TableHead>Category</TableHead> */}
                  <TableHead>Created At</TableHead>
                  <TableHead className="w-16">Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.map((exam) => (
                  <TableRow key={exam._id}>
                    <TableCell>
                      <img
                        src={exam.logo}
                        alt={exam.name}
                        className="h-10 w-10 object-contain"
                      />
                    </TableCell>
                    <TableCell>
                      <Link className="text-blue-500 hover:underline" to={`/exams/${exam._id}`}>{exam.name}</Link>
                    </TableCell>
                    <TableCell>{exam.name_hi}</TableCell>
                    <TableCell>
                      {moment(exam.createdAt).format("MMM D, YYYY")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => setDeleteId(exam._id)}
                        disabled={deleteExam.isPending}
                        title="Delete Exam"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {data?.data?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No exams found
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
          isLoading={deleteExam.isPending}
          title="Delete Exam"
          description="Are you sure you want to delete this exam? This action cannot be undone."
        />
      </div>
    </AdminLayout>
  );
}
