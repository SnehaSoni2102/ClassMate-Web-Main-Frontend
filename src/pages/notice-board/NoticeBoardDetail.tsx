import { useParams, Link } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Calendar, User, Edit, Trash2 } from "lucide-react";
import { useGetNoticeBoard } from "@/lib/api/queries/use-get-notice-board";
import { useDeleteNoticeBoard } from "@/lib/api/mutations/use-notice-board-mutations";
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
import { useState } from "react";
import { EditNoticeModal } from "@/components/modals/EditNoticeModal";
import { useNavigate } from "react-router-dom";

export default function NoticeBoardDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: noticeResponse, isLoading } = useGetNoticeBoard(id!);
  const deleteNoticeMutation = useDeleteNoticeBoard();

  const notice = noticeResponse?.data;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = async () => {
    if (id) {
      await deleteNoticeMutation.mutateAsync(id);
      navigate("/notice-board");
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex flex-col gap-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!notice) {
    return (
      <AdminLayout>
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/notice-board">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Notice Board
              </Link>
            </Button>
          </div>
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Notice not found.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/notice-board">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Notice Board
              </Link>
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-4">{notice.header}</CardTitle>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Created: {formatDate(notice.createdAt)}
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      User: {notice.user}
                    </div>
                    {notice.link && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        Has Link
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="text-base leading-relaxed whitespace-pre-wrap">
                  {notice.description}
                </p>
              </div>
              {notice.link && (
                <div className="mt-6 pt-4 border-t">
                  <Button variant="outline" asChild>
                    <a
                      href={notice.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit Link: {notice.link}
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notice Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notice ID</p>
                  <p className="font-mono text-sm">{notice._id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="text-sm">{formatDate(notice.updatedAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created By</p>
                  <Link
                    to={`/users/${notice.user}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {notice.user}
                  </Link>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Version</p>
                  <p className="text-sm">{notice.__v}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Notice Modal */}
        {isEditModalOpen && (
          <EditNoticeModal
            notice={notice}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
