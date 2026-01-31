import { api } from "../api-interceptor";
import { useQuery } from "@tanstack/react-query";

export interface FreeTrialData {
  _id: string;
  createdBy: string;
  days: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface GetFreeTrialResponse {
  message: string;
  data: FreeTrialData[];
  success: boolean;
}

export const useGetFreeTrial = () => {
  return useQuery<GetFreeTrialResponse>({
    queryKey: ["get-free-trial"],
    queryFn: async () => {
      const response = await api.get(`/users/free-trial/all`);
      return response.data;
    },
    retry: (failureCount) => failureCount < 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};
