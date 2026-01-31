import { useQuery } from "@tanstack/react-query";
import { api } from "../api-interceptor";

export interface TopCategory {
  _id: string;
  name: string;
  name_hi: string;
  logo: string;
  description?: string;
  description_hi?: string;
  createdAt: string;
  updatedAt: string;
  price?: number;
  pricingPlans?: { duration: number; price: number; _id?: string }[];
}

export type GetTopCategoriesResponse = {
  data: TopCategory[];
};

export const useGetTopCategories = () => {
  return useQuery<GetTopCategoriesResponse>({
    queryKey: ["get-top-categories"],
    queryFn: async () => {
      const response = await api.get(
        `/category/top-level`
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: (failureCount) => failureCount < 1,
    refetchOnWindowFocus: false,
  });
}; 