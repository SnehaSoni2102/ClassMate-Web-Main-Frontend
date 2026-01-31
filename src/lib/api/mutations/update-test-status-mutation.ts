import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api-interceptor";
import { useToast } from "@/components/ui/use-toast";

export const useUpdateTestStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationKey: ["update-test-status"],
    mutationFn: async ({ testId, status }: { testId: string; status: 'published' | 'in-progress' }) => {
      const res = await api.patch(`/test/status/${testId}`, { status });
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["get-test", variables.testId] });
      toast({
        title: "Success",
        description: `Test status updated to ${variables.status}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update test status",
        variant: "destructive",
      });
    },
  });
}; 