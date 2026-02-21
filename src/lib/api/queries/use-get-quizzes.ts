import { api } from "../api-interceptor";
import { useQuery } from "@tanstack/react-query";

export interface Quiz {
  _id: string;
  title: string;
  title_hi?: string;
  description?: string;
  description_hi?: string;
  totalQuestions?: number;
  durationInMinutes?: number;
  totalMarks?: number;
  marksPerQuestion?: number;
  negativeMarks?: number;
  exam?: string;
  languageOptions?: string[];
  type?: "live" | "mock";
  status?: string;
  testType?: "free" | "paid";
  startDate?: string | null;
  startTime?: string;
  endDate?: string | null;
  endTime?: string;
  questions?: (string | { text?: string; options?: string[]; correctOption?: string })[];
  group?: string[];
  attemptedUsers?: string[];
  isAllIndia?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  deletionAt?: string;
  __v?: number;
}

export interface GetQuizzesResponse {
  message?: string;
  success?: boolean;
  data: Quiz[];
}

export const useGetQuizzes = (searchTerm: string = "") => {
  return useQuery<GetQuizzesResponse>({
    queryKey: ["search-quizzes", searchTerm],
    queryFn: async () => {
      const url = searchTerm.trim()
        ? `/quiz/search?query=${encodeURIComponent(searchTerm)}`
        : "/quiz/all";
      const response = await api.get(url);
      return response.data;
    },
    retry: (failureCount) => failureCount < 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};
