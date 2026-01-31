import { useMutation } from "@tanstack/react-query";
import { api } from "../api-interceptor";

export interface GroupPriceInput {
  duration: number;
  price: number;
}

export const useUpdateGroupPrices = () => {
  return useMutation({
    mutationKey: ["update-group-prices"],
    mutationFn: async ({ groupId, pricePerStudent }: { groupId: string; pricePerStudent: GroupPriceInput[] }) => {
      const response = await api.patch(`/group/${groupId}/update-price`, { pricePerStudent });
      return response.data;
    },
  });
};


