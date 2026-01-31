import { useMutation } from "@tanstack/react-query";
import { api } from "../api-interceptor";

export interface GroupPriceInput {
  duration: number;
  price: number;
}

export const useUpdateAllGroupPrices = () => {
  return useMutation({
    mutationKey: ["update-all-group-prices"],
    mutationFn: async (pricePerStudent: GroupPriceInput[]) => {
      const response = await api.patch("/group/update-price/all", { pricePerStudent });
      return response.data;
    },
  });
};


