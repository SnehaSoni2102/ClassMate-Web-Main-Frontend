import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import SubjectSelector from "@/components/selectors/SubjectSelector";
import TopicSelector from "@/components/selectors/TopicSelector";
import ClassSelector from "@/components/selectors/ClassSelector";
import ExamSelector from "@/components/selectors/ExamSelector";
import { Option } from "@/components/ui/multiple-selector";
import { useCreateQuestion } from "@/lib/api/mutations/create-question-mutation";
import { getUploadUrl } from "@/lib/api/queries/get-upload-url";
import { uploadImageToS3 } from "@/lib/utils/upload";

export default function CreateQuestion() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutate: createQuestion, isPending } = useCreateQuestion();

  // State management
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (correctOptionsEN.length === 0) {
      toast({
        title: "No correct option selected",
        description: "Please select at least one correct option.",
        variant: "destructive",
      });
      return;
    }

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

    const submitQuestion = async () => {
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

        createQuestion(payload, {
          onSuccess: () => {
            toast({
              title: "Success",
              description: "Question created successfully!",
            });
            navigate("/questions");
          },
          onError: (error) => {
            toast({
              title: "Creation Failed",
              description: error?.message ?? "Please try again later.",
              variant: "destructive",
            });
          },
        });
      } catch (error) {
        console.error("Error creating question:", error);
        toast({
          title: "Upload Failed",
          description: "Failed to upload image or create question.",
          variant: "destructive",
        });
      }
    };

    submitQuestion();
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/questions">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Questions
            </Link>
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create New Question
          </h1>
          <p className="text-muted-foreground mt-1">
            Create a new question for your test bank.
          </p>
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
                      setCorrectOptionsHI([correctOptionsHI[0]]);
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
                      placeholder="Type your question in English"
                      required
                    />
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
                      Explanation
                    </Label>
                    <Textarea
                      id="explanationEN"
                      value={explanationEN}
                      onChange={(e) => setExplanationEN(e.target.value)}
                      placeholder="Provide an explanation for the correct answer(s)"
                      required
                    />
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
                            placeholder="Enter option text in English"
                            required
                          />
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
                      placeholder="Type your question in Hindi"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="explanationHI">
                      Explanation
                    </Label>
                    <Textarea
                      id="explanationHI"
                      value={explanationHI}
                      onChange={(e) => setExplanationHI(e.target.value)}
                      placeholder="Provide an explanation for the correct answer(s) in Hindi"
                      required
                    />
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
                            placeholder="Enter option text in Hindi"
                          />
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

          <div className="flex items-center justify-end space-x-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate("/questions")}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending ? "Creating your question..." : "Create Question"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}