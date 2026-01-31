import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Loader2 } from "lucide-react";
import { useGetSubject } from "@/lib/api/queries/use-get-subject";
import { useGetQuestions } from "@/lib/api/queries/use-get-questions";
import { UpdateSubjectModal } from "@/components/modals/UpdateSubjectModal";
import moment from "moment";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

export default function SubjectDetails() {
  const { id } = useParams<{ id: string }>();
  const [page, setPage] = useState(1);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [refreshSubject, setRefreshSubject] = useState(0);
  
  const { data: subjectData, isLoading: subjectLoading, error: subjectError, refetch: refetchSubject } = useGetSubject(id!);
  const { data: questionsData, isLoading: questionsLoading } = useGetQuestions({
    searchTerm: "",
    page,
    subjectIds: [id!],
  });

  // Refetch subject after update
  if (refreshSubject > 0) {
    refetchSubject();
  }

  if (subjectLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (subjectError || !subjectData?.data) {
    return (
      <AdminLayout>
        <div className="text-center py-8 text-destructive">
          Failed to load subject details. Please try again.
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/subjects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Subjects
            </Link>
          </Button>
        </div>

        {/* Subject Info */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Subject Information</CardTitle>
            </div>
            <Button size="sm" variant="outline" onClick={() => setIsUpdateModalOpen(true)}>
              <Edit className="h-4 w-4 mr-2" /> Edit Subject
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1 space-y-2">
                <h2 className="text-2xl font-bold">{subjectData.data.name}</h2>
                <p className="text-lg text-gray-600">{subjectData.data.name_hi}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                  <span>Created: {moment(subjectData.data.createdAt).format("MMM D, YYYY")}</span>
                  <span>Updated: {moment(subjectData.data.updatedAt).format("MMM D, YYYY")}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Questions for this Subject</CardTitle>
          </CardHeader>
          <CardContent>
            {questionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
              </div>
            ) : !questionsData?.data?.questions?.length ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                No questions found for this subject.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Question</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Serial No</TableHead>
                        <TableHead>Has Image</TableHead>
                        <TableHead>Created At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {questionsData.data.questions.map((question) => (
                        <TableRow key={question._id}>
                          <TableCell className="max-w-[300px] truncate" title={question.text}>
                            <Link
                              to={`/questions/${question._id}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                              title={question.text}
                            >
                              {question.text}
                            </Link>
                          </TableCell>
                          <TableCell>
                            {question.isTwoOptions ? (
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                Multiple Choice
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Single Choice
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {question?.serial_no ? (
                              <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                                {question.serial_no}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {question?.image?.trim() ? (
                              <Badge variant="default" className="bg-green-500">
                                Yes
                              </Badge>
                            ) : (
                              <Badge variant="outline">No</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {moment(question?.createdAt).format("DD MMM YYYY")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {/* Pagination */}
                {questionsData.data.pagination?.totalPages > 1 && (
                  <div className="flex justify-center py-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={e => {
                              e.preventDefault();
                              if (page > 1) setPage(page - 1);
                            }}
                            aria-disabled={page === 1}
                            tabIndex={page === 1 ? -1 : 0}
                          />
                        </PaginationItem>
                        {/* Page numbers with ellipsis */}
                        {(() => {
                          const total = questionsData.data.pagination.totalPages;
                          const siblings = 1;
                          const boundaries = 1;
                          const range = [];
                          let leftSibling = Math.max(page - siblings, boundaries + 1);
                          let rightSibling = Math.min(page + siblings, total - boundaries);
                          let showLeftEllipsis = leftSibling > boundaries + 1;
                          let showRightEllipsis = rightSibling < total - boundaries;

                          for (let i = 1; i <= boundaries; i++) {
                            range.push(i);
                          }
                          if (showLeftEllipsis) {
                            range.push("left-ellipsis");
                          }
                          for (let i = leftSibling; i <= rightSibling; i++) {
                            range.push(i);
                          }
                          if (showRightEllipsis) {
                            range.push("right-ellipsis");
                          }
                          for (let i = total - boundaries + 1; i <= total; i++) {
                            if (i > boundaries && i > rightSibling) {
                              range.push(i);
                            }
                          }
                          return range.map((item, idx) => {
                            if (item === "left-ellipsis" || item === "right-ellipsis") {
                              return (
                                <PaginationItem key={item + idx}>
                                  <PaginationEllipsis />
                                </PaginationItem>
                              );
                            }
                            return (
                              <PaginationItem key={item}>
                                <PaginationLink
                                  href="#"
                                  isActive={item === page}
                                  onClick={e => {
                                    e.preventDefault();
                                    setPage(Number(item));
                                  }}
                                >
                                  {item}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          });
                        })()}
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={e => {
                              e.preventDefault();
                              if (page < questionsData.data.pagination.totalPages) setPage(page + 1);
                            }}
                            aria-disabled={page === questionsData.data.pagination.totalPages}
                            tabIndex={page === questionsData.data.pagination.totalPages ? -1 : 0}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Update Modal */}
        <UpdateSubjectModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          subject={subjectData.data}
          onSuccess={() => setRefreshSubject((c) => c + 1)}
        />
      </div>
    </AdminLayout>
  );
}