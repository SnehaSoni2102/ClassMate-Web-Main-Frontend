import { useMutation } from "@tanstack/react-query";
import { api } from "../api-interceptor";

export const useCreateExam = () => {
  return useMutation({
    mutationKey: ["create-exam"],
    mutationFn: async (formData: FormData) => {
      const res = await api.post("/exam/add", formData);
      return res.data;
    },
  });
}; 