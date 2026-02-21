import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Auth Pages
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Dashboard Pages
import Dashboard from "./pages/dashboard/Dashboard";
import UsersPage from "./pages/users/UsersPage";
import UserDetail from "./pages/users/UserDetail";
import GroupsPage from "./pages/groups/GroupsPage";
import GroupDetail from "./pages/groups/GroupDetail";

// Test Management Pages
import TestsPage from "./pages/tests/TestsPage";
import TestDetail from "./pages/tests/TestDetail";
import CreateTest from "./pages/tests/CreateTest";
import CreateAllIndiaTest from "./pages/tests/CreateAllIndiaTest";
import EditTest from "./pages/tests/EditTest";
import TestPreview from "./pages/tests/TestPreview";

// Quiz Management Pages
import QuizzesPage from "./pages/quizzes/QuizzesPage";
import CreateQuiz from "./pages/quizzes/CreateQuiz";
import QuizDetail from "./pages/quizzes/QuizDetail";
import EditQuiz from "./pages/quizzes/EditQuiz";
import QuizPreview from "./pages/quizzes/QuizPreview";

// Question Management Pages
import QuestionsPage from "./pages/questions/QuestionsPage";
import QuestionDetail from "./pages/questions/QuestionDetail";
import CreateQuestion from "./pages/questions/CreateQuestion";
import EditQuestion from "./pages/questions/EditQuestion";
import ReportedQuestions from "./pages/questions/ReportedQuestions";

// Exam Management Pages
import ExamsPage from "./pages/exams/ExamsPage";
import ExamDetail from "./pages/exams/ExamDetail";

// import EditExam from "./pages/exams/EditExam";

// Topic Pages
import TopicsPage from "@/pages/topics/TopicsPage";
import TopicDetail from "@/pages/topics/TopicDetails";
import CreateTopic from "@/pages/topics/CreateTopic";

// Subject Pages
import SubjectsPage from "@/pages/subjects/SubjectsPage";
import SubjectDetail from "@/pages/subjects/SubjectDetails";
import CreateSubject from "@/pages/subjects/CreateSubject";

// Class Pages
import ClassesPage from "@/pages/classes/ClassesPage";
import ClassDetail from "@/pages/classes/ClassDetails";
import CreateClass from "@/pages/classes/CreateClass";


// Transaction Pages
import TransactionsPage from "./pages/transactions/TransactionsPage";
import TransactionDetail from "./pages/transactions/TransactionDetail";

// Support Pages
import SupportPage from "./pages/support/SupportPage";
import SupportTicketDetail from "./pages/support/SupportTicketDetail";

// Notice Board Pages
import NoticeBoardPage from "./pages/notice-board/NoticeBoardPage";
import NoticeBoardDetail from "./pages/notice-board/NoticeBoardDetail";

// Not Found
import NotFound from "./pages/NotFound";
import CategoriesPage from "./pages/categories/CategoriesPage";
import CategoryDetail from "./pages/categories/CategoryDetail";
import { MathJaxProvider } from "./math/MathJaxProvider";

// Move QueryClient creation inside the component
const App = () => {
  // Create a client
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <MathJaxProvider>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Auth Routes */}
                <Route path="/auth/login" element={<Login />} />
                <Route
                  path="/auth/forgot-password"
                  element={<ForgotPassword />}
                />
                <Route path="/auth/reset-password" element={<ResetPassword />} />

                {/* Protected Dashboard Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <UsersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users/:id"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <UserDetail />
                    </ProtectedRoute>
                  }
                />

                {/* Groups Routes */}
                <Route
                  path="/groups"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <GroupsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/groups/:id"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <GroupDetail />
                    </ProtectedRoute>
                  }
                />

                {/* Tests Routes */}
                <Route
                  path="/tests"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <TestsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tests/create"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <CreateTest />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tests/create-all-india"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <CreateAllIndiaTest />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tests/:id"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <TestDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tests/:id/preview"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <TestPreview />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tests/:id/edit"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <EditTest />
                    </ProtectedRoute>
                  }
                />

                {/* Quizzes Routes */}
                <Route
                  path="/quizzes"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <QuizzesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/quizzes/create"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <CreateQuiz />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/quizzes/:id/edit"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <EditQuiz />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/quizzes/:id/preview"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <QuizPreview />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/quizzes/:id"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <QuizDetail />
                    </ProtectedRoute>
                  }
                />

                {/* Questions Routes */}
                <Route
                  path="/questions"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <QuestionsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/questions/create"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <CreateQuestion />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reported-questions"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <ReportedQuestions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/questions/:id"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <QuestionDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/questions/:id/edit"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <EditQuestion />
                    </ProtectedRoute>
                  }
                />

                {/* Exams Routes */}
                <Route
                  path="/exams"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <ExamsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/exams/:id"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <ExamDetail />
                    </ProtectedRoute>
                  }
                />
                {/* Topics Routes */}

                <Route
                  path="/topics"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <TopicsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/topics/:id"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <TopicDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/topics/create"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <CreateTopic />
                    </ProtectedRoute>
                  }
                />

                {/* Subject Routes */}
                <Route
                  path="/subjects"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <SubjectsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/subjects/:id"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <SubjectDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/subjects/create"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <CreateSubject />
                    </ProtectedRoute>
                  }
                />

                {/* Class Routes */}
                <Route
                  path="/classes"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <ClassesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/classes/:id"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <ClassDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/classes/create"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <CreateClass />
                    </ProtectedRoute>
                  }
                />

                {/* Transactions Routes */}
                <Route
                  path="/transactions"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <TransactionsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/transactions/:id"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <TransactionDetail />
                    </ProtectedRoute>
                  }
                />

                {/* Support Routes */}
                <Route
                  path="/support"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <SupportPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/support/:id"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <SupportTicketDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notice-board"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <NoticeBoardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notice-board/:id"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <NoticeBoardDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/categories"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <CategoriesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/categories/:id"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                      <CategoryDetail />
                    </ProtectedRoute>
                  }
                />
                {/* Redirect root to dashboard or login */}
                <Route path="/" element={<Navigate replace to="/dashboard" />} />

                {/* 404 Page */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </MathJaxProvider>
    </QueryClientProvider>
  );
};

export default App;
