import { useMutation } from "@tanstack/react-query";
import { api } from "../api-interceptor";

export const useUpdateTest = () => {
  return useMutation({
    mutationKey: ["update-test"],
    mutationFn: async ({ id, body }: { id: string; body: any }) => {
      const res = await api.patch(`/test/update/${id}`, body);
      return res.data;
    },
  });
}; 