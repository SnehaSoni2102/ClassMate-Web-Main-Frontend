
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, MoreHorizontal, User, Eye } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useGetUsers } from "@/lib/api/queries/use-get-users";



const UsersPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const { data, isLoading, error } = useGetUsers({
    page: currentPage,
    limit: 10,
    searchTerm: searchQuery || undefined,
  });

  // Handle error with useEffect to avoid infinite re-renders
  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  // Role formatting
  const renderRole = (role: string) => {
    switch(role) {
      case "admin":
        return <Badge className="bg-blue-500">Admin</Badge>;
      case "group_manager":
        return <Badge className="bg-purple-500">Group Manager</Badge>;
      case "student":
        return <Badge className="bg-green-500">Student</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  const renderStatus = (status?: string) => {
    if (!status) return <Badge variant="secondary">Unknown</Badge>;
    
    switch(status.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "inactive":
        return <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Users</h2>
            <p className="text-gray-500 mt-2">
              Manage all users and their access permissions
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> Add User
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search users..."
              className="w-full pl-9"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Onboarding</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : !data?.data || data.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center">
                      <User className="h-10 w-10 text-gray-300 mb-2" />
                      <p className="font-medium text-gray-500">No users found</p>
                      <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.data.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <Link 
                        to={`/users/${user._id}`}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      >
                        {user.Name || user.email || "Unnamed User"}
                      </Link>
                    </TableCell>
                    <TableCell>{user.email || "Not provided"}</TableCell>
                    <TableCell>{renderRole(user.role)}</TableCell>
                    <TableCell>{renderStatus(user.status)}</TableCell>
                    <TableCell>
                      <Badge variant={user.isOnBoardingCompleted ? "default" : "secondary"}>
                        {user.isOnBoardingCompleted ? "Completed" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/users/${user._id}`}>
                              <Eye className="mr-2 h-4 w-4" /> View
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {data?.meta ? (
              `Showing ${((data.meta.currentPage - 1) * data.meta.perPage) + 1} to ${Math.min(data.meta.currentPage * data.meta.perPage, data.meta.totalUsers)} of ${data.meta.totalUsers} users`
            ) : (
              "Loading..."
            )}
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!data?.meta || data.meta.currentPage <= 1}
              onClick={() => handlePageChange(1)}
            >
              First
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={!data?.meta || data.meta.currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-500">
              Page {data?.meta?.currentPage || 1} of {data?.meta?.totalPages || 1}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              disabled={!data?.meta || data.meta.currentPage >= data.meta.totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!data?.meta || data.meta.currentPage >= data.meta.totalPages}
              onClick={() => handlePageChange(data?.meta?.totalPages || 1)}
            >
              Last
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UsersPage;
