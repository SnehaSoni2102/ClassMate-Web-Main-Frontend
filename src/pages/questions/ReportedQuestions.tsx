import React, { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Check, ArrowLeft, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useGetReportedQuestions, type ReportedQuestion } from "@/lib/api/queries/use-get-reported-questions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Types for component state
interface ResolvedReport extends ReportedQuestion {
  status: 'resolved';
  resolvedBy: string;
  resolutionNote: string;
  resolvedAt: string;
}

export default function ReportedQuestions() {
  const { toast } = useToast();
  const { data, isLoading, error } = useGetReportedQuestions();
  const [resolvedReports, setResolvedReports] = useState<ResolvedReport[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportedQuestion | null>(null);
  const [reasonsModalOpen, setReasonsModalOpen] = useState(false);
  const [selectedReasonsReport, setSelectedReasonsReport] = useState<ReportedQuestion | null>(null);

  // Handle API error
  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load reported questions",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Combine API data with resolved reports
  const allReports = React.useMemo(() => {
    const apiReports = data?.data ? data.data : [];
    const pendingReports = apiReports.filter(report =>
      report?._id && !resolvedReports.find(resolved => resolved._id === report._id)
    );

    return [...pendingReports, ...resolvedReports];
  }, [data?.data, resolvedReports]);

  // Filter reports based on search term and status
  const filteredReports = allReports.filter((report) => {
    const matchesSearch =
      (report?.question ? report.question.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
      (report?.user?.Name ? report.user.Name.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
      (report?.user?.email ? report.user.email.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
      (report?.user?.phoneNumber ? report.user.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
      (report?.answer ? report.answer.some(reason => reason ? reason.toLowerCase().includes(searchTerm.toLowerCase()) : false) : false);

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter
        ? ((report as any)?.status === statusFilter)
        : true;

    return matchesSearch && matchesStatus;
  });

  const handleResolveReport = (report: ReportedQuestion) => {
    if (!report?._id) {
      toast({
        title: "Error",
        description: "Invalid report data.",
        variant: "destructive",
      });
      return;
    }

    const resolvedReport: ResolvedReport = {
      ...report,
      status: 'resolved',
      resolvedBy: "Admin User", // In real app, get from auth context
      resolutionNote: "Issue has been resolved",
      resolvedAt: new Date().toISOString(),
    };

    setResolvedReports(prev => prev ? [...prev, resolvedReport] : [resolvedReport]);

    toast({
      title: "Issue Solved",
      description: "The reported issue has been marked as resolved.",
    });
  };

  const handleOpenReasonsModal = (report: ReportedQuestion) => {
    setSelectedReasonsReport(report);
    setReasonsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200"
          >
            Resolved
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50 border-yellow-200"
          >
            Pending
          </Badge>
        );
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/questions">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Questions
            </Link>
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Reported Questions
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage reports submitted by students for questions.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <Select
              value={statusFilter || ""}
              onValueChange={(value) => setStatusFilter(value || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question ID</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={index}>
                    <td className="px-4 py-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  </TableRow>
                ))
              ) : filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <User className="h-10 w-10 text-gray-300 mb-2" />
                      <p className="font-medium text-gray-500">No reports found</p>
                      <p className="text-sm text-gray-400">No reported questions match your search criteria.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report) => (
                  <TableRow key={report?._id || Math.random()}>
                    <TableCell className="font-medium max-w-[250px] truncate">
                      <Link
                        to={`/questions/${report?.question || ''}`}
                        className="hover:underline text-blue-600"
                      >
                        {report?.question ? report.question : 'N/A'}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {report?.user?.Name ? report.user.Name : 'Anonymous'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {report?.user?.email ? report.user.email : 'No email'}
                        </span>
                        {report?.user?.phoneNumber && (
                          <span className="text-xs text-muted-foreground">
                            {report.user.phoneNumber}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      {report?.answer && report.answer.length > 0 ? (
                        <button
                          onClick={() => handleOpenReasonsModal(report)}
                          className="text-left text-sm text-gray-700 hover:text-gray-900 hover:underline cursor-pointer line-clamp-2"
                          title="Click to view all reasons"
                        >
                          {report.answer.join(", ")}
                        </button>
                      ) : (
                        <span className="text-sm text-muted-foreground">No reasons provided</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {report?.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge((report as any)?.status || 'pending')}
                    </TableCell>
                    <TableCell className="text-right">
                      {((report as any)?.status !== "resolved") ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => report && handleResolveReport(report)}
                          disabled={!report}
                          className="flex items-center gap-2"
                        >
                          <Check className="h-4 w-4" />
                          Issue Solved
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="flex items-center gap-2"
                        >
                          <Check className="h-4 w-4" />
                          Resolved
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Reasons Modal */}
      <Dialog open={reasonsModalOpen} onOpenChange={setReasonsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Report Reasons</DialogTitle>
            <DialogDescription>
              All reasons provided for this reported question
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium mb-2">Question:</h4>
              <p className="text-sm text-gray-700">
                {selectedReasonsReport?.question || 'N/A'}
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Reasons:</h4>
              <div className="space-y-2">
                {selectedReasonsReport?.answer && selectedReasonsReport.answer.length > 0 ? (
                  selectedReasonsReport.answer.map((reason, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-sm font-medium text-gray-500 min-w-[20px]">
                        {index + 1}.
                      </span>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {reason || 'Unknown reason'}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No reasons provided</p>
                )}
              </div>
            </div>
            <div className="border rounded-lg p-4 bg-blue-50">
              <h4 className="font-medium mb-2">Reported By:</h4>
              <div className="text-sm">
                <p className="font-medium">
                  {selectedReasonsReport?.user?.Name || 'Anonymous'}
                </p>
                {selectedReasonsReport?.user?.email && (
                  <p className="text-gray-600">{selectedReasonsReport.user.email}</p>
                )}
                {selectedReasonsReport?.user?.phoneNumber && (
                  <p className="text-gray-600">{selectedReasonsReport.user.phoneNumber}</p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
