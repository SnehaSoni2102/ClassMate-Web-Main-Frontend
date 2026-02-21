import { api } from "../api-interceptor";
import { useQuery } from "@tanstack/react-query";
import type { GetQuizzesResponse } from "./use-get-quizzes";

export const useGetCompletedQuizzes = () => {
  return useQuery<GetQuizzesResponse>({
    queryKey: ["quiz-completed"],
    queryFn: async () => {
      const response = await api.get("/quiz/completed");
      return response.data;
    },
    retry: (failureCount) => failureCount < 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};
