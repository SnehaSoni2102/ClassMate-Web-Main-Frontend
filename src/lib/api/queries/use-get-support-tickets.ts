import { api } from "../api-interceptor";
import { useQuery } from "@tanstack/react-query";
import { User } from "./use-get-user";

export interface SupportTicket {
  _id: string;
  user: User;
  category: "general" | "technical" | "billing";
  issue: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface GetSupportTicketsResponse {
  message: string;
  data: SupportTicket[];
}

export const useGetSupportTickets = () => {
  return useQuery<GetSupportTicketsResponse>({
    queryKey: ["get-support-tickets"],
    queryFn: async () => {
      const response = await api.get(`/help-support/fetch-query`);
      return response.data;
    },
    retry: (failureCount) => failureCount < 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};
