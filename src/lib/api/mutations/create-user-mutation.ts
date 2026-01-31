import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api-interceptor";
import { useToast } from "@/components/ui/use-toast";

export interface CreateUserPayload {
  phoneNumber: string;
  role: "admin" | "superadmin";
  Name: string;
  email: string;
  password: string;
}

export interface CreateUserResponse {
  message: string;
  success: boolean;
  data?: unknown;
}

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<CreateUserResponse, Error, CreateUserPayload>({
    mutationKey: ["create-user"],
    mutationFn: async (payload) => {
      const response = await api.post("/users/add", payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["get-users"] });
      toast({
        title: "Success",
        description: data.message || "User created successfully",
      });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast({
        title: "Error",
        description: err.response?.data?.message || err.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });
};
