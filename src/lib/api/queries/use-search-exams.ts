import { useQuery } from "@tanstack/react-query";
import { api } from "../api-interceptor";

// Shared type for selector options
export interface SearchExamResponse {
  data: {
    createdAt: string;
    logo: string;
    name: string;
    name_hi: string;
    updatedAt: string;
    _id: string;
  }[];
}

// Search Exams with query string
export const useSearchExams = (searchTerm: string) => {
  return useQuery<SearchExamResponse>({
    queryKey: ["search-exams", searchTerm],
    queryFn: async () => {
      const response = await api.get(
        `/exam/search?name=${encodeURIComponent(searchTerm)}`
      );
      return response.data;
    },
    enabled: !!searchTerm || searchTerm === "",
    staleTime: 5 * 60 * 1000,
    retry: (failureCount) => failureCount < 1,
    refetchOnWindowFocus: false,
  });
};
