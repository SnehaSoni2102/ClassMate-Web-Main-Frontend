import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api-interceptor";
import { useToast } from "@/components/ui/use-toast";
import type { CreateQuizPayload } from "./create-quiz-mutation";

export interface UpdateQuizResponse {
  message: string;
  success: boolean;
  data?: unknown;
}

export const useUpdateQuiz = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<UpdateQuizResponse, Error, { id: string; payload: CreateQuizPayload }>({
    mutationKey: ["update-quiz"],
    mutationFn: async ({ id, payload }) => {
      const response = await api.patch(`/quiz/${id}`, payload);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["get-quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["search-quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["quiz-completed"] });
      queryClient.invalidateQueries({ queryKey: ["quiz-in-progress"] });
      queryClient.invalidateQueries({ queryKey: ["get-quiz", variables.id] });
      toast({
        title: "Success",
        description: data.message || "Quiz updated successfully",
      });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast({
        title: "Error",
        description: err.response?.data?.message || err.message || "Failed to update quiz",
        variant: "destructive",
      });
    },
  });
};
