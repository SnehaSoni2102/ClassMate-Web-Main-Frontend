import { useQuery } from "@tanstack/react-query";
import { api } from "../api-interceptor";

export interface Topic {
  _id: string;
  name: string;
  name_hi: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface GetTopicResponse {
  message: string;
  data: Topic;
  success: boolean;
}

export const useGetTopic = (id: string) => {
  return useQuery<GetTopicResponse>({
    queryKey: ["get-topic", id],
    queryFn: async () => {
      const response = await api.get(`/topic/one/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}; 