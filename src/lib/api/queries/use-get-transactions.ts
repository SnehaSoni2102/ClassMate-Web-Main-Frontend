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
}

export interface Group {
  groupId: string;
  duration?: number;
  _id: string;
}

export interface Category {
  categoryId: string;
  duration: number;
  _id: string;
}

export interface GroupUser {
  userId: string;
  duration: number;
  _id: string;
}

export interface Notes {
  key1: string;
}

export interface Transaction {
  _id: string;
  user?: string | User; // Can be string (user ID) or User object
  amount: number;
  status: string; // PAID, CREATED, etc.
  senderMode?: string;
  senderDetails?: User;
  currency: string;
  description: string;
  group?: Group;
  categories?: Category[];
  groupUsers?: GroupUser[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  notes?: Notes;
  orderCreatedAt?: number;
  razorpay_order?: string;
  receipt?: string;
  mode?: string;
  paymentVerifiedAt?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
}

export interface GetTransactionsResponse {
  message: string;
  data: Transaction[];
  success: boolean;
}

export const useGetTransactions = () => {
  return useQuery<GetTransactionsResponse>({
    queryKey: ["get-transactions"],
    queryFn: async () => {
      const response = await api.get(`/transaction/all/admin`);
      return response.data;
    },
    retry: (failureCount) => failureCount < 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};
