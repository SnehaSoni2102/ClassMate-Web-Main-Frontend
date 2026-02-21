import { api } from "../api-interceptor";
import { useQuery } from "@tanstack/react-query";
import type { Quiz } from "./use-get-quizzes";

export interface GetQuizResponse {
  message?: string;
  success?: boolean;
  data: Quiz;
}

export const useGetQuiz = (id: string | undefined) => {
  return useQuery<GetQuizResponse>({
    queryKey: ["get-quiz", id],
    queryFn: async () => {
      const response = await api.get(`/quiz/${id}`);
      return response.data;
    },
    retry: (failureCount) => failureCount < 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: !!id,
  });
};
