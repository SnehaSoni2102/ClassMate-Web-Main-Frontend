import { useMutation } from "@tanstack/react-query";
import { api } from "../api-interceptor";

export const useBulkUploadQuestions = () => {
  return useMutation({
    mutationKey: ["bulk-upload-questions"],
    mutationFn: async (formData: FormData) => {
      const response = await api.post("/question/bulk-upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
  });
}; 