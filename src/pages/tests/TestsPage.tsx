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
import { PlusCircle, MoreHorizontal, FileText, Clock, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGetTests } from "@/lib/api/queries/use-get-tests";
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

export default function TestsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermDebounced, setSearchTermDebounced] = useState("");
  const [filterType, setFilterType] = useState<"all" | "mock" | "live">("all");

  // Get current page from URL params
  const currentPage = (() => {
    const pageParam = searchParams.get("page");
    const parsed = pageParam ? parseInt(pageParam, 10) : 1;
    return isNaN(parsed) || parsed < 1 ? 1 : parsed;
  })();

  const { data, isLoading } = useGetTests({
    searchTerm: searchTermDebounced,
    page: currentPage,
    type: filterType,
    limit: 500,
  });

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
  const handleFilterChange = (type: "all" | "mock" | "live") => {
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

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Tests Management</h1>
          <p className="text-muted-foreground">
            Create, view and manage tests for your students.
          </p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full flex-col gap-2 md:max-w-sm">
            <Input
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {filterType === "all"
                    ? "All Types"
                    : filterType === "mock"
                    ? "Mock"
                    : "Live"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleFilterChange("all")}>All Types</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange("mock")}>Mock</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange("live")}>Live</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button asChild>
              <Link to="/tests/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Test
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

          {!isLoading && (!data || !data.data || data.data.tests.length === 0) && (
            <div className="w-full flex items-center justify-center py-12">
              <span className="text-gray-500 text-lg font-medium">
                No tests found. Create your first test!
              </span>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Test Type</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Sections</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Total Marks</TableHead>
                <TableHead>+ve</TableHead>
                <TableHead>-ve</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Deletion At</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.data?.tests ?? []).map((test) => (
                <TableRow key={test._id}>
                  <TableCell className="font-medium max-w-[220px] truncate" title={test.title}>
                    <Link
                      to={`/tests/${test._id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                      title={test.title}
                    >
                      {test.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {test.type === "mock" ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <FileText className="h-3 w-3 mr-1" />
                        Mock
                      </Badge>
                    ) : test.type === "live" ? (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        <Clock className="h-3 w-3 mr-1" />
                        Live
                      </Badge>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {test.testType === "paid" ? (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        Paid
                      </Badge>
                    ) : test.testType === "free" ? (
                      <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                        Free
                      </Badge>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">{test.totalQuestions}</TableCell>
                  <TableCell className="text-center">{test.totalSections}</TableCell>
                  <TableCell className="text-center">{Math.floor(test.durationInMinutes / 60)} min</TableCell>
                  <TableCell className="text-center">{test.totalMarks}</TableCell>
                  <TableCell className="text-center">{test.marksPerQuestion}</TableCell>
                  <TableCell className="text-center">{test.negativeMarks}</TableCell>
                  <TableCell className="text-center">{moment(test.createdAt).format('DD MMM YYYY')}</TableCell>
                  <TableCell className="text-center">
                    {test.deletionAt
                      ? moment(test.deletionAt).format('DD MMM YYYY')
                      : 'N/A'}
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
                        <DropdownMenuItem>
                          <Link to={`/tests/${test._id}`} className="flex w-full">
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link to={`/tests/${test._id}/edit`} className="flex w-full">
                            Edit Test
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                    let leftSibling = Math.max(currentPage - siblings, boundaries + 1);
                    let rightSibling = Math.min(currentPage + siblings, total - boundaries);
                    let showLeftEllipsis = leftSibling > boundaries + 1;
                    let showRightEllipsis = rightSibling < total - boundaries;

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
    </AdminLayout>
  );
}
