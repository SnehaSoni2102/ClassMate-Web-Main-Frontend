import { useQuery } from "@tanstack/react-query";
import { api } from "../api-interceptor";

export interface Exam {
  _id: string;
  name: string;
  name_hi: string;
  logo: string;
  createdAt: string;
  updatedAt: string;
}

interface GetExamResponse {
  message: string;
  data: Exam;
  success: boolean;
}

export const useGetExam = (id: string) => {
  return useQuery<GetExamResponse>({
    queryKey: ["get-exam", id],
    queryFn: async () => {
      const response = await api.get(`/exam/one/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}; 