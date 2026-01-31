import { useQuery } from "@tanstack/react-query";
import { api } from "../api-interceptor";

// Shared type for selector options
export interface SearchTopicResponse {
  data: {
    createdAt: string;
    name: string;
    name_hi: string;
    updatedAt: string;
    _id: string;
  }[];
}

// Search Topics with query string
export const useSearchTopics = (searchTerm: string) => {
  return useQuery<SearchTopicResponse>({
    queryKey: ["search-topics", searchTerm],
    queryFn: async () => {
      const response = await api.get(
        `/topic/search?name=${encodeURIComponent(searchTerm)}`
      );
      return response.data;
    },
    enabled: !!searchTerm || searchTerm === "",
    staleTime: 5 * 60 * 1000,
    retry: (failureCount) => failureCount < 1,
    refetchOnWindowFocus: false,
  });
};
