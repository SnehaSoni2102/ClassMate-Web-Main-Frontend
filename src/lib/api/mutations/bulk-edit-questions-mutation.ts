import { useMutation } from "@tanstack/react-query";
import { api } from "../api-interceptor";

export const useBulkEditQuestions = () => {
  return useMutation({
    mutationKey: ["bulk-edit-questions"],
    mutationFn: async (formData: FormData) => {
      const response = await api.post("/question/bulk-edit", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
  });
};
