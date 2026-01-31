import React from "react";
import { useParams, Link } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, User, Mail, Phone, Calendar, Clock, Shield, CheckCircle, XCircle } from "lucide-react";
import { useGetUser } from "@/lib/api/queries/use-get-user";
import { useToast } from "@/components/ui/use-toast";

const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetUser(id!);
  const { toast } = useToast();

  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load user details",
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
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

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

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!data?.data) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <User className="h-16 w-16 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-500">User not found</h2>
          <p className="text-gray-400">The user you're looking for doesn't exist.</p>
          <Link to="/users">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const user = data.data;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/users">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {user.Name || user.email || "User Details"}
            </h2>
            <p className="text-gray-500 mt-2">
              View detailed information about this user
            </p>
          </div>
        </div>

        {/* User Information Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Name</span>
                <span className="text-sm">{user.Name || "Not provided"}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Email</span>
                <span className="text-sm">{user.email || "Not provided"}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Phone</span>
                <span className="text-sm">{user.phoneNumber || "Not provided"}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Role</span>
                {renderRole(user.role)}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Status</span>
                {renderStatus(user.status)}
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Onboarding</span>
                <div className="flex items-center gap-2">
                  {user.isOnBoardingCompleted ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">
                    {user.isOnBoardingCompleted ? "Completed" : "Pending"}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Created</span>
                <span className="text-sm">{formatDate(user.createdAt)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Last Updated</span>
                <span className="text-sm">{formatDate(user.updatedAt)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Last Login</span>
                <span className="text-sm">{formatDate(user.lastLogin)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">User ID</span>
                <span className="text-sm font-mono text-xs">{user._id}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Picture */}
        {user.profilePicture && (
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                />
                <div>
                  <p className="text-sm text-gray-500">Profile picture uploaded</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link to="/users">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Button>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserDetail; 