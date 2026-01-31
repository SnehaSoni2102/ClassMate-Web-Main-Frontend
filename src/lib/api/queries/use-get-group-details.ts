import { api } from "../api-interceptor";
import { useQuery } from "@tanstack/react-query";

export interface Admin {
  name: string;
  image?: string;
}

export interface Member {
  name: string;
  image?: string;
  role: string;
}

export interface Test {
  name: string;
  name_hi: string;
  totalQuestions: number;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  totalMarks: number;
  duration: number;
}

export interface GroupDetails {
  _id: string;
  title: string;
  description: string;
  logo?: string;
  createdBy: string;
  group_type?: string;
  pricePerStudent?: { price: number; duration: number; _id?: string }[];
  admin: Admin;
  members: Member[];
  tests: Test[];
}

export interface GetGroupDetailsResponse {
  message: string;
  success: boolean;
  data: GroupDetails;
}

export const useGetGroupDetails = (groupId: string) => {
  return useQuery<GetGroupDetailsResponse>({
    queryKey: ["get-group-details", groupId],
    queryFn: async () => {
      const response = await api.get(`/group/${groupId}/details`);
      return response.data;
    },
    enabled: !!groupId,
    retry: (failureCount) => failureCount < 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}; 