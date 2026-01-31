import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Loader2, Upload } from "lucide-react";
import { useGetQuestions } from "@/lib/api/queries/use-get-questions";
import { BulkUploadQuestionsModal } from "@/components/modals/BulkUploadQuestionsModal";
import { BulkEditQuestionsModal } from "@/components/modals/BulkEditQuestionsModal";
import { useBulkDeleteQuestions } from "@/lib/api/mutations/bulk-delete-questions-mutation";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import moment from "moment";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { MathText } from "@/math/MathText";

export default function QuestionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermDebounced, setSearchTermDebounced] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "single" | "multiple"
  >("all");
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

  // Get current page from URL params
  const currentPage = (() => {
    const pageParam = searchParams.get("page");
    const parsed = pageParam ? parseInt(pageParam, 10) : 1;
    return isNaN(parsed) || parsed < 1 ? 1 : parsed;
  })();

  const { data, isLoading } = useGetQuestions({
    questionType: filterType,
    searchTerm: searchTermDebounced,
    page: currentPage,
  });

  const bulkDeleteMutation = useBulkDeleteQuestions();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTermDebounced(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle page change and update URL
  const handlePageChange = (newPage: number) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (newPage > 1) {
      newSearchParams.set("page", newPage.toString());
    } else {
      newSearchParams.delete("page");
    }
    setSearchParams(newSearchParams);
  };

  // Handle filter change - reset to page 1
  const handleFilterChange = (type: "all" | "single" | "multiple") => {
    setFilterType(type);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("page"); // Reset to page 1
    setSearchParams(newSearchParams);
  };

  // Handle search change - reset to page 1
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    if (currentPage !== 1) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("page"); // Reset to page 1
      setSearchParams(newSearchParams);
    }
  };

  // Handle checkbox selection
  const handleSelectQuestion = (questionId: string, checked: boolean) => {
    setSelectedQuestions(prev =>
      checked
        ? [...prev, questionId]
        : prev.filter(id => id !== questionId)
    );
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      await bulkDeleteMutation.mutateAsync({ questionIds: selectedQuestions });
      setSelectedQuestions([]);
      setIsBulkDeleteDialogOpen(false);
      // Invalidate the questions query cache to refresh the list
      await queryClient.invalidateQueries({ queryKey: ["get-questions"] });
    } catch (error: any) {
      console.error("Bulk delete error:", error);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Questions Bank</h1>
          <p className="text-muted-foreground">
            Create, manage and organize questions for tests and exams. Support
            for both English and Hindi.
          </p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full flex-col gap-2 md:max-w-sm px-1">
            <Input
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            {selectedQuestions.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setIsBulkDeleteDialogOpen(true)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected ({selectedQuestions.length})
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {filterType === "all"
                    ? "All Types"
                    : filterType === "single"
                    ? "Single Choice"
                    : "Multiple Choice"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleFilterChange("all")}>
                  All Types
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("single")}
                >
                  Single Choice
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("multiple")}
                >
                  Multiple Choice
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" onClick={() => setIsBulkUploadOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Bulk Upload
            </Button>

            <Button variant="outline" onClick={() => setIsBulkEditOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Bulk Edit
            </Button>

            <Button asChild>
              <Link to="/questions/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Question
              </Link>
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          {isLoading && (
            <div className="w-full flex items-center justify-center py-12">
              <Loader2 className="transition-all duration-300 animate-spin text-blue-400" />
            </div>
          )}

          {!data ||
            !data.data ||
            (data?.data?.questions?.length === 0 && (
              <div className="w-full flex items-center justify-center py-12">
                <span className="text-gray-500 text-lg font-medium">
                  No questions found.
                </span>
              </div>
            ))}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Select</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Type</TableHead>
                {/* <TableHead>Subjects</TableHead>
                <TableHead>Topics</TableHead>
                <TableHead>Classes</TableHead> */}
                <TableHead>Serial No</TableHead>
                <TableHead>Has Image</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.data?.questions ?? [])?.map((question) => (
                <TableRow key={question._id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedQuestions.includes(question._id)}
                      onCheckedChange={(checked) =>
                        handleSelectQuestion(question._id, checked === true)
                      }
                      aria-label={`Select question ${question._id}`}
                    />
                  </TableCell>
                  <TableCell
                    className="max-w-[300px] truncate"
                    title={question.text}
                  >
                    <Link
                      style={{display: 'inline-block'}}
                      to={`/questions/${question._id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                      title={question.text}
                    >
                      <MathText text={question.text} inline />
                    </Link>
                  </TableCell>
                  <TableCell>
                    {question.isTwoOptions ? (
                      <Badge
                        variant="outline"
                        className="bg-amber-50 text-amber-700 border-amber-200"
                      >
                        Multiple Choice
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        Single Choice
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-center">
                {question?.serial_no ? (
                  <Badge variant="outline" className="font-mono">
                    {question.serial_no}
                  </Badge>
                ) : (
                  <span className="text-xs text-gray-400">-</span>
                )}
              </TableCell>
                  {/* <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {question?.subject?.length === 0 && (
                        <p className="text-xs text-red-500">
                          No Subject Chosen
                        </p>
                      )}
                      {question?.subject?.map((t, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </TableCell> */}
                  {/* <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {question?.topics?.length === 0 && (
                        <p className="text-xs text-red-500">
                          No Topic Chosen
                        </p>
                      )}
                      {question?.topics?.map((t, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </TableCell> */}
                  {/* <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {question?.class?.length === 0 && (
                        <p className="text-xs text-red-500">
                          No Class Chosen
                        </p>
                      )}
                      {question?.class?.map((t, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </TableCell> */}
                  <TableCell>
                    {question?.image?.trim() ? (
                      <Badge variant="default" className="bg-green-500">
                        Yes
                      </Badge>
                    ) : (
                      <Badge variant="outline">No</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {moment(question?.createdAt).format('DD MMM YYYY')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Pagination Component */}
          {data?.data?.pagination?.totalPages > 1 && (
            <div className="flex justify-center py-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        if (currentPage > 1) handlePageChange(currentPage - 1);
                      }}
                      aria-disabled={currentPage === 1}
                      tabIndex={currentPage === 1 ? -1 : 0}
                    />
                  </PaginationItem>
                  {/* Page numbers with ellipsis */}
                  {(() => {
                    const total = data.data.pagination.totalPages;
                    const siblings = 1;
                    const boundaries = 1;
                    const range = [];
                    const leftSibling = Math.max(currentPage - siblings, boundaries + 1);
                    const rightSibling = Math.min(currentPage + siblings, total - boundaries);
                    const showLeftEllipsis = leftSibling > boundaries + 1;
                    const showRightEllipsis = rightSibling < total - boundaries;

                    // Boundaries
                    for (let i = 1; i <= boundaries; i++) {
                      range.push(i);
                    }
                    // Left ellipsis
                    if (showLeftEllipsis) {
                      range.push('left-ellipsis');
                    }
                    // Main range
                    for (let i = leftSibling; i <= rightSibling; i++) {
                      range.push(i);
                    }
                    // Right ellipsis
                    if (showRightEllipsis) {
                      range.push('right-ellipsis');
                    }
                    // Boundaries at end
                    for (let i = total - boundaries + 1; i <= total; i++) {
                      if (i > boundaries && i > rightSibling) {
                        range.push(i);
                      }
                    }
                    return range.map((item, idx) => {
                      if (item === 'left-ellipsis' || item === 'right-ellipsis') {
                        return (
                          <PaginationItem key={item + idx}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return (
                        <PaginationItem key={item}>
                          <PaginationLink
                            href="#"
                            isActive={item === currentPage}
                            onClick={e => {
                              e.preventDefault();
                              handlePageChange(Number(item));
                            }}
                          >
                            {item}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    });
                  })()}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        if (currentPage < data.data.pagination.totalPages) handlePageChange(currentPage + 1);
                      }}
                      aria-disabled={currentPage === data.data.pagination.totalPages}
                      tabIndex={currentPage === data.data.pagination.totalPages ? -1 : 0}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>

      <BulkUploadQuestionsModal
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
      />

      <BulkEditQuestionsModal
        isOpen={isBulkEditOpen}
        onClose={() => setIsBulkEditOpen(false)}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Questions</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedQuestions.length} selected question{selectedQuestions.length !== 1 ? 's' : ''}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={bulkDeleteMutation.isPending}
            >
              {bulkDeleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
