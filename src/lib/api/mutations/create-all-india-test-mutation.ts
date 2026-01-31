import { useMutation } from "@tanstack/react-query";
import { api } from "../api-interceptor";

export const useCreateAllIndiaTest = () => {
  return useMutation({
    mutationKey: ["create-all-india-test"],
    mutationFn: async (body: any) => {
      const res = await api.post("/test/create-all-india", body);
      return res.data;
    },
  });
}; 