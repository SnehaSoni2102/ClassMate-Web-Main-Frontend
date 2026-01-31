import { useMutation } from "@tanstack/react-query";
import { api } from "../api-interceptor";

interface UpdateExamRequest {
  name?: string;
  name_hi?: string;
  logo?: File | string;
}

export const useUpdateExam = () => {
  return useMutation({
    mutationKey: ["update-exam"],
    mutationFn: async ({ id, data }: { id: string; data: UpdateExamRequest }) => {
      let body: FormData | UpdateExamRequest = data;
      if (data.logo && data.logo instanceof File) {
        body = new FormData();
        if (data.name) (body as FormData).append("name", data.name);
        if (data.name_hi) (body as FormData).append("name_hi", data.name_hi);
        (body as FormData).append("logo", data.logo);
      }
      const response = await api.patch(`/exam/update/${id}`, body);
      return response.data;
    },
  });
}; 