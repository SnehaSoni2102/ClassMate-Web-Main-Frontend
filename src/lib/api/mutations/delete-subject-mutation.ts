import { api } from "../api-interceptor";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/subject/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["search-subjects"] });
    },
  });
}; 