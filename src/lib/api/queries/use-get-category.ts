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

export interface Category {
  _id: string;
  name: string;
  name_hi: string;
  logo: string;
  exams: Exam[];
  createdAt: string;
  updatedAt: string;
}

interface GetCategoryResponse {
  message: string;
  data: Category;
  success: boolean;
}

export const useGetCategory = (id: string) => {
  return useQuery<GetCategoryResponse>({
    queryKey: ["get-category", id],
    queryFn: async () => {
      const response = await api.get(`/category/one/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}; 