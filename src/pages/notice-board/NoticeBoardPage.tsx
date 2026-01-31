import { useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Plus, ExternalLink, Calendar, User } from "lucide-react";
import { useGetNoticeBoards } from "@/lib/api/queries/use-get-notice-boards";
import { useDeleteNoticeBoard } from "@/lib/api/mutations/use-notice-board-mutations";
import { CreateNoticeModal } from "@/components/modals/CreateNoticeModal";
import { EditNoticeModal } from "@/components/modals/EditNoticeModal";

export default function NoticeBoardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<any>(null);
  const [deletingNoticeId, setDeletingNoticeId] = useState<string | null>(null);

  const { data: noticeBoardsResponse, isLoading } = useGetNoticeBoards();
  const deleteNoticeMutation = useDeleteNoticeBoard();

  const filteredNotices = (noticeBoardsResponse?.data || []).filter((notice) =>
    notice.header.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notice.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = async () => {
    if (deletingNoticeId) {
      await deleteNoticeMutation.mutateAsync(deletingNoticeId);
      setDeletingNoticeId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Notice Board</h1>
          <p className="text-muted-foreground">
            Manage notices and announcements for your platform users.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <Input
            placeholder="Search notices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:max-w-sm"
          />
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Notice
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredNotices.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg">No notices found.</p>
              {searchTerm && (
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your search term.
                </p>
              )}
            </div>
          ) : (
            filteredNotices.map((notice) => (
              <Link key={notice._id} to={`/notice-board/${notice._id}`} className="block">
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{notice.header}</CardTitle>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(notice.createdAt)}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.preventDefault();
                            setEditingNotice(notice);
                          }}>
                            Edit Notice
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={(e) => {
                              e.preventDefault();
                              setDeletingNoticeId(notice._id);
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {notice.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {notice.user}
                        </span>
                      </div>
                      {notice.link && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(notice.link, '_blank', 'noopener,noreferrer');
                          }}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Link
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>

        {/* Create Notice Modal */}
        <CreateNoticeModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />

        {/* Edit Notice Modal */}
        {editingNotice && (
          <EditNoticeModal
            notice={editingNotice}
            isOpen={!!editingNotice}
            onClose={() => setEditingNotice(null)}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingNoticeId} onOpenChange={() => setDeletingNoticeId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Notice</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this notice? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleteNoticeMutation.isPending}
              >
                {deleteNoticeMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
