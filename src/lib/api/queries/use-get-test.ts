import { api } from "../api-interceptor";
import { useQuery } from "@tanstack/react-query";

export interface TestSectionQuestion {
  _id: string;
  image?: string;
  question: string;
  question_hi: string;
  options: string[];
  options_hi: string[];
  correctAnswers: string[];
  correctAnswers_hi: string[];
  positiveMarking: number;
  negativeMarking: number;
  multipleSelection: boolean;
}

export interface TestSection {
  _id: string;
  name: string;
  name_hi: string;
  order: number;
  timeLimit: number;
  questions: string[]; // Array of question IDs, not question objects
}

export interface Test {
  status: string;
  startDate: string | null;
  startTime: string;
  endDate: string | null;
  endTime: string;
  _id: string;
  title: string;
  title_hi: string;
  totalQuestions: number;
  totalSections: number;
  durationInMinutes: number; // Backend stores minutes*60; divide by 60 when displaying
  totalMarks: number;
  marksPerQuestion: number;
  negativeMarks: number;
  description: string;
  description_hi: string;
  languageOptions: string[];
  type: "mock" | "live";
  sections: TestSection[];
  createdAt: string;
  updatedAt: string;
  testType?: "free" | "paid";
  exam?: {
    _id: string;
    name: string;
    name_hi: string;
  };
  user?: any; // User object
}

export type GetTestResponse = {
  message: string;
  data: Test;
  success: boolean;
};

export const useGetTest = (id: string) => {
  return useQuery<GetTestResponse>({
    queryKey: ["get-test", id],
    queryFn: async () => {
      const response = await api.get(`/test/admin/${id}`);
      return response.data;
    },
    retry: (failureCount) => failureCount < 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: !!id,
  });
}; 