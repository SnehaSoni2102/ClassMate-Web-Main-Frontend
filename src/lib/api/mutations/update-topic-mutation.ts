import { useMutation } from "@tanstack/react-query";
import { api } from "../api-interceptor";

interface UpdateTopicInput {
  id: string;
  name: string;
  name_hi: string;
}

export const useUpdateTopic = () => {
  return useMutation({
    mutationFn: async ({ id, name, name_hi }: UpdateTopicInput) => {
      const response = await api.patch(`/topic/update/${id}`, {
        name,
        name_hi,
      });
      return response.data;
    },
  });
}; 