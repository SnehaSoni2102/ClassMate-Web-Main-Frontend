import { api } from "../api-interceptor";
import { useQuery } from "@tanstack/react-query";

// Test type based on API response
export interface Test {
  _id: string;
  user: string;
  title: string;
  totalQuestions: number;
  totalSections: number;
  durationInMinutes: number;
  totalMarks: number;
  marksPerQuestion: number;
  negativeMarks: number;
  description: string;
  languageOptions: string[];
  sections: any[];
  createdAt: string;
  updatedAt: string;
  type?: "mock" | "live";
  __v: number;
}

export type GetTestsResponse = {
  data: {
    pagination: {
      limit: number;
      page: number;
      total: number;
      totalPages: number;
    };
    tests: Test[];
  };
};

export const useGetTests = ({
  searchTerm,
  page,
  type = "all",
  limit = 12,
}: {
  searchTerm: string;
  page: number;
  type?: "all" | "mock" | "live";
  limit?: number;
}) => {
  return useQuery<GetTestsResponse>({
    queryKey: ["get-tests", searchTerm, type, page, limit],
    queryFn: async () => {
      let url = `/test/search?query=${encodeURIComponent(searchTerm)}&page=${page}&limit=${limit}`;
      if (type && type !== "all") {
        url += `&type=${type}`;
      }
      const response = await api.get(url);
      return response.data;
    },
    retry: (failureCount) => failureCount < 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};
