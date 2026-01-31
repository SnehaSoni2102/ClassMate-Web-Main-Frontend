import { api } from "../api-interceptor";
import { useQuery } from "@tanstack/react-query";

// types.ts or wherever you define your types
export interface Question {
  _id: string;
  text: string;
  text_hi: string;
  options: string[];
  options_hi: string[];
  correctAnswers: string[];
  correctAnswers_hi: string[];
  marks: number;
  negativeMarks: number;
  isTwoOptions: boolean;
  topics: {
    createdAt: string;
    name: string;
    updatedAt: string;
    _id: string;
  }[];
  subject: {
    createdAt: string;
    name: string;
    updatedAt: string;
    _id: string;
  }[];
  class: {
    createdAt: string;
    name: string;
    updatedAt: string;
    _id: string;
  }[];
  Exams: {
    createdAt: string;
    logo: string;
    name: string;
    updatedAt: string;
    _id: string;
  }[];
  solution: string;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  image?: string;
  serial_no?: string; // optional serial number
  __v: number;
}

// API Success Response Type
export type GetQuestion = { data: Question };

export const useGetQuestion = (id: string) => {
  return useQuery<GetQuestion>({
    queryKey: ["get-question", id], // ✅ important for cache & invalidation
    queryFn: async () => {
      const response = await api.get(`/question/admin/${id}`);
      return response.data;
    },
    retry: (failureCount) => failureCount < 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};
