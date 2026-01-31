import { useQuery } from "@tanstack/react-query";
import { api } from "../api-interceptor";

// Shared type for selector options
export interface SearchClassResponse {
  data: {
    createdAt: string;
    name: string;
    updatedAt: string;
    _id: string;
  }[];
}

// Search Classes with query string
export const useSearchClasses = (searchTerm: string) => {
  return useQuery<SearchClassResponse>({
    queryKey: ["search-classes", searchTerm],
    queryFn: async () => {
      const response = await api.get(
        `/class/search?name=${encodeURIComponent(searchTerm)}`
      );
      return response.data;
    },
    enabled: !!searchTerm || searchTerm === "",
    staleTime: 5 * 60 * 1000,
    retry: (failureCount) => failureCount < 1,
    refetchOnWindowFocus: false,
  });
};
