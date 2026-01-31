import { useMutation } from "@tanstack/react-query";
import { api } from "../api-interceptor";

export const useCreateBanner = () => {
  return useMutation({
    mutationKey: ["create-banner"],
    mutationFn: async (formData: FormData) => {
      const response = await api.post("/banner/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
  });
};


