import { api } from "../api-interceptor";
import { useQueries } from "@tanstack/react-query";

export interface Question {
  _id: string;
  text: string;
  text_hi: string;
  options: string[];
  options_hi: string[];
  correctAnswers: string[];
  correctAnswers_hi: string[];
  marks: number;
  negativeMarks: number;
  isTwoOptions: boolean;
  solution: string;
  image?: string;
  serial_no?: string; // optional serial number
  createdAt: string;
  updatedAt: string;
}

export type GetQuestionResponse = {
  message: string;
  data: Question;
  success: boolean;
};

export const useGetQuestionsByIds = (questionIds: string[]) => {
  const queries = useQueries({
    queries: questionIds.map((id) => ({
      queryKey: ["get-question", id],
      queryFn: async () => {
        const response = await api.get(`/question/admin/${id}`);
        return response.data;
      },
      enabled: !!id,
      retry: (failureCount: number) => failureCount < 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    })),
  });

  const isLoading = queries.some(query => query.isLoading);
  const error = queries.find(query => query.error)?.error;
  const data = queries
    .map(query => query.data?.data)
    .filter(Boolean);

  return {
    data: { data },
    isLoading,
    error,
  };
}; 