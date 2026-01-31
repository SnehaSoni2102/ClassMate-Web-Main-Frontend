import { api } from "../api-interceptor";
import { useQuery } from "@tanstack/react-query";

export interface SearchTestItem {
  _id: string;
  title: string;
}

export interface SearchTestResponse {
  data: {
    tests: SearchTestItem[];
    pagination?: {
      limit: number;
      page: number;
      total: number;
      totalPages: number;
    };
  };
}

export const useSearchTests = (searchTerm: string) => {
  return useQuery<SearchTestResponse>({
    queryKey: ["search-tests", searchTerm],
    queryFn: async () => {
      const url = `/test/search?query=${encodeURIComponent(searchTerm)}&page=1&limit=10`;
      const response = await api.get(url);
      return response.data;
    },
    enabled: !!searchTerm || searchTerm === "",
    staleTime: 5 * 60 * 1000,
    retry: (failureCount) => failureCount < 1,
    refetchOnWindowFocus: false,
  });
};


