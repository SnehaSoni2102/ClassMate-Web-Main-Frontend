import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import SectionQuestionsDialog from "./SectionQuestionsDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetTest } from "@/lib/api/queries/use-get-test";
import { useGetQuestionsByIds } from "@/lib/api/queries/use-get-questions-by-ids";
import { useUpdateTest } from "@/lib/api/mutations/update-test-mutation";
import { useQueryClient } from "@tanstack/react-query";
import ExamSelector from "@/components/selectors/ExamSelector";
import { Option } from "@/components/ui/multiple-selector";
import { useGetExam } from "@/lib/api/queries/use-get-exam";
import { MathText } from "@/math/MathText";

const LANGUAGE_OPTIONS = ["English", "Hindi"];

interface Question {
  _id: string;
  text?: string;
  text_hi?: string;
  question?: string;
  question_hi?: string;
  options?: string[];
  options_hi?: string[];
  correctAnswers?: string[];
  correctAnswers_hi?: string[];
  [key: string]: any;
}

interface Section {
  _id?: string;
  name: string;
  name_hi: string;
  order: number;
  timeLimit: number;
  questionIds: string[];
  questionObjs: Question[];
}

export default function EditTest() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data, isLoading, error } = useGetTest(id!);
  const updateTestMutation = useUpdateTest();
  const queryClient = useQueryClient();

  // State for test info
  const [test, setTest] = useState<any | null>(null);
  // State for sections
  const [sections, setSections] = useState<Section[]>([]);
  // State for exam selection
  const [exams, setExams] = useState<Option[]>([]);
  // Dialog state
  const [activeSectionIdx, setActiveSectionIdx] = useState<number | null>(null);
  // Section language display state
  const [sectionLangs, setSectionLangs] = useState<{
    [idx: number]: "en" | "hi";
  }>({});

  // Get all question IDs from all sections
  const allQuestionIds = sections.flatMap(section => section.questionIds || []);
  const { data: questionsData } = useGetQuestionsByIds(allQuestionIds);

  // Initialize state from API
  useEffect(() => {
    if (data?.data) {
      const t = data.data;
      setTest({
        title: t.title,
        title_hi: t.title_hi,
        startDate: t.startDate || "",
        startTime: t.startTime || "",
        endDate: t.endDate || "",
        endTime: t.endTime || "",
        // durationInMinutes is stored in minutes on the server — don't divide by 60
        durationInMinutes: t.durationInMinutes,
        totalMarks: t.totalMarks,
        marksPerQuestion: t.marksPerQuestion,
        negativeMarks: t.negativeMarks,
        description: t.description,
        description_hi: t.description_hi,
        languageOptions: t.languageOptions || LANGUAGE_OPTIONS,
        type: t.type,
        testType: t.testType || "free",
        // If API returns an exam object, store its id string instead
        exam: typeof t.exam === "object" ? t.exam._id || "" : t.exam || "",
      });

      setSections(
        (t.sections || []).map((s: any) => ({
          _id: s._id,
          name: s.name,
          name_hi: s.name_hi,
          order: s.order,
          timeLimit: s.timeLimit,
          questionIds: s.questions || [], // These are question IDs
          questionObjs: [] as Question[], // Will be populated when questions are fetched
        }))
      );
    }
  }, [data]);

  // Fetch and populate selected exam label from ID
  const examId = data?.data?.exam?._id || "";
  const { data: examData } = useGetExam(examId);
  useEffect(() => {
    if (examData?.data) {
      setExams([{ value: examData.data._id, label: examData.data.name }]);
    }
  }, [examData]);

  // Populate question objects when questions data is available
  useEffect(() => {
    if (questionsData?.data && sections.length > 0) {
      const questionsMap = new Map(
        questionsData.data.map((q: any) => [q._id, q])
      );
      
      setSections(prev => prev.map(section => ({
        ...section,
        questionObjs: section.questionIds.map((id: string) => questionsMap.get(id)).filter(Boolean)
      })));
    }
  }, [questionsData, sections.length]);

  // Handlers for test info
  const handleTestChange = (field: string, value: any) => {
    setTest((prev: any) => ({ ...prev, [field]: value }));
  };

  // Section management
  const addSection = () => {
    setSections((prev) => [
      ...prev,
      {
        name: "",
        name_hi: "",
        order: prev.length + 1,
        timeLimit: 0,
        questionIds: [],
        questionObjs: [],
      },
    ]);
  };

  const removeSection = (idx: number) => {
    setSections((prev) =>
      prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, order: i + 1 }))
    );
  };

  const handleSectionChange = (idx: number, field: string, value: any) => {
    setSections((prev) =>
      prev.map((section, i) =>
        i === idx ? { ...section, [field]: value } : section
      )
    );
  };

  // Save questions for a section
  const handleSaveSectionQuestions = (idx: number, selected: any[]) => {
    setSections((prev) =>
      prev.map((section, i) =>
        i === idx
          ? {
              ...section,
              questionIds: selected.map((q) => q._id),
              questionObjs: selected,
            }
          : section
      )
    );
    setActiveSectionIdx(null);
  };

  // Add new question to section after dialog success
  const handleAddCreatedQuestion = (idx: number, question: any) => {
    setSections((prev) =>
      prev.map((section, i) =>
        i === idx
          ? {
              ...section,
              questionIds: [...section.questionIds, question._id],
              questionObjs: [...section.questionObjs, question],
            }
          : section
      )
    );
  };

  // Remove question from section
  const handleRemoveQuestionFromSection = (
    sectionIdx: number,
    questionId: string
  ) => {
    setSections((prev) =>
      prev.map((section, i) =>
        i === sectionIdx
          ? {
              ...section,
              questionIds: section.questionIds.filter(
                (id: string) => id !== questionId
              ),
              questionObjs: section.questionObjs.filter(
                (q: any) => q._id !== questionId
              ),
            }
          : section
      )
    );
  };

  // Calculate totalQuestions and totalMarks dynamically
  const totalQuestions = sections.reduce(
    (sum, s) => sum + s.questionIds.length,
    0
  );
  const totalMarks = test ? test.marksPerQuestion * totalQuestions : 0;

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!test) return;
    
    // Validation: exam selection
    if (!test.exam) {
      toast({
        title: "Exam required",
        description: "Please select an exam for this test.",
        variant: "destructive",
      });
      return;
    }
    
    // Validation: section time limits
    const sumSectionTimes = sections.reduce(
      (sum, s) => sum + Number(s.timeLimit || 0),
      0
    );
    if (sections.some((s) => !s.timeLimit || Number(s.timeLimit) <= 0)) {
      toast({
        title: "Section time required",
        description: "Each section must have a time limit greater than 0.",
        variant: "destructive",
      });
      return;
    }
    if (sumSectionTimes > test.durationInMinutes) {
      toast({
        title: "Section time exceeds test duration",
        description: `Sum of all section time limits (${sumSectionTimes} min) cannot exceed total test duration (${test.durationInMinutes} min).`,
        variant: "destructive",
      });
      return;
    }
    // Prepare API body
    const testBody: any = {
      ...test,
      totalQuestions,
      totalSections: sections.length,
      totalMarks,
      // Ensure exam is sent as an id string (not an object)
      exam:
        typeof test.exam === "object"
          ? test.exam._id || test.exam.value || ""
          : test.exam,
      durationInMinutes: test.durationInMinutes,
      ...(test.type === "live"
        ? { endDate: test.endDate, endTime: test.endTime }
        : {}),
    };
    delete testBody._id;
    if (test.type === "mock") {
      // Remove any live-specific date/time fields for mock tests
      delete testBody.endDate;
      delete testBody.endTime;
      // Also remove startDate/startTime if empty or not applicable
      if (!testBody.startDate) delete testBody.startDate;
      if (!testBody.startTime) delete testBody.startTime;
    } else {
      // For live tests, if startDate/startTime are empty strings, remove them
      if (!testBody.startDate) delete testBody.startDate;
      if (!testBody.startTime) delete testBody.startTime;
    }
    const apiBody = {
      ...testBody,
      sections: sections.map((s) => {
        const sectionObj: any = {
          name: s.name,
          name_hi: s.name_hi,
          order: s.order,
          timeLimit: s.timeLimit,
          questionIds: s.questionIds,
        };
        if (s._id) sectionObj._id = s._id;
        return sectionObj;
      }),
    };
    try {
      const res = await updateTestMutation.mutateAsync({ id, body: apiBody });
      toast({
        title: "Test updated successfully!",
        description: res?.message || "Test has been updated.",
      });
      await queryClient.invalidateQueries({ queryKey: ["get-test"] });
      navigate(`/tests/${id}`);
    } catch (err: any) {
      toast({
        title: "Failed to update test",
        description:
          err?.response?.data?.message || err?.message || "Unknown error",
        variant: "destructive",
      });
    }
  };

  // UI
  if (isLoading || !test) {
    return (
      <AdminLayout>
        <div className="w-full flex items-center justify-center py-12">
          <Loader2 className="transition-all duration-300 animate-spin text-blue-400" />
        </div>
      </AdminLayout>
    );
  }
  if (error) {
    return (
      <AdminLayout>
        <div className="w-full flex items-center justify-center py-12">
          <span className="text-red-500 text-lg font-medium">
            Failed to load test.
          </span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/tests">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tests
            </Link>
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Test</h1>
          <p className="text-muted-foreground mt-1">Test ID: {id}</p>
        </div>
        <form className="space-y-8" onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Test Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Test Title (English)</Label>
                  <Input
                    id="title"
                    value={test.title}
                    onChange={(e) => handleTestChange("title", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title_hi">Test Title (Hindi)</Label>
                  <Input
                    id="title_hi"
                    value={test.title_hi}
                    onChange={(e) =>
                      handleTestChange("title_hi", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (English)</Label>
                  <Textarea
                    id="description"
                    value={test.description}
                    onChange={(e) =>
                      handleTestChange("description", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description_hi">Description (Hindi)</Label>
                  <Textarea
                    id="description_hi"
                    value={test.description_hi}
                    onChange={(e) =>
                      handleTestChange("description_hi", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Test Type</Label>
                  <RadioGroup
                    value={test.type}
                    onValueChange={(val) =>
                      handleTestChange("type", val as "mock" | "live")
                    }
                    className="flex flex-row gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mock" id="mock" />
                      <Label htmlFor="mock">Mock</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="live" id="live" />
                      <Label htmlFor="live">Live</Label>
                    </div>
                  </RadioGroup>
                </div>
                {test.type === "live" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={test.startDate}
                        onChange={(e) =>
                          handleTestChange("startDate", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={test.startTime}
                        onChange={(e) =>
                          handleTestChange("startTime", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={test.endDate}
                        onChange={(e) =>
                          handleTestChange("endDate", e.target.value)
                        }
                        required={test.type === "live"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={test.endTime}
                        onChange={(e) =>
                          handleTestChange("endTime", e.target.value)
                        }
                        required={test.type === "live"}
                      />
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <Label htmlFor="durationInMinutes">Duration (minutes)</Label>
                  <Input
                    id="durationInMinutes"
                    type="number"
                    min={1}
                    value={test.durationInMinutes}
                    onChange={(e) =>
                      handleTestChange(
                        "durationInMinutes",
                        Number(e.target.value)
                      )
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalMarks">Total Marks</Label>
                  <Input
                    id="totalMarks"
                    type="number"
                    min={1}
                    value={totalMarks}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed"
                    tabIndex={-1}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marksPerQuestion">Marks per Question</Label>
                  <Input
                    id="marksPerQuestion"
                    type="number"
                    min={0}
                    value={test.marksPerQuestion}
                    onChange={(e) =>
                      handleTestChange(
                        "marksPerQuestion",
                        Number(e.target.value)
                      )
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="negativeMarks">Negative Marks</Label>
                  <Input
                    id="negativeMarks"
                    type="number"
                    min={0}
                    step={0.01}
                    value={test.negativeMarks}
                    onChange={(e) =>
                      handleTestChange("negativeMarks", Number(e.target.value))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Exam</Label>
                  <ExamSelector
                    multiple={false}
                    value={exams}
                    onChange={(val) => {
                      setExams(val);
                      handleTestChange("exam", val?.[0]?.value || "");
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Sections</CardTitle>
              <Button
                type="button"
                onClick={addSection}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Section
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {sections.map((section, idx) => {
                const lang = sectionLangs[idx] || "en";
                return (
                  <div
                    key={section._id || idx}
                    className="border rounded-md p-4 space-y-4 relative"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">Section {idx + 1}</div>
                      {sections.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSection(idx)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Name (English)</Label>
                        <Input
                          value={section.name}
                          onChange={(e) =>
                            handleSectionChange(idx, "name", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Name (Hindi)</Label>
                        <Input
                          value={section.name_hi}
                          onChange={(e) =>
                            handleSectionChange(idx, "name_hi", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Order</Label>
                        <Input
                          type="number"
                          min={1}
                          value={section.order}
                          onChange={(e) =>
                            handleSectionChange(
                              idx,
                              "order",
                              Number(e.target.value)
                            )
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Time Limit (minutes)</Label>
                        <Input
                          type="number"
                          min={1}
                          value={section.timeLimit}
                          onChange={(e) =>
                            handleSectionChange(
                              idx,
                              "timeLimit",
                              Number(e.target.value)
                            )
                          }
                          required
                        />
                      </div>
                    </div>
                    {/* Question selection UI */}
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Label>Questions</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveSectionIdx(idx)}
                        >
                          Manage Questions ({section.questionIds.length})
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={lang === "en" ? "default" : "outline"}
                          onClick={() =>
                            setSectionLangs((prev) => ({
                              ...prev,
                              [idx]: "en",
                            }))
                          }
                        >
                          EN
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={lang === "hi" ? "default" : "outline"}
                          onClick={() =>
                            setSectionLangs((prev) => ({
                              ...prev,
                              [idx]: "hi",
                            }))
                          }
                        >
                          HI
                        </Button>
                      </div>
                      {/* Table of selected questions */}
                      {section.questionObjs.length > 0 && (
                        <div className="overflow-x-auto">
                          <Table className="text-xs">
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-1/2">
                                  Question
                                </TableHead>
                                <TableHead>Options</TableHead>
                                <TableHead>Correct</TableHead>
                                <TableHead>Serial No</TableHead>
                                <TableHead>Remove</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {section.questionObjs.map((q: any) => (
                                <TableRow key={q._id}>
                                  <TableCell className="whitespace-pre-line max-w-xs">
                                    <MathText
                                      text={
                                        lang === "hi" &&
                                        (q.text_hi || q.question_hi)
                                          ? q.text_hi || q.question_hi
                                          : q.text || q.question
                                      }
                                    />
                                  </TableCell>
                                  <TableCell>
                                    {/* Render options as A, B, C, D... */}
                                    {(lang === "hi" ? q.options_hi : q.options)
                                      ?.length > 0 ? (
                                      <div className="flex flex-col gap-1">
                                        {(lang === "hi"
                                          ? q.options_hi
                                          : q.options
                                        ).map((opt: string, i: number) => (
                                          <div key={i} className="text-xs">
                                            <span className="font-bold">
                                              {String.fromCharCode(65 + i)}.
                                            </span>{" "}
                                            <MathText text={opt} inline />
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground">
                                        -
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {/* Render correct answers */}
                                    {(lang === "hi"
                                      ? q.correctAnswers_hi
                                      : q.correctAnswers
                                    )?.length > 0 ? (
                                      <div className="flex flex-col gap-1">
                                        {(lang === "hi"
                                          ? q.correctAnswers_hi
                                          : q.correctAnswers
                                        ).map((ans: string, i: number) => (
                                          <div key={i} className="text-xs">
                                            <MathText text={ans} inline />
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground">
                                        -
                                      </span>
                                    )}
                                  </TableCell>
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
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="ghost"
                                      className="p-0 h-6 w-6"
                                      onClick={() =>
                                        handleRemoveQuestionFromSection(
                                          idx,
                                          q._id
                                        )
                                      }
                                    >
                                      ×
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
          <div className="flex items-center justify-end space-x-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                navigate("/tests");
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateTestMutation.isPending}>
              Save Changes
            </Button>
          </div>
        </form>
        {/* Section Questions Dialog */}
        {activeSectionIdx !== null && (
          <SectionQuestionsDialog
            open={activeSectionIdx !== null}
            onOpenChange={(open) =>
              setActiveSectionIdx(open ? activeSectionIdx : null)
            }
            initialSelected={sections[activeSectionIdx].questionObjs}
            onSave={(selected) =>
              handleSaveSectionQuestions(activeSectionIdx, selected)
            }
            onCreateQuestion={(q) =>
              handleAddCreatedQuestion(activeSectionIdx, q)
            }
          />
        )}
      </div>
    </AdminLayout>
  );
}
