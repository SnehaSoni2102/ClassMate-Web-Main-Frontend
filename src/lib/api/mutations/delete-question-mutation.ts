import { UseMutationResult, useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "../api-interceptor";

export const useDeleteQuestion = (
  id: string
): UseMutationResult<any, AxiosError, void> => {
  const deleteQuestion = async () => {
    const response = await api.delete(`/question/delete-question/${id}`);
    return response.data;
  };

  return useMutation({
    mutationKey: ["delete-question", id],
    mutationFn: deleteQuestion,
  });
};
