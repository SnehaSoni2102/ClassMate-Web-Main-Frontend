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
import { useSearchClasses } from "@/lib/api/queries/use-search-classes";
import { useDeleteClass } from "@/lib/api/mutations/delete-class-mutation";
import { useToast } from "@/components/ui/use-toast";
import { ConfirmDeleteModal } from "@/components/modals/ConfirmDeleteModal";
import { useQueryClient } from "@tanstack/react-query";
import moment from "moment";

export default function ClassesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data, isLoading, error } = useSearchClasses(searchTerm);
  const deleteClass = useDeleteClass();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (!deleteId) return;
    deleteClass.mutate(deleteId, {
      onSuccess: () => {
        toast({ title: "Class Deleted", description: "Class deleted successfully." });
        setDeleteId(null);
        queryClient.invalidateQueries({ queryKey: ["search-classes"] });
      },
      onError: (err: any) => {
        toast({
          title: "Failed to delete class",
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
            <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
            <p className="text-muted-foreground mt-1">
              Manage and organize your classes.
            </p>
          </div>
          <Button asChild>
            <Link to="/classes/create">
              <Plus className="h-4 w-4 mr-2" />
              Add Class
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search classes..."
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
            Failed to load classes. Please try again.
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="w-16">Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((cls) => (
                  <TableRow key={cls._id}>
                    <TableCell>
                      <Link className="text-blue-500 hover:underline" to={`/classes/${cls._id}`}>
                        {cls.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {moment(cls.createdAt).format("MMM D, YYYY")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => setDeleteId(cls._id)}
                        disabled={deleteClass.isPending}
                        title="Delete Class"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {data?.data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      No classes found
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
          isLoading={deleteClass.isPending}
          title="Delete Class"
          description="Are you sure you want to delete this class? This action cannot be undone."
        />
      </div>
    </AdminLayout>
  );
}