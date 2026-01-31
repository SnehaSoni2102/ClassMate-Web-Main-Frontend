import { useMutation } from "@tanstack/react-query";
import { api } from "../api-interceptor";

export const useCreateTest = () => {
  return useMutation({
    mutationKey: ["create-test"],
    mutationFn: async (body: any) => {
      const res = await api.post("/test/create", body);
      return res.data;
    },
  });
}; 