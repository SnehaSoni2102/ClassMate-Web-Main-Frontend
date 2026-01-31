import { useMutation } from "@tanstack/react-query";
import { api } from "../api-interceptor";

interface CreateTopicRequest {
  name: string;
  name_hi: string;
}

export function useCreateTopic() {
  return useMutation({
    mutationKey: ["create-topic"],
    mutationFn: async (data: CreateTopicRequest) => {
      const response = await api.post("/topic/add", data);
      return response.data;
    },
  });
} 