import { api } from "../api-interceptor";
import { useQuery } from "@tanstack/react-query";
import type { GetQuizzesResponse } from "./use-get-quizzes";

export const useGetInProgressQuizzes = () => {
  return useQuery<GetQuizzesResponse>({
    queryKey: ["quiz-in-progress"],
    queryFn: async () => {
      const response = await api.get("/quiz/in-progress");
      return response.data;
    },
    retry: (failureCount) => failureCount < 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};
