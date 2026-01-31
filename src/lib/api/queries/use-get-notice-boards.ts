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

export interface GetNoticeBoardsResponse {
  message: string;
  data: NoticeBoard[];
  success: boolean;
}

export const useGetNoticeBoards = () => {
  return useQuery<GetNoticeBoardsResponse>({
    queryKey: ["get-notice-boards"],
    queryFn: async () => {
      const response = await api.get(`/notice-board/fetchAll`);
      return response.data;
    },
    retry: (failureCount) => failureCount < 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};
