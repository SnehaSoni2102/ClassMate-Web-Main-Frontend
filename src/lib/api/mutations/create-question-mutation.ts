import { UseMutationResult, useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "../api-interceptor";

interface QuestionPayload {
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
  solution_hi: string;
  image?: string;
}

export const useCreateQuestion = (
): UseMutationResult<any, AxiosError, QuestionPayload> => {
  const createQuestion = async (data: QuestionPayload) => {
    const response = await api.post(`/question/admin`, data);
    return response.data;
  };

  return useMutation({
    mutationKey: ["create-question"],
    mutationFn: createQuestion,
  });
};
