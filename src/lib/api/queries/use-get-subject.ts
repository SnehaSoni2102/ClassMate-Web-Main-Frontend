import { api } from "../api-interceptor";
import { useQuery } from "@tanstack/react-query";

export interface Subject {
  _id: string;
  name: string;
  name_hi: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface GetSubjectResponse {
  message: string;
  data: Subject;
  success: boolean;
}

export const useGetSubject = (id: string) => {
  return useQuery<GetSubjectResponse>({
    queryKey: ["get-subject", id],
    queryFn: async () => {
      const response = await api.get(`/subject/one/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}; 