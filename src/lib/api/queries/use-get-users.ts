import { api } from "../api-interceptor";
import { useQuery } from "@tanstack/react-query";

export interface User {
  _id: string;
  role: string;
  isOnBoardingCompleted: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  profilePicture?: string;
  status?: string;
  Name?: string;
  email?: string;
  phoneNumber?: string;
}

export interface Meta {
  totalUsers: number;
  currentPage: number;
  totalPages: number;
  perPage: number;
}

export interface GetUsersResponse {
  message: string;
  success: boolean;
  data: User[];
  meta: Meta;
}

export const useGetUsers = ({
  page = 1,
  limit = 10,
  searchTerm,
}: {
  page?: number;
  limit?: number;
  searchTerm?: string;
}) => {
  return useQuery<GetUsersResponse>({
    queryKey: ["get-users", page, limit, searchTerm],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());

      if (searchTerm) {
        queryParams.append("searchTerm", searchTerm);
      }

      const response = await api.get(`/users/all?${queryParams.toString()}`);
      return response.data;
    },
    retry: (failureCount) => failureCount < 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}; 