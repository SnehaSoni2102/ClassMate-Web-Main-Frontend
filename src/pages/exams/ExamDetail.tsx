import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Loader2 } from "lucide-react";
import { useGetExam } from "@/lib/api/queries/use-get-exam";
import { useGetQuestions } from "@/lib/api/queries/use-get-questions";
import { UpdateExamModal } from "@/components/modals/UpdateExamModal";
import { Link } from "react-router-dom";
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
import { MathText } from "@/math/MathText";

export default function ExamDetail() {
  const { id } = useParams<{ id: string }>();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [refreshExam, setRefreshExam] = useState(0);

  const { data: examData, isLoading: examLoading, error: examError, refetch: refetchExam } = useGetExam(id!);
  const { data: questionsData, isLoading: questionsLoading } = useGetQuestions({
    searchTerm: "",
    page,
    examIds: [id],
  });

  // Refetch exam after update
  useEffect(() => {
    if (refreshExam > 0) refetchExam();
    // eslint-disable-next-line
  }, [refreshExam]);

  const exam = examData?.data;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/exams">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Exams
            </Link>
          </Button>
        </div>

        {/* Exam Info */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Exam Information</CardTitle>
            </div>
            {exam && (
              <Button size="sm" variant="outline" onClick={() => setIsUpdateModalOpen(true)}>
                <Edit className="h-4 w-4 mr-2" /> Edit Exam
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {examLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
              </div>
            ) : examError || !exam ? (
              <div className="text-center py-8 text-destructive">
                Failed to load exam. Please try again.
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="h-24 w-24 rounded-lg border bg-white p-2 flex-shrink-0">
                  <img
                    src={exam.logo}
                    alt={exam.name}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <h2 className="text-2xl font-bold">{exam.name}</h2>
                  <p className="text-lg text-gray-600">{exam.name_hi}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                    <span>Created: {moment(exam.createdAt).format("MMM D, YYYY")}</span>
                    <span>Updated: {moment(exam.updatedAt).format("MMM D, YYYY")}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Questions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Questions for this Exam</CardTitle>
          </CardHeader>
          <CardContent>
            {questionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
              </div>
            ) : !questionsData?.data?.questions?.length ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                No questions found for this exam.
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
                              <MathText text={question.text} inline />
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
        {exam && (
          <UpdateExamModal
            isOpen={isUpdateModalOpen}
            onClose={() => setIsUpdateModalOpen(false)}
            exam={exam}
            onSuccess={() => setRefreshExam((c) => c + 1)}
          />
        )}
      </div>
    </AdminLayout>
  );
}
