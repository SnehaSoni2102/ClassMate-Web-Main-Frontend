import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api-interceptor";

interface UpdateFreeTrialRequest {
  days: number;
  isActive: boolean;
}

export const useUpdateFreeTrial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update-free-trial"],
    mutationFn: async ({ trialId, days }: { trialId: string; days: number }) => {
      const response = await api.patch(`/users/update-trail/${trialId}`, {
        days,
        isActive: true, // Always keep active
      } as UpdateFreeTrialRequest);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-free-trial"] });
    },
  });
};
