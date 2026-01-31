import { UseMutationResult, useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "../api-interceptor";

interface UpdateQuestionPayload {
  text: string;
  text_hi: string;
  solution: string;
  solution_hi: string;
  marks: number;
  negativeMarks: number;
  isTwoOptions: boolean;
  options: string[];
  options_hi: string[];
  correctAnswers: string[];
  correctAnswers_hi: string[];
  subject: string[];
  topics: string[];
  class: string[];
  Exams: string[];
  image?: string;
}

export const useUpdateQuestion = (
  id: string
): UseMutationResult<any, AxiosError, UpdateQuestionPayload> => {
  const updateQuestion = async (data: UpdateQuestionPayload) => {
    const response = await api.patch(`/question/update/${id}`, data);
    return response.data;
  };

  return useMutation({
    mutationKey: ["update-question", id],
    mutationFn: updateQuestion,
  });
};
