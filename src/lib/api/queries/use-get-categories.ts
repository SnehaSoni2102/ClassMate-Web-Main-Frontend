import { useQuery } from "@tanstack/react-query";
import { api } from "../api-interceptor";

export interface Category {
  _id: string;
  name: string;
  name_hi: string;
  logo: string;
  createdAt: string;
  updatedAt: string;
}

export type GetCategoriesResponse = {
  data: Category[];
};

export const useGetCategories = (searchTerm: string) => {
  return useQuery<GetCategoriesResponse>({
    queryKey: ["get-categories", searchTerm],
    queryFn: async () => {
      const response = await api.get(
        `/category/search${searchTerm ? `?name=${encodeURIComponent(searchTerm)}` : ''}`
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: (failureCount) => failureCount < 1,
    refetchOnWindowFocus: false,
  });
}; 