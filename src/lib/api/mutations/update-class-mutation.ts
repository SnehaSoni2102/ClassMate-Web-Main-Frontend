import { useMutation } from "@tanstack/react-query";
import { api } from "../api-interceptor";

interface UpdateClassInput {
  id: string;
  name: string;
}

export const useUpdateClass = () => {
  return useMutation({
    mutationFn: async ({ id, name }: UpdateClassInput) => {
      const response = await api.patch(`/class/update/${id}`, { name });
      return response.data;
    },
  });
}; 