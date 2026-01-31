import { useMutation } from "@tanstack/react-query";
import { api } from "../api-interceptor";

export const useDeleteTopic = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/topic/delete/${id}`);
      return response.data;
    },
  });
}; 