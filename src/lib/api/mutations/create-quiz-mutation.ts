import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api-interceptor";
import { useToast } from "@/components/ui/use-toast";

export interface CreateQuizPayload {
  title: string;
  description: string;
  title_hi: string;
  description_hi: string;
  totalQuestions: number;
  durationInMinutes: number;
  exam: string;
  languageOptions: string[];
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  questions: string[];
}

export interface CreateQuizResponse {
  message: string;
  success: boolean;
  data?: unknown;
}

export type CreateQuizVariables = {
  payload: CreateQuizPayload;
  groupId?: string;
};

export const useCreateQuiz = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<CreateQuizResponse, Error, CreateQuizVariables>({
    mutationKey: ["create-quiz"],
    mutationFn: async ({ payload, groupId }) => {
      if (groupId) {
        const response = await api.post(`/quiz/create/group/${groupId}`, payload);
        return response.data;
      }
      const response = await api.post("/quiz/create", payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["get-quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["search-quizzes"] });
      toast({
        title: "Success",
        description: data.message || "Quiz created successfully",
      });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast({
        title: "Error",
        description: err.response?.data?.message || err.message || "Failed to create quiz",
        variant: "destructive",
      });
    },
  });
};
