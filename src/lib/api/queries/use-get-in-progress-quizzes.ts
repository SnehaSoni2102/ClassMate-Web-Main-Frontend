import { api } from "../api-interceptor";
import { useQuery } from "@tanstack/react-query";
import type { GetQuizzesResponse } from "./use-get-quizzes";

export const useGetInProgressQuizzes = () => {
  return useQuery<GetQuizzesResponse>({
    // Backend endpoint spelling is intentionally "upcomming"
    queryKey: ["quiz-upcomming"],
    queryFn: async () => {
      const response = await api.get("/quiz/upcomming");
      return response.data;
    },
    retry: (failureCount) => failureCount < 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};
