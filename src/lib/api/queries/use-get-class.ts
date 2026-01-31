import { useQuery } from "@tanstack/react-query";
import { api } from "../api-interceptor";

export interface Class {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface GetClassResponse {
  message: string;
  data: Class;
  success: boolean;
}

export const useGetClass = (id: string) => {
  return useQuery<GetClassResponse>({
    queryKey: ["class", id],
    queryFn: async () => {
      const response = await api.get(`/class/one/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}; 