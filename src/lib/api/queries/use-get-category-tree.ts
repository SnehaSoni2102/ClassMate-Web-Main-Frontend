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

export interface CategoryTree {
  _id: string;
  name: string;
  name_hi: string;
  description?: string;
  description_hi?: string;
  logo: string;
  exams: Exam[];
  parent?: string | null;
  createdAt: string;
  updatedAt: string;
  price?: number;
  pricingPlans?: { duration: number; price: number; _id?: string }[];
  children: CategoryTree[];
}

interface GetCategoryTreeResponse {
  message: string;
  data: CategoryTree;
}

export const useGetCategoryTree = (id: string) => {
  return useQuery<GetCategoryTreeResponse>({
    queryKey: ["get-category-tree", id],
    queryFn: async () => {
      const response = await api.get(`/category/tree/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}; 