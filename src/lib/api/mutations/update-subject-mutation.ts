import { api } from "../api-interceptor";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateSubjectInput {
  id: string;
  name: string;
  name_hi: string;
}

export const useUpdateSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, name_hi }: UpdateSubjectInput) => {
      const response = await api.patch(`/subject/${id}`, {
        name,
        name_hi,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["search-subjects"] });
      queryClient.invalidateQueries({ queryKey: ["get-subject"] });
    },
  });
}; 