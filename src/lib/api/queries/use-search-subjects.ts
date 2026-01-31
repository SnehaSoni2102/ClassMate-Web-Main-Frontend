import { api } from "../api-interceptor";
import { useQuery } from "@tanstack/react-query";

export interface Subject {
  _id: string;
  name: string;
  name_hi?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface SearchSubjectResponse {
  message: string;
  data: Subject[];
  success: boolean;
}

// Search Subjects with query string
export const useSearchSubjects = (searchTerm: string) => {
  return useQuery<SearchSubjectResponse>({
    queryKey: ["search-subjects", searchTerm],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (searchTerm) {
        queryParams.append("searchTerm", searchTerm);
      }
      const response = await api.get(`/subject/search?${queryParams.toString()}`);
      return response.data;
    },
  });
};
