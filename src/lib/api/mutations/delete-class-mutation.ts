import { useMutation } from "@tanstack/react-query";
import { api } from "../api-interceptor";

export const useDeleteClass = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/class/delete/${id}`);
      return response.data;
    },
  });
}; 