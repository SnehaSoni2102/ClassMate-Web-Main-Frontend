import { useMutation } from "@tanstack/react-query";
import { api } from "../api-interceptor";

interface CreateClassRequest {
  name: string;
}

export const useCreateClass = () => {
  return useMutation({
    mutationKey: ["create-class"],
    mutationFn: async (data: CreateClassRequest) => {
      const response = await api.post("/class/add", data);
      return response.data;
    },
  });
}; 