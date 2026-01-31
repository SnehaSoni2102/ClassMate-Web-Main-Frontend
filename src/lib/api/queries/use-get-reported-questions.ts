import { api } from "../api-interceptor";
import { useQuery } from "@tanstack/react-query";

export interface User {
  _id: string;
  phoneNumber: string;
  role: string;
  isOnBoardingCompleted: boolean;
  lastLogin: string;
  submittedTests: string[];
  status: string;
  categories: string[];
  exams: string[];
  myGroups: string[];
  invitedGroups: string[];
  requestedToJoinGroups: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  Name?: string;
  email?: string;
  profilePicture?: string;
}

export interface ReportedQuestion {
  _id: string;
  user: User;
  question: string; // Question ID
  answer: string[]; // Array of report reasons
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface GetReportedQuestionsResponse {
  message: string;
  data: ReportedQuestion[];
  success: boolean;
}

export const useGetReportedQuestions = () => {
  return useQuery<GetReportedQuestionsResponse>({
    queryKey: ["get-reported-questions"],
    queryFn: async () => {
      const response = await api.get(`/report-question/all`);
      return response.data;
    },
    retry: (failureCount) => failureCount < 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};
