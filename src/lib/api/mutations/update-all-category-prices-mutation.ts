import { useMutation } from "@tanstack/react-query";
import { api } from "../api-interceptor";

export interface PricingPlanInput {
  duration: number;
  price: number;
}

export const useUpdateAllCategoryPrices = () => {
  return useMutation({
    mutationKey: ["update-all-category-prices"],
    mutationFn: async (pricingPlans: PricingPlanInput[]) => {
      const response = await api.patch("/category/update-all-prices", {
        pricingPlans,
      });
      return response.data;
    },
  });
};


