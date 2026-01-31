import { api } from "../api-interceptor";
import { useQuery } from "@tanstack/react-query";

export interface Admin {
  name: string;
  phone: string;
  image?: string;
}

export interface Group {
  _id: string;
  title: string;
  logo?: string;
  group_type?: string;
  membersCount: number;
  pricePerStudent?: { price: number; duration: number; _id?: string }[];
  admin: Admin;
}

export interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetGroupsResponse {
  message: string;
  success: boolean;
  data: Group[];
  meta: Meta;
}

export const useGetGroups = ({
  page = 1,
  limit = 10,
  searchTerm,
}: {
  page?: number;
  limit?: number;
  searchTerm?: string;
}) => {
  return useQuery<GetGroupsResponse>({
    queryKey: ["get-groups", page, limit, searchTerm],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());

      if (searchTerm) {
        queryParams.append("search", searchTerm);
      }

      const response = await api.get(`/group/fetch-all-groups?${queryParams.toString()}`);
      return response.data;
    },
    retry: (failureCount) => failureCount < 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}; 