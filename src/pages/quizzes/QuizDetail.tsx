import { useParams, Link, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Clock, FileText, Loader2, Eye } from "lucide-react";
import { useGetQuiz } from "@/lib/api/queries/use-get-quiz";
import { useGetQuestionsByIds } from "@/lib/api/queries/use-get-questions-by-ids";
import moment from "moment";
import { useMemo } from "react";
import { MathText } from "@/math/MathText";

export default function QuizDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetQuiz(id);
  const quiz = data?.data;

  const questionIds = useMemo(() => {
    if (!quiz?.questions) return [];
    return quiz.questions.filter((q): q is string => typeof q === "string");
  }, [quiz?.questions]);

  const { data: questionsData } = useGetQuestionsByIds(questionIds);
  const questions = questionsData?.data ?? [];

  const navigate = useNavigate();

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/quizzes");
    }
  };

  const formatDateTime = (dateStr: string | null | undefined, timeStr?: string) => {
    if (!dateStr) return "—";
    const d = moment(dateStr);
    if (timeStr) return d.format("DD MMM YYYY") + " " + timeStr;
    return d.format("DD MMM YYYY");
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={goBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {isLoading && (
          <div className="w-full flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        {error && (
          <div className="w-full flex items-center justify-center py-12">
            <span className="text-destructive text-lg font-medium">Failed to load quiz.</span>
          </div>
        )}
        {!isLoading && !error && quiz && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{quiz.title}</h1>
                {quiz.title_hi && (
                  <p className="text-muted-foreground mt-1 text-lg">{quiz.title_hi}</p>
                )}
                <div className="flex gap-2 mt-2 flex-wrap">
                  {quiz.languageOptions?.map((lang, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {lang}
                    </Badge>
                  ))}
                  {quiz.type && (
                    quiz.type === "mock" ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <FileText className="h-3 w-3 mr-1" />
                        Mock
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        <Clock className="h-3 w-3 mr-1" />
                        Live
                      </Badge>
                    )
                  )}
                  {quiz.testType && (
                    <Badge variant="outline" className="capitalize">
                      {quiz.testType}
                    </Badge>
                  )}
                  {quiz.status && (
                    <Badge variant="secondary" className="capitalize">
                      {quiz.status}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link to={`/quizzes/${quiz._id}/preview`}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Quiz
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to={`/quizzes/${quiz._id}/edit`}>Edit Quiz</Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Quiz Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Description</h3>
                      <p className="text-muted-foreground">{quiz.description || "—"}</p>
                      {quiz.description_hi && (
                        <p className="text-muted-foreground text-sm mt-1">{quiz.description_hi}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium">Duration</h3>
                        <p>{quiz.durationInMinutes != null ? `${quiz.durationInMinutes} min` : "—"}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Total Questions</h3>
                        <p>{quiz.totalQuestions ?? "—"}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Total Marks</h3>
                        <p>{quiz.totalMarks ?? "—"}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Marks per Question</h3>
                        <p>{quiz.marksPerQuestion ?? "—"}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Negative Marks</h3>
                        <p>{quiz.negativeMarks ?? "—"}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Exam ID</h3>
                        <p className="text-xs font-mono truncate">{quiz.exam ?? "—"}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Start</h3>
                        <p className="text-sm">{formatDateTime(quiz.startDate, quiz.startTime)}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">End</h3>
                        <p className="text-sm">{formatDateTime(quiz.endDate, quiz.endTime)}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Created At</h3>
                        <p>{quiz.createdAt ? moment(quiz.createdAt).format("DD MMM YYYY, hh:mm A") : "—"}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Updated At</h3>
                        <p>{quiz.updatedAt ? moment(quiz.updatedAt).format("DD MMM YYYY, hh:mm A") : "—"}</p>
                      </div>
                      {quiz.deletionAt && (
                        <div>
                          <h3 className="text-sm font-medium">Deletion At</h3>
                          <p>{moment(quiz.deletionAt).format("DD MMM YYYY")}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Questions ({questions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {questions.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No questions loaded or quiz has no questions.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead style={{ minWidth: 220 }}>Question</TableHead>
                        <TableHead style={{ minWidth: 180 }}>Options</TableHead>
                        <TableHead>Correct</TableHead>
                        <TableHead>Multi</TableHead>
                        <TableHead>Serial No</TableHead>
                        <TableHead>Image</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {questions.map((q: any) => (
                        <TableRow key={q._id}>
                          <TableCell>
                            <div className="whitespace-pre-line break-words">
                              <MathText text={q.text} inline />
                              {q.text_hi && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  <MathText text={q.text_hi} inline />
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {q.options?.map((opt: string, i: number) => (
                                <div key={i} className="text-sm">
                                  <span className="font-semibold mr-1">{String.fromCharCode(65 + i)}.</span>
                                  <MathText text={opt} inline />
                                </div>
                              ))}
                              {q.options_hi?.length > 0 && (
                                <div className="flex flex-col gap-1 mt-1">
                                  {q.options_hi.map((opt: string, i: number) => (
                                    <div key={i} className="text-xs text-muted-foreground">
                                      <span className="font-semibold mr-1">{String.fromCharCode(65 + i)}.</span>
                                      <MathText text={opt} inline />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {q.correctAnswers?.length > 0 ? (
                              <ul className="pl-0">
                                {q.correctAnswers.map((ans: string, i: number) => (
                                  <li key={i}>
                                    <MathText text={ans} inline />
                                    {q.correctAnswers_hi?.[i] && (
                                      <span className="text-muted-foreground">
                                        {" "}(<MathText text={q.correctAnswers_hi[i]} inline />)
                                      </span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>{q.isTwoOptions ? "Yes" : "No"}</TableCell>
                          <TableCell className="text-center">
                            {q?.serial_no ? (
                              <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                                {q.serial_no}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {q.image ? (
                              <a href={q.image} target="_blank" rel="noopener noreferrer">
                                <img src={q.image} alt="Question" className="h-10 w-10 object-contain border rounded" />
                              </a>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
