import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, MoreHorizontal, Loader2, ClipboardList, FileText, Clock, Play, Calendar, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGetQuizzes } from "@/lib/api/queries/use-get-quizzes";
import { useGetCompletedQuizzes } from "@/lib/api/queries/use-get-completed-quizzes";
import { useGetInProgressQuizzes } from "@/lib/api/queries/use-get-in-progress-quizzes";
import type { Quiz } from "@/lib/api/queries/use-get-quizzes";
import moment from "moment";

export default function QuizzesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermDebounced, setSearchTermDebounced] = useState("");

  const { data, isLoading, error } = useGetQuizzes(searchTermDebounced);
  const { data: completedData, isLoading: completedLoading, error: completedError } = useGetCompletedQuizzes();
  const { data: inProgressData, isLoading: inProgressLoading, error: inProgressError } = useGetInProgressQuizzes();

  useEffect(() => {
    const timer = setTimeout(() => setSearchTermDebounced(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const allQuizzes = data?.data ?? [];

  const formatDateTime = (dateStr: string | null | undefined, timeStr?: string) => {
    if (!dateStr) return "—";
    const d = moment(dateStr);
    if (timeStr) return d.format("DD MMM YYYY") + " " + timeStr;
    return d.format("DD MMM YYYY");
  };

  const getQuizPhase = (quiz: Quiz): "active" | "upcoming" | "completed" => {
    if (!quiz.startDate || !quiz.endDate) return "active";
    const dateStr = moment(quiz.startDate).format("YYYY-MM-DD");
    const endDateStr = moment(quiz.endDate).format("YYYY-MM-DD");
    const startMoment = moment(`${dateStr} ${quiz.startTime || "00:00"}`, "YYYY-MM-DD HH:mm");
    const endMoment = moment(`${endDateStr} ${quiz.endTime || "23:59"}`, "YYYY-MM-DD HH:mm");
    const now = moment();
    if (now.isBefore(startMoment)) return "upcoming";
    if (now.isAfter(endMoment)) return "completed";
    return "active";
  };

  const activeQuizzes = allQuizzes.filter((q) => getQuizPhase(q) === "active");
  const upcomingQuizzesFromApi = inProgressData?.data ?? [];
  const completedQuizzesFromApi = completedData?.data ?? [];

  const renderQuizTable = (quizzes: Quiz[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Test Type</TableHead>
          <TableHead>Questions</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Start</TableHead>
          <TableHead>End</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Deletion At</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {quizzes.length === 0 ? (
          <TableRow>
            <TableCell colSpan={12} className="text-center py-10">
              <div className="flex flex-col items-center justify-center">
                <ClipboardList className="h-10 w-10 text-gray-300 mb-2" />
                <p className="font-medium text-gray-500">No quizzes found</p>
                <p className="text-sm text-gray-400">
                  Create your first quiz to get started
                </p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          quizzes.map((quiz) => (
            <TableRow key={quiz._id}>
              <TableCell className="font-medium max-w-[220px] truncate" title={quiz.title}>
                <Link
                  to={`/quizzes/${quiz._id}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {quiz.title}
                </Link>
              </TableCell>
              <TableCell className="max-w-[200px] truncate text-muted-foreground">
                {quiz.description || "—"}
              </TableCell>
              <TableCell>
                {quiz.type === "live" ? (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    <Clock className="h-3 w-3 mr-1" />
                    Live
                  </Badge>
                ) : quiz.type === "mock" ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <FileText className="h-3 w-3 mr-1" />
                    Mock
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                {quiz.testType === "paid" ? (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    Paid
                  </Badge>
                ) : quiz.testType === "free" ? (
                  <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                    Free
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-center">{quiz.totalQuestions ?? "—"}</TableCell>
              <TableCell className="text-center">
                {quiz.durationInMinutes != null
                  ? `${quiz.durationInMinutes} min`
                  : "—"}
              </TableCell>
              <TableCell className="text-center text-sm whitespace-nowrap">
                {formatDateTime(quiz.startDate, quiz.startTime)}
              </TableCell>
              <TableCell className="text-center text-sm whitespace-nowrap">
                {formatDateTime(quiz.endDate, quiz.endTime)}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="capitalize">
                  {quiz.status ?? "—"}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                {quiz.createdAt
                  ? moment(quiz.createdAt).format("DD MMM YYYY")
                  : "—"}
              </TableCell>
              <TableCell className="text-center">
                {quiz.deletionAt
                  ? moment(quiz.deletionAt).format("DD MMM YYYY")
                  : "N/A"}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={`/quizzes/${quiz._id}`}>View Details</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Quizzes Management</h1>
          <p className="text-muted-foreground">
            Create and manage quizzes for your students.
          </p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full flex-col gap-2 md:max-w-sm">
            <Input
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Button asChild>
            <Link to="/quizzes/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Quiz
            </Link>
          </Button>
        </div>

        <div className="rounded-md border">
          {isLoading && (
            <div className="w-full flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && error && (
            <div className="w-full flex items-center justify-center py-12">
              <p className="text-muted-foreground">
                Failed to load quizzes. The list endpoint may not be available yet.
              </p>
            </div>
          )}

          {!isLoading && !error && (!data || !Array.isArray(allQuizzes)) && (
            <div className="w-full flex items-center justify-center py-12">
              <span className="text-gray-500 text-lg font-medium">
                No quizzes found. Create your first quiz!
              </span>
            </div>
          )}

          {!isLoading && !error && Array.isArray(allQuizzes) && (
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="active" className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Active ({activeQuizzes.length})
                </TabsTrigger>
                <TabsTrigger value="upcoming" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Upcoming ({inProgressLoading ? "…" : upcomingQuizzesFromApi.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Completed ({completedLoading ? "…" : completedQuizzesFromApi.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="active" className="mt-4">
                {renderQuizTable(activeQuizzes)}
              </TabsContent>
              <TabsContent value="upcoming" className="mt-4">
                {inProgressLoading ? (
                  <div className="w-full flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : inProgressError ? (
                  <div className="w-full flex items-center justify-center py-12">
                    <p className="text-muted-foreground">Failed to load in-progress quizzes.</p>
                  </div>
                ) : (
                  renderQuizTable(upcomingQuizzesFromApi)
                )}
              </TabsContent>
              <TabsContent value="completed" className="mt-4">
                {completedLoading ? (
                  <div className="w-full flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : completedError ? (
                  <div className="w-full flex items-center justify-center py-12">
                    <p className="text-muted-foreground">Failed to load completed quizzes.</p>
                  </div>
                ) : (
                  renderQuizTable(completedQuizzesFromApi)
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
