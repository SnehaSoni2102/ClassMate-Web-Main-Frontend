import { useMutation } from "@tanstack/react-query";
import { api } from "../api-interceptor";

interface CreateSubjectRequest {
  name: string;
  name_hi: string;
}

export function useCreateSubject() {
  return useMutation({
    mutationKey: ["create-subject"],
    mutationFn: async (data: CreateSubjectRequest) => {
      const response = await api.post("/subject/add", data);
      return response.data;
    },
  });
} 