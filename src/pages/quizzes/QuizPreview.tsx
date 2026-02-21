import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileDown } from "lucide-react";
import { useGetQuiz } from "@/lib/api/queries/use-get-quiz";
import { useGetQuestionsByIds } from "@/lib/api/queries/use-get-questions-by-ids";
import { Loader2 } from "lucide-react";
import html2pdf from "html2pdf.js";
import { useEffect, useState, useMemo, useRef } from "react";
import { MathText } from "@/math/MathText";

export default function QuizPreview() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetQuiz(id!);
  const quiz = data?.data;

  const questionIds = useMemo(() => {
    if (!quiz?.questions) return [];
    return quiz.questions.filter((q): q is string => typeof q === "string");
  }, [quiz?.questions]);

  const { data: questionsData } = useGetQuestionsByIds(questionIds);
  const questions = questionsData?.data ?? [];

  const [imageBase64Map, setImageBase64Map] = useState<Record<string, string>>({});
  const [imagesLoading, setImagesLoading] = useState(true);
  const hasRunImagesForIds = useRef<string | null>(null);

  const questionIdsKey = questionIds.length ? questionIds.join(",") : "";
  const questionsLoaded =
    questionIds.length > 0 &&
    questionsData?.data &&
    questionsData.data.length === questionIds.length;

  useEffect(() => {
    if (!questionsLoaded || !questionsData?.data) {
      if (!questionIds.length) setImagesLoading(false);
      return;
    }
    if (hasRunImagesForIds.current === questionIdsKey) return;
    hasRunImagesForIds.current = questionIdsKey;
    const qs = questionsData.data;

    const convertImagesToBase64 = async () => {
      const imageMap: Record<string, string> = {};
      const imagePromises: Promise<void>[] = [];

      qs.forEach((question: any) => {
        if (question.image) {
          const promise = (async () => {
            try {
              const response = await fetch(question.image, {
                method: "GET",
                mode: "cors",
                headers: {
                  Accept: "image/*",
                  "Access-Control-Allow-Origin": "*",
                },
              });
              const blob = await response.blob();
              const reader = new FileReader();
              await new Promise<void>((resolve) => {
                reader.onloadend = () => {
                  imageMap[question._id] = reader.result as string;
                  resolve();
                };
                reader.readAsDataURL(blob);
              });
            } catch (err) {
              console.error("Error converting image to base64:", err);
              imageMap[question._id] = question.image;
            }
          })();
          imagePromises.push(promise);
        }
      });

      await Promise.all(imagePromises);
      setImageBase64Map(imageMap);
      setImagesLoading(false);
    };

    convertImagesToBase64();
  }, [questionIdsKey, questionsLoaded]);

  const handleDownloadPDF = () => {
    const element = document.getElementById("quiz-paper");
    if (!element) return;
    const opt = {
      margin: 1,
      filename: `${quiz?.title?.replace(/\s+/g, "_") ?? "quiz"}.pdf`,
      image: { quality: 0.98, type: "jpeg" },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  const navigate = useNavigate();
  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(`/quizzes/${id}`);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={goBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            disabled={imagesLoading || questions.length === 0}
          >
            <FileDown className="h-4 w-4 mr-2" />
            {imagesLoading ? "Loading Images..." : "Download as PDF"}
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

        {!isLoading && !error && quiz && questions.length > 0 && (
          <div
            id="quiz-paper"
            className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto"
          >
            <div className="text-center mb-8 border-b pb-4">
              <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
              {quiz.title_hi && (
                <p className="text-lg text-gray-600">{quiz.title_hi}</p>
              )}
              <div className="mt-4 text-sm text-gray-500">
                <p>Duration: {quiz.durationInMinutes ?? 0} minutes</p>
                <p>Total Questions: {quiz.totalQuestions ?? questions.length}</p>
              </div>
            </div>

            {questions.map((question: any, qIndex: number) => (
              <div key={question._id} className="mb-8 p-4 border rounded-lg">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-lg font-medium">
                      {qIndex + 1}. <MathText text={question.text} inline />
                    </p>
                    {question?.serial_no && (
                      <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Serial: {question.serial_no}
                      </span>
                    )}
                  </div>
                  {question.text_hi && (
                    <p className="text-gray-600">
                      <MathText text={question.text_hi} inline />
                    </p>
                  )}
                </div>

                {question.image && (
                  <div className="flex justify-center my-4">
                    {imageBase64Map[question._id] ? (
                      <img
                        src={imageBase64Map[question._id]}
                        alt="Question"
                        className="max-h-64 object-contain rounded"
                      />
                    ) : (
                      <div className="h-64 w-full flex items-center justify-center bg-gray-100 rounded">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-medium mb-2">Options (English)</h3>
                    <div className="space-y-2">
                      {(question.options || []).map((option: string, optIndex: number) => (
                        <div
                          key={optIndex}
                          className={`p-2 rounded ${
                            (question.correctAnswers || []).includes(option)
                              ? "bg-green-50 border border-green-200"
                              : "bg-gray-50"
                          }`}
                        >
                          <span className="font-medium mr-2">
                            {String.fromCharCode(65 + optIndex)}.
                          </span>
                          <MathText text={option} inline />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Options (Hindi)</h3>
                    <div className="space-y-2">
                      {(question.options_hi || []).map((option: string, optIndex: number) => (
                        <div
                          key={optIndex}
                          className={`p-2 rounded ${
                            (question.correctAnswers_hi || []).includes(option)
                              ? "bg-green-50 border border-green-200"
                              : "bg-gray-50"
                          }`}
                        >
                          <span className="font-medium mr-2">
                            {String.fromCharCode(65 + optIndex)}.
                          </span>
                          <MathText text={option} inline />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && !error && quiz && questions.length === 0 && (
          <div className="w-full flex items-center justify-center py-12 text-muted-foreground">
            No questions in this quiz.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
