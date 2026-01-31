import { useMutation } from "@tanstack/react-query";
import { api } from "../api-interceptor";

export const useDeleteBanner = () => {
  return useMutation({
    mutationKey: ["delete-banner"],
    mutationFn: async (bannerId: string) => {
      const response = await api.delete(`/banner/delete/${bannerId}`);
      return response.data;
    },
  });
};

