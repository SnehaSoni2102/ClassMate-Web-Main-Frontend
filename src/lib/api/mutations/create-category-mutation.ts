import { useMutation } from "@tanstack/react-query";
import { api } from "../api-interceptor";

export const useCreateCategory = () => {
  return useMutation({
    mutationKey: ["create-category"],
    mutationFn: async (formData: FormData) => {
      const res = await api.post("/category/add", formData);
      return res.data;
    },
  });
}; 