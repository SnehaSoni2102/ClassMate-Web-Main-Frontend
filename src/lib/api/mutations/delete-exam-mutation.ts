import { useMutation } from "@tanstack/react-query";
import { api } from "../api-interceptor";

export const useDeleteExam = () => {
  return useMutation({
    mutationKey: ["delete-exam"],
    mutationFn: async (id: string) => {
      const response = await api.delete(`/exam/delete/${id}`);
      return response.data;
    },
  });
}; 