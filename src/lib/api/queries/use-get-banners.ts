import { api } from "../api-interceptor";
import { useQuery } from "@tanstack/react-query";

export interface BannerItem {
  _id: string;
  image: string;
  type: "test" | "payment" | "other";
  testId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetBannersResponse {
  message: string;
  data: BannerItem[];
  success: boolean;
}

export const useGetBanners = () => {
  return useQuery<GetBannersResponse>({
    queryKey: ["get-banners"],
    queryFn: async () => {
      const response = await api.get(`/banner/all`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: (failureCount) => failureCount < 1,
    refetchOnWindowFocus: false,
  });
};


