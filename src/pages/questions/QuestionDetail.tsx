import { useParams, Link, useNavigate } from "react-router-dom";
import moment from "moment";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetQuestion } from "@/lib/api/queries/use-get-question";
import { useDeleteQuestion } from "@/lib/api/mutations/delete-question-mutation";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MathText } from "@/math/MathText";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export default function QuestionDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useGetQuestion(id);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const deleteQuestionMutation = useDeleteQuestion(id!);

  const goback = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/questions");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteQuestionMutation.mutateAsync();
      toast({
        title: "Success",
        description: "Question deleted successfully",
      });
      // Invalidate the questions query cache
      await queryClient.invalidateQueries({ queryKey: ["get-questions"] });
      navigate("/questions");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to delete question",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      {isLoading ? (
        <div className="w-full flex items-center justify-center py-12">
          <Loader2 className="transition-all duration-300 animate-spin text-blue-400" />
        </div>
      ) : !data || !data.data ? (
        <div className="w-full flex items-center justify-center py-12">
          <span className="text-gray-500 text-lg font-medium">
            No questions found.
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={goback}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Question Details
              </h1>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-muted-foreground">Question ID: {id}</p>
                {data?.data?.serial_no && (
                  <Badge variant="outline" className="font-mono text-sm">
                    Serial No: {data.data.serial_no}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link to={`/questions/${id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Question
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Question
              </Button>
            </div>
          </div>

          <Tabs defaultValue="en">
            <TabsList>
              <TabsTrigger value="en">English</TabsTrigger>
              <TabsTrigger value="hi">Hindi</TabsTrigger>
            </TabsList>

            <TabsContent value="en" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Question</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Text</h3>
                      <p className="text-muted-foreground">
                        <MathText text={data?.data?.text} />
                      </p>
                    </div>

                    {data?.data?.image?.trim() && (
                      <div>
                        <h3 className="text-lg font-medium">Image</h3>
                        <div className="mt-2 border rounded-md overflow-hidden">
                          <img
                            src={data?.data?.image}
                            alt="Question"
                            className="w-full h-auto max-h-64 object-contain"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="text-lg font-medium">Options</h3>
                      <div className="mt-2 space-y-2">
                        {data?.data?.options.map((option, i) => {
                          const isCorrect =
                            data?.data?.correctAnswers?.includes(option);
                          return (
                            <div
                              key={i}
                              className={`p-3 rounded-md border flex items-center justify-between ${
                                isCorrect
                                  ? "border-green-500 bg-green-50"
                                  : "border-gray-200"
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <MathText text={option} inline className="font-medium" />
                                {/* <span className="font-medium">{option}</span> */}
                                {/* Fixed: Only show image if it exists and ensure it's a string type */}
                                {/* {"image" in option &&
                                  typeof option.image === "string" &&
                                  option.image && (
                                    <img
                                      src={option.image}
                                      alt={`Option ${option.id}`}
                                      className="w-10 h-10 object-cover rounded"
                                    />
                                  )} */}
                              </div>
                              {isCorrect ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-gray-300" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {data?.data?.solution && (
                      <div>
                        <h3 className="text-lg font-medium">Solution</h3>
                        <p className="text-muted-foreground">
                          <MathText text={data?.data?.solution} />
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hi" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>प्रश्न</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">पाठ</h3>
                      <p className="text-muted-foreground">
                        <MathText text={data?.data?.text_hi} />
                      </p>
                    </div>

                    {data?.data?.image?.trim() && (
                      <div>
                        <h3 className="text-lg font-medium">छवि</h3>
                        <div className="mt-2 border rounded-md overflow-hidden">
                          <img
                            src={data?.data?.image}
                            alt="Question"
                            className="w-full h-auto max-h-64 object-contain"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="text-lg font-medium">विकल्प</h3>
                      <div className="mt-2 space-y-2">
                        {data?.data?.options_hi?.map((option, i) => {
                          const isCorrect =
                            data?.data?.correctAnswers_hi?.includes(option);
                          return (
                            <div
                              key={i}
                              className={`p-3 rounded-md border flex items-center justify-between ${
                                isCorrect
                                  ? "border-green-500 bg-green-50"
                                  : "border-gray-200"
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <MathText text={option} inline className="font-medium" />
                                {/* <span className="font-medium">{option}</span> */}
                                {/* Fixed: Only show image if it exists and ensure it's a string type */}
                                {/* {"image" in option &&
                                  typeof option.image === "string" &&
                                  option.image && (
                                    <img
                                      src={option.image}
                                      alt={`Option ${option.id}`}
                                      className="w-10 h-10 object-cover rounded"
                                    />
                                  )} */}
                              </div>
                              {isCorrect ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-gray-300" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {data?.data?.solution && (
                      <div>
                        <h3 className="text-lg font-medium">स्पष्टीकरण</h3>
                        <p className="text-muted-foreground">
                          <MathText text={data?.data?.solution} />
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Question Type</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge
                  variant="outline"
                  className={
                    !data?.data?.isTwoOptions
                      ? "bg-blue-50 text-blue-700"
                      : "bg-purple-50 text-purple-700"
                  }
                >
                  {!data?.data?.isTwoOptions
                    ? "Single Choice"
                    : "Multiple Choice"}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {data?.data?.topics?.length ? (
                    data?.data?.topics?.map((topic, i) => (
                      <Badge key={i} variant="secondary">
                        {topic?.name}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No topics available.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Classes & Exams</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium">Classes</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {data?.data?.class?.length ? (
                        data.data.class.map((cls, i) => (
                          <Badge key={i} variant="outline">
                            {cls?.name}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No classes available.
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium">Exams</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {data?.data?.Exams?.length ? (
                        data.data.Exams.map((exam, i) => (
                          <Badge key={i} variant="outline">
                            {exam?.name}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No exams available.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Meta Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Created At</h3>
                  <p>{moment(data?.data?.createdAt).format("DD MMM YYYY")}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Updated At</h3>
                  <p>{moment(data?.data?.updatedAt).format("DD MMM YYYY")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Question</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this question? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={deleteQuestionMutation.isPending}
                >
                  {deleteQuestionMutation.isPending ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </AdminLayout>
  );
}
