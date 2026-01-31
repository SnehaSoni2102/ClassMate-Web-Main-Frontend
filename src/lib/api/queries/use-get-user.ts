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

export interface GetUserResponse {
  message: string;
  success: boolean;
  data: User;
}

export const useGetUser = (userId: string) => {
  return useQuery<GetUserResponse>({
    queryKey: ["get-user", userId],
    queryFn: async () => {
      const response = await api.get(`/users/one/${userId}`);
      return response.data;
    },
    enabled: !!userId,
    retry: (failureCount) => failureCount < 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}; 