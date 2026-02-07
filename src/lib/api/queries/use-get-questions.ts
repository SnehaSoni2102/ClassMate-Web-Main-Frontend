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
  topics: string[];
  subject: {
    createdAt: string;
    name: string;
    updatedAt: string;
    _id: string;
  }[];
  class: string[];
  Exams: string[];
  solution: string;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  image?: string; // can be empty string as well
  serial_no?: string; // optional serial number
  __v: number;
}

// API Success Response Type
export type GetQuestionsResponse = {
  data: {
    pagination: {
      limit: number;
      page: number;
      total: number;
      totalPages: number;
    };
    questions: Question[];
  };
};

export const useGetQuestions = ({
  questionType,
  searchTerm,
  page,
  limit = 12,
  examIds,
  classIds,
  topicIds,
  subjectIds,
}: {
  questionType?: "single" | "multiple" | "all";
  searchTerm?: string;
  page: number;
  limit?: number;
  examIds?: string[];
  classIds?: string[];
  topicIds?: string[];
  subjectIds?: string[];
}) => {
  return useQuery<GetQuestionsResponse>({
    queryKey: ["get-questions", searchTerm, questionType, page, limit, examIds, classIds, topicIds, subjectIds], // ✅ important for cache & invalidation
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());

      if (questionType) {
        queryParams.append("questionType", questionType);
      }
      if (searchTerm) {
        queryParams.append("searchTerm", searchTerm);
      }
      if (examIds) {
        examIds.forEach((id) => queryParams.append("examIds", id));
      }
      if (classIds) {
        classIds.forEach((id) => queryParams.append("classIds", id));
      }
      if (topicIds) {
        topicIds.forEach((id) => queryParams.append("topicIds", id));
      }
      if (subjectIds) {
        subjectIds.forEach((id) => queryParams.append("subjectIds", id));
      }

      const response = await api.get(
        `/question/search?${queryParams.toString()}`
      );
      return response.data;
    },
    retry: (failureCount) => failureCount < 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};
