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
import { ArrowLeft, Clock, FileText, Loader2, FileDown, Eye } from "lucide-react";
import { useGetTest } from "@/lib/api/queries/use-get-test";
import { useGetQuestionsByIds } from "@/lib/api/queries/use-get-questions-by-ids";
import moment from "moment";
import { useMemo } from "react";
import { MathText } from "@/math/MathText";

export default function TestDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetTest(id!);
  const test = data?.data;
  
  // Get all question IDs from all sections - memoize to prevent re-renders
  const allQuestionIds = useMemo(() => {
    return test?.sections?.flatMap(section => section.questions || []) || [];
  }, [test?.sections]); // Only depend on sections array reference

  const { data: questionsData } = useGetQuestionsByIds(allQuestionIds);

  // Memoize sections with questions to prevent unnecessary re-renders
  const sectionsWithQuestions = useMemo(() => {
    if (!test?.sections || !questionsData?.data) return [];

    const questionsMap = new Map(
      questionsData.data.map((q: any) => [q._id, q])
    );

    return test.sections.map((section: any) => ({
      ...section,
      questions: section.questions.map((id: string) => questionsMap.get(id)).filter(Boolean)
    }));
  }, [test?.sections, questionsData?.data]);

  const navigate = useNavigate();

  const goback = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/tests");
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={goback}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {isLoading && (
          <div className="w-full flex items-center justify-center py-12">
            <Loader2 className="transition-all duration-300 animate-spin text-blue-400" />
          </div>
        )}
        {error && (
          <div className="w-full flex items-center justify-center py-12">
            <span className="text-red-500 text-lg font-medium">Failed to load test.</span>
          </div>
        )}
        {!isLoading && !error && test && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{test.title}</h1>
                <p className="text-muted-foreground mt-1 text-lg">{test.title_hi}</p>
                <div className="flex gap-2 mt-2">
                  {test.languageOptions.map((lang, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" asChild>
                  <Link to={`/tests/${test._id}/preview`}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Test
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to={`/tests/${test._id}/edit`}>
                    Edit Test
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Test Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Description</h3>
                      <p className="text-muted-foreground">{test.description}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium">Type</h3>
                        {test.type === "mock" ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <FileText className="h-3 w-3 mr-1" />
                            Mock
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            <Clock className="h-3 w-3 mr-1" />
                            Live
                          </Badge>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Duration</h3>
                        <p>{Math.floor(test.durationInMinutes / 60)} minutes</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Total Questions</h3>
                        <p>{test.totalQuestions}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Total Sections</h3>
                        <p>{test.totalSections}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Total Marks</h3>
                        <p>{test.totalMarks}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Marks per Question</h3>
                        <p>{test.marksPerQuestion}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Negative Marks</h3>
                        <p>{test.negativeMarks}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Exam</h3>
                        <p>{test?.exam?.name ? test?.exam?.name : "Not assigned"}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Created At</h3>
                        <p>{moment(test.createdAt).format('DD MMM YYYY, hh:mm A')}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Updated At</h3>
                        <p>{moment(test.updatedAt).format('DD MMM YYYY, hh:mm A')}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6 mt-8">
              {sectionsWithQuestions.map((section) => (
                <Card key={section._id}>
                  <CardHeader>
                    <CardTitle>
                      {section.name} <span className="text-muted-foreground ml-2">({section.name_hi})</span>
                    </CardTitle>
                    <div className="text-sm text-muted-foreground mt-1">
                      Section Order: {section.order} | Time Limit: {section.timeLimit} min
                    </div>
                  </CardHeader>
                  <CardContent>
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
                        {section.questions.map((q: any) => (
                          <TableRow key={q._id}>
                            <TableCell>
                              <div className="whitespace-pre-line break-words">
                                <MathText text={q.text} inline />
                                <div className="text-xs text-muted-foreground mt-1">
                                  <MathText text={q.text_hi} inline />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {/* English Options */}
                              <div className="flex flex-col gap-1">
                                {q.options.map((opt: string, i: number) => (
                                  <div key={i} className="text-sm" style={{ fontSize: '13px' }}>
                                    <span className="font-semibold mr-1">{String.fromCharCode(65 + i)}.</span>
                                    <MathText text={opt} inline />
                                  </div>
                                ))}
                              </div>
                              {/* Hindi Options */}
                              <div className="flex flex-col gap-1 mt-1">
                                {q.options_hi.map((opt: string, i: number) => (
                                  <div key={i} className="text-xs text-muted-foreground" style={{ fontSize: '12px' }}>
                                    <span className="font-semibold mr-1">{String.fromCharCode(65 + i)}.</span>
                                    <MathText text={opt} inline />
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <ul className="pl-0">
                                {q.correctAnswers.map((ans: string, i: number) => (
                                  <li key={i}>
                                    <MathText text={ans} inline />
                                    {" "}
                                    <span className="text-muted-foreground">
                                      (<MathText text={q.correctAnswers_hi[i]} inline />)
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </TableCell>
                            <TableCell>{q.isTwoOptions ? "Yes" : "No"}</TableCell>
                            <TableCell className="text-center">
                              {q?.serial_no ? (
                                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                                  {q.serial_no}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {q.image ? (
                                <a href={q.image} target="_blank" rel="noopener noreferrer">
                                  <img src={q.image} alt="Question" className="h-10 w-10 object-contain border rounded" />
                                </a>
                              ) : (
                                <span className="text-xs text-gray-400">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
