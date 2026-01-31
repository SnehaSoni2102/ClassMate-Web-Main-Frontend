import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetQuestion } from "@/lib/api/queries/use-get-question";
import SubjectSelector from "@/components/selectors/SubjectSelector";
import TopicSelector from "@/components/selectors/TopicSelector";
import ClassSelector from "@/components/selectors/ClassSelector";
import ExamSelector from "@/components/selectors/ExamSelector";
import { Option } from "@/components/ui/multiple-selector";
import { api } from "@/lib/api/api-interceptor";
import { useUpdateQuestion } from "@/lib/api/mutations/edit-question-mutation";
import { useQueryClient } from "@tanstack/react-query";
import { getUploadUrl } from "@/lib/api/queries/get-upload-url";
import { uploadImageToS3 } from "@/lib/utils/upload";
import { MathText } from "@/math/MathText";
import { Badge } from "@/components/ui/badge";

export default function EditQuestion() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: questionData, isLoading, error } = useGetQuestion(id!);

  const [questionType, setQuestionType] = useState<
    "single_choice" | "multiple_choice"
  >("single_choice");
  const [correctOptionsEN, setCorrectOptionsEN] = useState<number[]>([]);
  const [correctOptionsHI, setCorrectOptionsHI] = useState<number[]>([]);
  const [questionTextEN, setQuestionTextEN] = useState("");
  const [questionTextHI, setQuestionTextHI] = useState("");
  const [explanationEN, setExplanationEN] = useState("");
  const [explanationHI, setExplanationHI] = useState("");
  const [optionsEN, setOptionsEN] = useState<string[]>(["", "", "", ""]);
  const [optionsHI, setOptionsHI] = useState<string[]>(["", "", "", ""]);
  const [selectedSubjects, setSelectedSubjects] = useState<Option[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<Option[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<Option[]>([]);
  const [selectedExams, setSelectedExams] = useState<Option[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Load question data when available
  useEffect(() => {
    if (questionData?.data) {
      const question = questionData.data;
      setQuestionType(
        question.isTwoOptions ? "multiple_choice" : "single_choice"
      );
      setQuestionTextEN(question.text || "");
      setQuestionTextHI(question.text_hi || "");
      setExplanationEN(question.solution || "");

      // Set options (ensure exactly 4 options)
      const enOptions = [...question.options];
      while (enOptions.length < 4) enOptions.push("");
      setOptionsEN(enOptions.slice(0, 4));

      const hiOptions = [...(question.options_hi || [])];
      while (hiOptions.length < 4) hiOptions.push("");
      setOptionsHI(hiOptions.slice(0, 4));

      const correctIndicesEN = question.correctAnswers
        .map((answer) => question.options.indexOf(answer))
        .filter((index) => index !== -1);
      setCorrectOptionsEN(correctIndicesEN);

      const correctIndicesHI = (question.correctAnswers_hi || [])
        .map((answer) => (question.options_hi || []).indexOf(answer))
        .filter((index) => index !== -1);
      setCorrectOptionsHI(correctIndicesHI);

      setSelectedSubjects(
        question.subject.map((obj) => ({
          label: obj?.name,
          value: obj?._id,
        })) || []
      );
      setSelectedTopics(
        question.topics.map((obj) => ({ label: obj?.name, value: obj?._id })) ||
          []
      );
      setSelectedClasses(
        question.class.map((obj) => ({ label: obj?.name, value: obj?._id })) ||
          []
      );
      setSelectedExams(
        question.Exams.map((obj) => ({ label: obj?.name, value: obj?._id })) ||
          []
      );
    }
  }, [questionData]);

  const handleOptionChange = (
    index: number,
    value: string,
    language: "en" | "hi"
  ) => {
    if (language === "en") {
      const newOptions = [...optionsEN];
      newOptions[index] = value;
      setOptionsEN(newOptions);
    } else {
      const newOptions = [...optionsHI];
      newOptions[index] = value;
      setOptionsHI(newOptions);
    }
  };

  const handleCorrectOptionChange = (
    index: number,
    isChecked: boolean,
    language: "en" | "hi"
  ) => {
    if (language === "en") {
      if (questionType === "single_choice") {
        setCorrectOptionsEN(isChecked ? [index] : []);
      } else {
        setCorrectOptionsEN((prev) =>
          isChecked
            ? [...prev, index]
            : prev.filter((optIndex) => optIndex !== index)
        );
      }
    } else {
      if (questionType === "single_choice") {
        setCorrectOptionsHI(isChecked ? [index] : []);
      } else {
        setCorrectOptionsHI((prev) =>
          isChecked
            ? [...prev, index]
            : prev.filter((optIndex) => optIndex !== index)
        );
      }
    }
  };

  const { mutate: updateQuestion, isPending } = useUpdateQuestion(id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const hasEmptyCorrectOptionsEN = correctOptionsEN.some(
      (index) => !optionsEN[index].trim()
    );
    const hasEmptyCorrectOptionsHI = correctOptionsHI.some(
      (index) => !optionsHI[index].trim()
    );

    if (hasEmptyCorrectOptionsEN || hasEmptyCorrectOptionsHI) {
      toast({
        title: "Invalid correct option",
        description: "Correct options cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    const submitUpdate = async () => {
      try {
        let imageUrl = "";

        if (imageFile) {
          const { url, key } = await getUploadUrl(imageFile.type);
          await uploadImageToS3(url, imageFile);
          imageUrl = key;
        }

        const payload = {
          text: questionTextEN,
          text_hi: questionTextHI,
          solution: explanationEN,
          solution_hi: explanationHI,
          marks: 1,
          negativeMarks: 0.25,
          isTwoOptions: questionType === "single_choice" ? false : true,
          options: optionsEN,
          options_hi: optionsHI,
          correctAnswers: correctOptionsEN.map((index) => optionsEN[index]),
          correctAnswers_hi: correctOptionsHI.map((index) => optionsHI[index]),
          subject: selectedSubjects.map((s) => s.value),
          topics: selectedTopics.map((t) => t.value),
          class: selectedClasses.map((c) => c.value),
          Exams: selectedExams.map((e) => e.value),
          ...(imageUrl && { image: imageUrl }),
        };

        updateQuestion(payload, {
          onSuccess: async () => {
            toast({ title: "Success", description: "Question updated!" });
            await queryClient.invalidateQueries({ queryKey: ["get-question"] });
            navigate(`/questions/${id}`, { replace: true });
          },
          onError: (error) => {
            toast({
              title: "Update Failed",
              description: error?.message ?? "Please try again later.",
              variant: "destructive",
            });
          },
        });
      } catch (error) {
        console.error("Error updating question:", error);
        toast({
          title: "Update Failed",
          description: "Failed to upload image or update question.",
          variant: "destructive",
        });
      }
    };

    submitUpdate();
  };

  const goBackToQuestion = () => {
    navigate(`/questions/${id}`, { replace: true });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading question...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">Error loading question</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={goBackToQuestion}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Question
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Question</h1>
          <div className="flex items-center gap-4 mt-1">
                <p className="text-muted-foreground">Question ID: {id}</p>
                {questionData?.data?.serial_no && (
                  <Badge variant="outline" className="font-mono text-sm">
                    Serial No: {questionData?.data?.serial_no}
                  </Badge>
                )}
              </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Question Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={questionType}
                onValueChange={(value) => {
                  const newType = value as "single_choice" | "multiple_choice";
                  setQuestionType(newType);

                  if (newType === "single_choice") {
                    if (correctOptionsEN.length > 1) {
                      setCorrectOptionsEN([correctOptionsEN[0]]);
                    }
                    if (correctOptionsHI.length > 1) {
                      setCorrectOptionsHI([correctOptionsEN[0]]);
                    }
                  }
                }}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="single_choice" id="single_choice" />
                  <Label htmlFor="single_choice">
                    Single Choice (Only one correct answer)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="multiple_choice"
                    id="multiple_choice"
                  />
                  <Label htmlFor="multiple_choice">
                    Multiple Choice (Multiple correct answers)
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Tabs defaultValue="english" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="english">English</TabsTrigger>
              <TabsTrigger value="hindi">Hindi</TabsTrigger>
            </TabsList>

            <TabsContent value="english" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Question (English)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="questionTextEN">Question Text</Label>
                    <Textarea
                      id="questionTextEN"
                      value={questionTextEN}
                      onChange={(e) => setQuestionTextEN(e.target.value)}
                      required
                    />
                    <div className="mt-2 p-2 bg-muted/50 rounded-md">
                      <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                      <MathText text={questionTextEN} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Question Image (Optional)</Label>
                    <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center relative">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setImageFile(e.target.files?.[0] || null)
                        }
                        className="absolute inset-0 opacity-0 z-10 h-full w-full cursor-pointer"
                      />

                      {imageFile ? (
                        <img
                          src={URL.createObjectURL(imageFile)}
                          alt="Preview"
                          className="max-h-48 object-contain"
                        />
                      ) : questionData?.data?.image?.trim() ? (
                        <img
                          src={questionData?.data?.image}
                          alt="Preview"
                          className="max-h-48 object-contain"
                        />
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-muted-foreground mb-1">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">
                            SVG, PNG, JPG (max. 2MB)
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="explanationEN">
                      Explanation (Optional)
                    </Label>
                    <Textarea
                      id="explanationEN"
                      value={explanationEN}
                      onChange={(e) => setExplanationEN(e.target.value)}
                    />
                    <div className="mt-2 p-2 bg-muted/50 rounded-md">
                      <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                      <MathText text={explanationEN} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Options (English)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {optionsEN.map((option, index) => (
                      <div
                        key={index}
                        className="border rounded-md p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium">
                            Option {index + 1}
                          </h3>
                        </div>

                        <div className="space-y-2">
                          <Input
                            id={`option-${index}-text-en`}
                            value={option}
                            onChange={(e) =>
                              handleOptionChange(index, e.target.value, "en")
                            }
                            required
                          />
                          <div className="mt-1">
                            <MathText text={option} inline className="text-sm text-muted-foreground" />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={correctOptionsEN.includes(index)}
                            onCheckedChange={(checked) =>
                              handleCorrectOptionChange(
                                index,
                                checked === true,
                                "en"
                              )
                            }
                          />
                          <Label htmlFor={`correct-${index}`}>
                            {questionType === "single_choice"
                              ? "This is the correct answer"
                              : "This is a correct answer"}
                          </Label>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hindi" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Question (Hindi)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="questionTextHI">Question Text</Label>
                    <Textarea
                      id="questionTextHI"
                      value={questionTextHI}
                      onChange={(e) => setQuestionTextHI(e.target.value)}
                    />
                    <div className="mt-2 p-2 bg-muted/50 rounded-md">
                      <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                      <MathText text={questionTextHI} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="explanationHI">
                      Explanation (Optional)
                    </Label>
                    <Textarea
                      id="explanationHI"
                      value={explanationHI}
                      onChange={(e) => setExplanationHI(e.target.value)}
                    />
                    <div className="mt-2 p-2 bg-muted/50 rounded-md">
                      <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                      <MathText text={explanationHI} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Options (Hindi)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {optionsHI.map((option, index) => (
                      <div
                        key={`hi-${index}`}
                        className="border rounded-md p-4 space-y-3"
                      >
                        <h3 className="text-sm font-medium">
                          Option {index + 1}
                        </h3>

                        <div className="space-y-2">
                          <Input
                            id={`option-${index}-text-hi`}
                            value={option}
                            onChange={(e) =>
                              handleOptionChange(index, e.target.value, "hi")
                            }
                          />
                          <div className="mt-1">
                            <MathText text={option} inline className="text-sm text-muted-foreground" />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={correctOptionsHI.includes(index)}
                            onCheckedChange={(checked) =>
                              handleCorrectOptionChange(
                                index,
                                checked === true,
                                "hi"
                              )
                            }
                          />
                          <Label htmlFor={`correct-hi-${index}`}>
                            {questionType === "single_choice"
                              ? "This is the correct answer"
                              : "This is a correct answer"}
                          </Label>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <SubjectSelector
                  value={selectedSubjects}
                  onChange={setSelectedSubjects}
                />
                <TopicSelector
                  value={selectedTopics}
                  onChange={setSelectedTopics}
                />
                <ClassSelector
                  value={selectedClasses}
                  onChange={setSelectedClasses}
                />
                <ExamSelector
                  value={selectedExams}
                  onChange={setSelectedExams}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Button variant="destructive" type="button">
              Delete Question
            </Button>
            <div className="flex items-center space-x-2">
              <Button
                disabled={isPending}
                variant="outline"
                type="button"
                onClick={() => navigate(`/questions/${id}`)}
              >
                Cancel
              </Button>
              <Button disabled={isPending} type="submit">
                {isPending ? "Loading..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
