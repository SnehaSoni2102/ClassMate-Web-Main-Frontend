import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateQuestion } from "@/lib/api/mutations/create-question-mutation";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { getUploadUrl } from "@/lib/api/queries/get-upload-url";
import { uploadImageToS3 } from "@/lib/utils/upload";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function CreateQuestionDialog({
  onSuccess,
  trigger,
}: {
  onSuccess: (question: any) => void;
  trigger: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [textEN, setTextEN] = useState("");
  const [textHI, setTextHI] = useState("");
  const [solutionEN, setSolutionEN] = useState("");
  const [solutionHI, setSolutionHI] = useState("");
  const [options, setOptions] = useState([
    { en: "", hi: "", isCorrectEN: false, isCorrectHI: false },
    { en: "", hi: "", isCorrectEN: false, isCorrectHI: false },
    { en: "", hi: "", isCorrectEN: false, isCorrectHI: false },
    { en: "", hi: "", isCorrectEN: false, isCorrectHI: false },
  ]);
  const [error, setError] = useState("");
  const createQuestion = useCreateQuestion();
  const [questionType, setQuestionType] = useState<
    "single_choice" | "multiple_choice"
  >("single_choice");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleOptionChange = (
    idx: number,
    field: "en" | "hi",
    value: string
  ) => {
    setOptions((prev) =>
      prev.map((opt, i) => (i === idx ? { ...opt, [field]: value } : opt))
    );
  };
  const handleCorrectChange = (
    idx: number,
    field: "isCorrectEN" | "isCorrectHI",
    checked: boolean
  ) => {
    setOptions((prev) =>
      prev.map((opt, i) => {
        if (i !== idx) {
          // For single choice, uncheck all others
          if (
            questionType === "single_choice" &&
            checked &&
            ((field === "isCorrectEN" && lang === "en") ||
              (field === "isCorrectHI" && lang === "hi"))
          ) {
            return { ...opt, [field]: false };
          }
          return opt;
        }
        return { ...opt, [field]: checked };
      })
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (lang === "en") {
      if (!textEN.trim() || options.some((o) => !o.en.trim())) {
        setError("Please fill all English fields.");
        return;
      }
      const correctCount = options.filter((o) => o.isCorrectEN).length;
      if (correctCount === 0) {
        setError("Select at least one correct answer (English). ");
        return;
      }
      if (questionType === "single_choice" && correctCount > 1) {
        setError("Only one correct answer allowed for single choice.");
        return;
      }
    } else {
      if (!textHI.trim() || options.some((o) => !o.hi.trim())) {
        setError("Please fill all Hindi fields.");
        return;
      }
      const correctCount = options.filter((o) => o.isCorrectHI).length;
      if (correctCount === 0) {
        setError("Select at least one correct answer (Hindi). ");
        return;
      }
      if (questionType === "single_choice" && correctCount > 1) {
        setError("Only one correct answer allowed for single choice.");
        return;
      }
    }

    try {
      let imageUrl = "";

      // Upload image to S3 if exists
      if (imageFile) {
        const { url, key } = await getUploadUrl(imageFile.type);
        await uploadImageToS3(url, imageFile);
        imageUrl = key;
      }

      // Prepare JSON payload
      const payload = {
        text: textEN,
        text_hi: textHI,
        options: options.map((opt) => opt.en),
        options_hi: options.map((opt) => opt.hi),
        correctAnswers: options
          .filter((o) => o.isCorrectEN)
          .map((o) => o.en),
        correctAnswers_hi: options
          .filter((o) => o.isCorrectHI)
          .map((o) => o.hi),
        marks: 1,
        negativeMarks: 0,
        isTwoOptions: questionType === "multiple_choice",
        solution: solutionEN,
        solution_hi: solutionHI,
        ...(imageUrl && { image: imageUrl }),
      };

      createQuestion.mutate(payload, {
        onSuccess: async (res) => {
          toast({
            title: "Question created successfully!",
            description: res?.message || "Question has been created.",
          });
          // Reset form
          setTextEN("");
          setTextHI("");
          setSolutionEN("");
          setSolutionHI("");
          setLang("en");
          setOptions([
            { en: "", hi: "", isCorrectEN: false, isCorrectHI: false },
            { en: "", hi: "", isCorrectEN: false, isCorrectHI: false },
            { en: "", hi: "", isCorrectEN: false, isCorrectHI: false },
            { en: "", hi: "", isCorrectEN: false, isCorrectHI: false },
          ]);
          setImageFile(null);
          setQuestionType("single_choice");
          onSuccess(res?.data);
          setOpen(false);
          await queryClient.invalidateQueries({ queryKey: ["get-test"] });
        },
        onError: (err: any) => {
          toast({
            title: "Failed to create question",
            description:
              err?.response?.data?.message || err?.message || "Unknown error",
            variant: "destructive",
          });
        },
      });
    } catch (err: any) {
      toast({
        title: "Failed to create question",
        description:
          err?.response?.data?.message || err?.message || "Unknown error",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg p-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">Create New Question</DialogTitle>
          <div className="flex items-center justify-between w-full">
            <DialogDescription className="text-xs">
              Fill in the details below to add a new question.
            </DialogDescription>
            <div className="flex gap-1">
              <Button
                type="button"
                size="sm"
                variant={lang === "en" ? "default" : "outline"}
                onClick={() => setLang("en")}
                className="px-2 py-1 h-7"
              >
                EN
              </Button>
              <Button
                type="button"
                size="sm"
                variant={lang === "hi" ? "default" : "outline"}
                onClick={() => setLang("hi")}
                className="px-2 py-1 h-7"
              >
                HI
              </Button>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="mb-2">
            <Label className="text-xs">Question Type</Label>
            <div className="flex flex-row gap-2 mt-1">

            </div>
            <RadioGroup
              value={questionType}
              onValueChange={(val) => {
                const newType = val as "single_choice" | "multiple_choice";
                setQuestionType(newType);
                if (newType === "single_choice") {
                  // Reset all correct options if switching to single choice
                  setOptions(prev => prev.map(opt => ({
                    ...opt,
                    isCorrectEN: false,
                    isCorrectHI: false
                  })));
                }
              }}
              className="flex flex-row gap-2 mt-1"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="single_choice" id="single_choice" />
                <Label htmlFor="single_choice" className="text-xs">
                  Single
                </Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="multiple_choice" id="multiple_choice" />
                <Label htmlFor="multiple_choice" className="text-xs">
                  Multiple
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {lang === "en" ? (
              <div>
                <Label className="text-xs">Question (English)</Label>
                <Textarea
                  value={textEN}
                  onChange={(e) => setTextEN(e.target.value)}
                  required
                  className="text-xs min-h-[48px]"
                />
              </div>
            ) : (
              <div>
                <Label className="text-xs">Question (Hindi)</Label>
                <Textarea
                  value={textHI}
                  onChange={(e) => setTextHI(e.target.value)}
                  required
                  className="text-xs min-h-[48px]"
                />
              </div>
            )}
          </div>
          <div className="mb-2">
            <Label className="text-xs">Image (optional)</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-xs"
            />
            {imageFile && (
              <div className="mt-1 flex items-center gap-2">
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt="Preview"
                  className="h-12 w-12 object-contain border rounded"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setImageFile(null)}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
          <div>
            <Label className="text-xs">Options</Label>
            <div className="space-y-2 pr-1">
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2 items-center text-xs">
                  <Input
                    placeholder={
                      lang === "en"
                        ? `Option ${i + 1} (EN)`
                        : `Option ${i + 1} (HI)`
                    }
                    value={lang === "en" ? opt.en : opt.hi}
                    onChange={(e) =>
                      handleOptionChange(i, lang, e.target.value)
                    }
                    required
                    className="w-40 px-2 py-1"
                  />
                  <div className="flex items-center gap-1">
                    <Checkbox
                      checked={
                        lang === "en" ? opt.isCorrectEN : opt.isCorrectHI
                      }
                      onCheckedChange={(checked) =>
                        handleCorrectChange(
                          i,
                          lang === "en" ? "isCorrectEN" : "isCorrectHI",
                          checked === true
                        )
                      }
                      disabled={
                        questionType === "single_choice" &&
                        ((lang === "en" && opt.isCorrectEN) ||
                          (lang === "hi" && opt.isCorrectHI)) &&
                        options.filter((o) =>
                          lang === "en" ? o.isCorrectEN : o.isCorrectHI
                        ).length === 1
                      }
                    />
                    <span>{lang.toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            {lang === "en" ? (
              <>
                <Label className="text-xs">Solution (English)</Label>
                <Textarea
                  value={solutionEN}
                  onChange={(e) => setSolutionEN(e.target.value)}
                  className="text-xs min-h-[48px]"
                />
              </>
            ) : (
              <>
                <Label className="text-xs">Solution (Hindi)</Label>
                <Textarea
                  value={solutionHI}
                  onChange={(e) => setSolutionHI(e.target.value)}
                  className="text-xs min-h-[48px]"
                />
              </>
            )}
          </div>
          {error && <div className="text-red-500 text-xs">{error}</div>}
          <DialogFooter>
            <Button type="submit" size="sm" disabled={createQuestion.isPending}>
              Create Question
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
