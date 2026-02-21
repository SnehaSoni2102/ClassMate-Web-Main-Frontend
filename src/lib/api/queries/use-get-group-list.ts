import { api } from "../api-interceptor";
import { useQuery } from "@tanstack/react-query";

export interface GroupListItem {
  id: string;
  name: string;
}

export interface GetGroupListResponse {
  message: string;
  success: boolean;
  data: GroupListItem[];
}

export const useGetGroupList = () => {
  return useQuery<GetGroupListResponse>({
    queryKey: ["group-list"],
    queryFn: async () => {
      const response = await api.get("/group/list-all");
      return response.data;
    },
    retry: (failureCount) => failureCount < 1,
    refetchOnWindowFocus: false,
  });
};
