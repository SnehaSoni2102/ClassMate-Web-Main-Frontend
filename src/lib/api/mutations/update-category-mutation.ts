import { useMutation } from "@tanstack/react-query";
import { api } from "../api-interceptor";

export const useUpdateCategory = () => {
  return useMutation({
    mutationKey: ["update-category"],
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const res = await api.patch(`/category/update/${id}`, formData);
      return res.data;
    },
  });
}; 