import { api } from "../api-interceptor";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

export interface NoticeBoardPayload {
  header: string;
  description: string;
  link: string;
}

export interface AddNoticeBoardResponse {
  message: string;
  data: {
    _id: string;
    user: string;
    header: string;
    description: string;
    link?: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  success: boolean;
}

export interface UpdateNoticeBoardResponse {
  message: string;
  data: {
    _id: string;
    user: string;
    header: string;
    description: string;
    link?: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  success: boolean;
}

export interface DeleteNoticeBoardResponse {
  message: string;
  success: boolean;
}

// Add Notice Board Mutation
export const useAddNoticeBoard = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<AddNoticeBoardResponse, Error, NoticeBoardPayload>({
    mutationFn: async (payload) => {
      const response = await api.post(`/notice-board/add`, payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["get-notice-boards"] });
      toast({
        title: "Success",
        description: data.message || "Notice board added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add notice board",
        variant: "destructive",
      });
    },
  });
};

// Update Notice Board Mutation
export const useUpdateNoticeBoard = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<UpdateNoticeBoardResponse, Error, { id: string; payload: NoticeBoardPayload }>({
    mutationFn: async ({ id, payload }) => {
      const response = await api.patch(`/notice-board/update/${id}`, payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["get-notice-boards"] });
      queryClient.invalidateQueries({ queryKey: ["get-notice-board", data.data._id] });
      toast({
        title: "Success",
        description: data.message || "Notice board updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update notice board",
        variant: "destructive",
      });
    },
  });
};

// Delete Notice Board Mutation
export const useDeleteNoticeBoard = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<DeleteNoticeBoardResponse, Error, string>({
    mutationFn: async (id) => {
      const response = await api.delete(`/notice-board/delete/${id}`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["get-notice-boards"] });
      toast({
        title: "Success",
        description: data.message || "Notice board deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete notice board",
        variant: "destructive",
      });
    },
  });
};
