import { api } from "../api-interceptor";
import { useQuery } from "@tanstack/react-query";

export interface NoticeBoard {
  _id: string;
  user: string;
  header: string;
  description: string;
  link: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface GetNoticeBoardResponse {
  message: string;
  data: NoticeBoard;
  success: boolean;
}

export const useGetNoticeBoard = (id: string) => {
  return useQuery<GetNoticeBoardResponse>({
    queryKey: ["get-notice-board", id],
    queryFn: async () => {
      const response = await api.get(`/notice-board/${id}`);
      return response.data;
    },
    enabled: !!id,
    retry: (failureCount) => failureCount < 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};
