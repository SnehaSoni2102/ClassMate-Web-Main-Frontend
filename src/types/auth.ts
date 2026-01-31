
export type Role = 'admin' | 'superadmin'

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  groupCount?: number;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
}

export interface AuthContextType {
  user: {
    id: string;
    role: "admin" | "superadmin";
    name?: string; // Added name property as optional
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  adminId: string;
  admin?: User;
  managerIds: string[];
  managers?: User[];
  studentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  textEN: string;
  textHI?: string;
  type: 'single_choice' | 'multiple_choice';
  optionsEN: QuestionOption[];
  optionsHI?: QuestionOption[];
  correctOptionIds: string[];
  explanation?: {
    en?: string;
    hi?: string;
  };
  image?: string;
  topicIds?: string[];
  classIds?: string[];
  examIds?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  image?: string;
}

export interface Test {
  id: string;
  title: string;
  description?: string;
  type: 'normal' | 'live';
  questionIds: string[];
  duration: number; // in minutes
  startTime?: string; // ISO string for live tests
  endTime?: string; // ISO string for live tests
  isVisible: boolean;
  createdBy: string;
  classId?: string;
  subjectId?: string;
  examId?: string;
  groupIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Class {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Exam {
  id: string;
  name: string;
  description?: string;
  categoryId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExamCategory {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'payment' | 'refund' | 'group_fee';
  status: 'pending' | 'completed' | 'failed';
  userId: string;
  groupId?: string;
  description?: string;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}
