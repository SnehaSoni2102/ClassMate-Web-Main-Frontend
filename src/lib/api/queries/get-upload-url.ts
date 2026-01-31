import { api } from "../api-interceptor";

export const getUploadUrl = async (contentType: string) => {
  const response = await api.get<{ url: string; key: string }>(
    `/question/upload-url`,
    {
      params: { contentType },
    }
  );
  return response.data;
};
