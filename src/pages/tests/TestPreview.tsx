import { useParams, Link, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileDown, Eye, EyeOff } from "lucide-react";
import { useGetTest } from "@/lib/api/queries/use-get-test";
import { useGetQuestionsByIds } from "@/lib/api/queries/use-get-questions-by-ids";
import { useUpdateTestStatus } from "@/lib/api/mutations/update-test-status-mutation";
import { Loader2 } from "lucide-react";
import html2pdf from 'html2pdf.js';
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, useMemo } from "react";
import { MathText } from "@/math/MathText";

export default function TestPreview() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetTest(id!);
  const test = data?.data;
  const updateStatus = useUpdateTestStatus();
  const [imageBase64Map, setImageBase64Map] = useState<Record<string, string>>({});
  const [imagesLoading, setImagesLoading] = useState(true);
  
  // Get all question IDs from all sections
  const allQuestionIds = test?.sections?.flatMap(section => section.questions || []) || [];
  const { data: questionsData } = useGetQuestionsByIds(allQuestionIds);
  
  const [sectionsWithQuestions, setSectionsWithQuestions] = useState<any[]>([]);

  // Create stable reference for section structure to prevent infinite loops
  const sectionStructure = useMemo(() => {
    if (!test?.sections) return null;
    return JSON.stringify(test.sections.map((s: any) => ({
      _id: s._id,
      questions: s.questions
    })));
  }, [test?.sections?.length, test?.sections?.map((s: any) => s._id).join(',')]);

  // Populate sections with question objects
  useEffect(() => {
    if (sectionStructure && questionsData?.data) {
      const sections = JSON.parse(sectionStructure);
      const questionsMap = new Map(
        questionsData.data.map((q: any) => [q._id, q])
      );
      
      const sectionsWithQuestionsData = sections.map((section: any) => ({
        ...section,
        questions: section.questions.map((id: string) => questionsMap.get(id)).filter(Boolean)
      }));
      
      setSectionsWithQuestions(sectionsWithQuestionsData);
    }
  }, [sectionStructure, questionsData?.data?.length]);

  // Convert images to base64
  useEffect(() => {
    if (!sectionsWithQuestions.length) return;

    const convertImagesToBase64 = async () => {
      const imageMap: Record<string, string> = {};
      const imagePromises: Promise<void>[] = [];

      sectionsWithQuestions.forEach((section: any) => {
        section.questions.forEach((question: any) => {
          if (question.image) {
            const promise = (async () => {
              try {
                const response = await fetch(question.image, {
                  method: 'GET',
                  mode: 'cors',
                  headers: {
                    'Accept': 'image/*',
                    'Access-Control-Allow-Origin': '*',
                  }
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
                console.error('Error converting image to base64:', err);
                // If fetch fails, try to use the image URL directly
                imageMap[question._id] = question.image;
              }
            })();
            imagePromises.push(promise);
          }
        });
      });

      await Promise.all(imagePromises);
      setImageBase64Map(imageMap);
      setImagesLoading(false);
    };

    convertImagesToBase64();
  }, [sectionsWithQuestions]);

  const handleDownloadPDF = () => {
    const element = document.getElementById('test-paper');
    const opt = {
      margin: 1,
      filename: `${test?.title.replace(/\s+/g, '_')}.pdf`,
      image: { quality: 0.98, type: 'jpeg' },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        allowTaint: true
      },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const handleStatusToggle = () => {
    if (!test) return;
    const newStatus = test.status === 'published' ? 'in-progress' : 'published';
    updateStatus.mutate({ testId: test._id, status: newStatus });
  };

  const navigate = useNavigate();

  const goback = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(`/tests/${id}`);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={goback}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-4">
            <Badge 
              variant={test?.status === 'published' ? 'default' : 'secondary'}
              className="text-sm"
            >
              {test?.status === 'published' ? 'Published' : 'In Progress'}
            </Badge>
            <Button 
              variant="outline" 
              onClick={handleStatusToggle}
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : test?.status === 'published' ? (
                <EyeOff className="h-4 w-4 mr-2" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              {test?.status === 'published' ? 'Set to In Progress' : 'Publish Test'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDownloadPDF}
              disabled={imagesLoading}
            >
              <FileDown className="h-4 w-4 mr-2" />
              {imagesLoading ? 'Loading Images...' : 'Download as PDF'}
            </Button>
          </div>
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

        {!isLoading && !error && test && sectionsWithQuestions.length > 0 && (
          <div id="test-paper" className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8 border-b pb-4">
              <h1 className="text-2xl font-bold mb-2">{test.title}</h1>
              <p className="text-lg text-gray-600">{test.title_hi}</p>
              <div className="mt-4 text-sm text-gray-500">
                <p>Duration: {Math.floor(test.durationInMinutes / 60)} minutes</p>
                <p>Total Marks: {test.totalMarks}</p>
              </div>
            </div>

            {/* Sections */}
            {sectionsWithQuestions.map((section: any, sectionIndex: number) => (
              <div key={section._id} className="mb-8">
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h2 className="text-xl font-semibold">
                    Section {sectionIndex + 1}: {section.name}
                  </h2>
                  <p className="text-gray-600">{section.name_hi}</p>
                  {section.timeLimit && (
                    <p className="text-sm text-gray-500 mt-1">
                      Time Limit: {section.timeLimit} minutes
                    </p>
                  )}
                </div>

                {/* Questions */}
                {section.questions.map((question: any, qIndex: number) => (
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
                      <p className="text-gray-600">
                        <MathText text={question.text_hi} inline />
                      </p>
                    </div>

                    {/* Question Image */}
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
                            <Loader2 className="animate-spin text-gray-400" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Options */}
                    <div className="grid grid-cols-2 gap-8">
                      {/* English Options */}
                      <div>
                        <h3 className="font-medium mb-2">Options (English)</h3>
                        <div className="space-y-2">
                          {question.options.map((option: string, optIndex: number) => (
                            <div
                              key={optIndex}
                              className={`p-2 rounded ${
                                question.correctAnswers.includes(option)
                                  ? 'bg-green-50 border border-green-200'
                                  : 'bg-gray-50'
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

                      {/* Hindi Options */}
                      <div>
                        <h3 className="font-medium mb-2">Options (Hindi)</h3>
                        <div className="space-y-2">
                          {question.options_hi.map((option: string, optIndex: number) => (
                            <div
                              key={optIndex}
                              className={`p-2 rounded ${
                                question.correctAnswers_hi.includes(option)
                                  ? 'bg-green-50 border border-green-200'
                                  : 'bg-gray-50'
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
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 