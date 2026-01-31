import { UseMutationResult, useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "../api-interceptor";

interface BulkDeletePayload {
  questionIds: string[];
}

export const useBulkDeleteQuestions = (): UseMutationResult<any, AxiosError, BulkDeletePayload> => {
  const bulkDeleteQuestions = async (payload: BulkDeletePayload) => {
    const response = await api.delete("/question/bulk-delete", { data: payload });
    return response.data;
  };

  return useMutation({
    mutationKey: ["bulk-delete-questions"],
    mutationFn: bulkDeleteQuestions,
  });
};
