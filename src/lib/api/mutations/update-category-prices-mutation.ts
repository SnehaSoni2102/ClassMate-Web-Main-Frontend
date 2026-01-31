import { useMutation } from "@tanstack/react-query";
import { api } from "../api-interceptor";

export interface PricingPlanInput {
  duration: number;
  price: number;
}

export const useUpdateCategoryPrices = () => {
  return useMutation({
    mutationKey: ["update-category-prices"],
    mutationFn: async ({ categoryId, pricingPlans }: { categoryId: string; pricingPlans: PricingPlanInput[] }) => {
      const response = await api.patch(`/category/update-price/${categoryId}`, {
        pricingPlans,
      });
      return response.data;
    },
  });
};


