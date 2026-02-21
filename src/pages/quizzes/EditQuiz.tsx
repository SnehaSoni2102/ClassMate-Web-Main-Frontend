import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useGetQuiz } from "@/lib/api/queries/use-get-quiz";
import { useGetQuestionsByIds } from "@/lib/api/queries/use-get-questions-by-ids";
import { useGetExam } from "@/lib/api/queries/use-get-exam";
import { useUpdateQuiz } from "@/lib/api/mutations/update-quiz-mutation";
import { useQueryClient } from "@tanstack/react-query";
import ExamSelector from "@/components/selectors/ExamSelector";
import { Option } from "@/components/ui/multiple-selector";
import SectionQuestionsDialog from "@/pages/tests/SectionQuestionsDialog";
import moment from "moment";

const LANGUAGE_OPTIONS = ["English", "Hindi"];

export default function EditQuiz() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useGetQuiz(id);
  const quiz = data?.data;

  const questionIds = useMemo(() => {
    if (!quiz?.questions) return [];
    return quiz.questions.filter((q): q is string => typeof q === "string");
  }, [quiz?.questions]);

  const { data: questionsData } = useGetQuestionsByIds(questionIds);
  const { data: examData } = useGetExam(quiz?.exam || "");

  const updateQuizMutation = useUpdateQuiz();
  const [exams, setExams] = useState<Option[]>([]);
  const [form, setForm] = useState({
    title: "",
    title_hi: "",
    description: "",
    description_hi: "",
    totalQuestions: 0,
    durationInMinutes: 30,
    exam: "",
    languageOptions: LANGUAGE_OPTIONS as string[],
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  });
  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([]);
  const [questionsDialogOpen, setQuestionsDialogOpen] = useState(false);
  const [formReady, setFormReady] = useState(false);
  const hasInitializedQuestions = useRef(false);

  useEffect(() => {
    if (!quiz) return;
    hasInitializedQuestions.current = false;
    setForm({
      title: quiz.title || "",
      title_hi: quiz.title_hi || "",
      description: quiz.description || "",
      description_hi: quiz.description_hi || "",
      totalQuestions: quiz.totalQuestions || 0,
      durationInMinutes: quiz.durationInMinutes ?? 30,
      exam: typeof quiz.exam === "string" ? quiz.exam : (quiz.exam as any)?._id || "",
      languageOptions: quiz.languageOptions || LANGUAGE_OPTIONS,
      startDate: quiz.startDate ? moment(quiz.startDate).format("YYYY-MM-DD") : "",
      startTime: quiz.startTime || "",
      endDate: quiz.endDate ? moment(quiz.endDate).format("YYYY-MM-DD") : "",
      endTime: quiz.endTime || "",
    });
    setFormReady(true);
  }, [quiz]);

  useEffect(() => {
    if (examData?.data) {
      setExams([{ value: examData.data._id, label: examData.data.name }]);
    }
  }, [examData]);

  useEffect(() => {
    if (questionsData?.data && questionIds.length > 0 && !hasInitializedQuestions.current) {
      hasInitializedQuestions.current = true;
      setSelectedQuestions(questionsData.data);
      setForm((f) => ({ ...f, totalQuestions: questionsData.data.length }));
    }
  }, [questionsData?.data, questionIds.length]);

  const handleChange = (field: string, value: string | number | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveQuestions = (selected: any[]) => {
    setSelectedQuestions(selected);
    handleChange("totalQuestions", selected.length);
    setQuestionsDialogOpen(false);
  };

  const handleAddCreatedQuestion = (q: any) => {
    setSelectedQuestions((prev) => {
      const next = [...prev, q];
      setForm((f) => ({ ...f, totalQuestions: next.length }));
      return next;
    });
  };

  const handleRemoveQuestion = (questionId: string) => {
    setSelectedQuestions((prev) => {
      const next = prev.filter((q) => q._id !== questionId);
      setForm((f) => ({ ...f, totalQuestions: next.length }));
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!form.exam) {
      toast({
        title: "Exam required",
        description: "Please select an exam for this quiz.",
        variant: "destructive",
      });
      return;
    }

    if (selectedQuestions.length === 0) {
      toast({
        title: "Questions required",
        description: "Please add at least one question to the quiz.",
        variant: "destructive",
      });
      return;
    }

    if (!form.startDate || !form.startTime || !form.endDate || !form.endTime) {
      toast({
        title: "Dates and times required",
        description: "Please set start and end date/time.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      title_hi: form.title_hi,
      description_hi: form.description_hi,
      totalQuestions: selectedQuestions.length,
      durationInMinutes: form.durationInMinutes,
      exam: form.exam,
      languageOptions: form.languageOptions,
      startDate: form.startDate,
      startTime: form.startTime,
      endDate: form.endDate,
      endTime: form.endTime,
      questions: selectedQuestions.map((q) => q._id),
    };

    try {
      await updateQuizMutation.mutateAsync({ id, payload });
      await queryClient.invalidateQueries({ queryKey: ["get-quiz", id] });
      navigate(`/quizzes/${id}`);
    } catch (err: unknown) {
      // Error toast is handled in the mutation
    }
  };

  if (isLoading || !formReady) {
    return (
      <AdminLayout>
        <div className="w-full flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !quiz) {
    return (
      <AdminLayout>
        <div className="w-full flex items-center justify-center py-12">
          <span className="text-destructive text-lg font-medium">Failed to load quiz.</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/quizzes/${id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quiz
            </Link>
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Quiz</h1>
          <p className="text-muted-foreground mt-1">
            Update quiz details and questions.
          </p>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Quiz Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title (English) *</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title_hi">Title (Hindi)</Label>
                  <Input
                    id="title_hi"
                    value={form.title_hi}
                    onChange={(e) => handleChange("title_hi", e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description (English) *</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description_hi">Description (Hindi)</Label>
                  <Textarea
                    id="description_hi"
                    value={form.description_hi}
                    onChange={(e) => handleChange("description_hi", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Exam *</Label>
                  <ExamSelector
                    multiple={false}
                    value={exams}
                    onChange={(val) => {
                      setExams(val ?? []);
                      handleChange("exam", val?.[0]?.value ?? "");
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="durationInMinutes">Duration (minutes) *</Label>
                  <Input
                    id="durationInMinutes"
                    type="number"
                    min={1}
                    value={form.durationInMinutes}
                    onChange={(e) =>
                      handleChange("durationInMinutes", Number(e.target.value) || 0)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={form.startTime}
                    onChange={(e) => handleChange("startTime", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={form.endTime}
                    onChange={(e) => handleChange("endTime", e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Questions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Select questions from the question bank. Total: {selectedQuestions.length}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setQuestionsDialogOpen(true)}
              >
                Select Questions
              </Button>
              {selectedQuestions.length > 0 && (
                <div className="border rounded-md divide-y max-h-64 overflow-y-auto">
                  {selectedQuestions.map((q) => (
                    <div
                      key={q._id}
                      className="flex items-center justify-between gap-2 px-4 py-2"
                    >
                      <span className="text-sm truncate flex-1">
                        {q.text?.slice(0, 80) ?? q._id}
                        {(q.text?.length ?? 0) > 80 ? "…" : ""}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:bg-red-50 shrink-0"
                        onClick={() => handleRemoveQuestion(q._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button type="submit" disabled={updateQuizMutation.isPending}>
              {updateQuizMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link to={`/quizzes/${id}`}>Cancel</Link>
            </Button>
          </div>
        </form>
      </div>

      <SectionQuestionsDialog
        open={questionsDialogOpen}
        onOpenChange={setQuestionsDialogOpen}
        initialSelected={selectedQuestions}
        onSave={handleSaveQuestions}
        onCreateQuestion={handleAddCreatedQuestion}
      />
    </AdminLayout>
  );
}
