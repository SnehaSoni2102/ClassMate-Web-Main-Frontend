import React from "react";
import { useParams, Link } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Users, 
  UserPlus, 
  Calendar, 
  Clock, 
  FileText, 
  Trophy,
  Image as ImageIcon,
  Edit,
  Loader2
} from "lucide-react";
import { useGetGroupDetails } from "@/lib/api/queries/use-get-group-details";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateGroupPrices, type GroupPriceInput } from "@/lib/api/mutations/update-group-prices-mutation";
import { useQueryClient } from "@tanstack/react-query";

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetGroupDetails(id!);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateGroupPrices = useUpdateGroupPrices();
  const [isPricingOpen, setIsPricingOpen] = React.useState(false);
  const [prices, setPrices] = React.useState<{ duration: number; price: string }[]>([
    { duration: 1, price: "" },
    { duration: 3, price: "" },
    { duration: 6, price: "" },
    { duration: 12, price: "" },
  ]);

  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load group details",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const formatDate = (dateString: string) => {
    try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const formatDuration = (durationMs: number) => {
    const minutes = Math.floor(durationMs / 60000);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  const renderRole = (role: string) => {
    switch(role) {
      case "group-admin":
        return <Badge className="bg-blue-500">Group Admin</Badge>;
      case "student":
        return <Badge className="bg-green-500">Student</Badge>;
      case "manager":
        return <Badge className="bg-purple-500">Manager</Badge>;
      default:
        return <Badge>{role}</Badge>;
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
          <Users className="h-16 w-16 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-500">Group not found</h2>
          <p className="text-gray-400">The group you're looking for doesn't exist.</p>
          <Link to="/groups">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Groups
            </Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const group = data.data;

  const openPricing = () => {
    if (group.pricePerStudent?.length) {
      const mapped = [1, 3, 6, 12].map((d) => {
        const found = group.pricePerStudent!.find((p) => Number(p.duration) === d);
        return { duration: d, price: found ? String(found.price) : "" };
      });
      setPrices(mapped);
    } else {
      setPrices([
        { duration: 1, price: "" },
        { duration: 3, price: "" },
        { duration: 6, price: "" },
        { duration: 12, price: "" },
      ]);
    }
    setIsPricingOpen(true);
  };

  const handleSavePrices = async () => {
    const entries = prices.filter((p) => String(p.price).trim() !== "");
    if (entries.length === 0) {
      toast({ title: "No prices entered", description: "Enter at least one price to update.", variant: "destructive" });
      return;
    }
    const payload: GroupPriceInput[] = entries
      .map((p) => ({ duration: p.duration, price: Number(p.price) }))
      .filter((p) => !Number.isNaN(p.price) && p.price >= 0);
    if (payload.length === 0) {
      toast({ title: "Invalid input", description: "Enter valid non-negative prices.", variant: "destructive" });
      return;
    }
    try {
      await updateGroupPrices.mutateAsync({ groupId: group._id, pricePerStudent: payload });
      toast({ title: "Updated", description: "Group pricing updated." });
      setIsPricingOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["get-group-details", group._id] }),
        queryClient.invalidateQueries({ queryKey: ["get-groups"] }),
        queryClient.refetchQueries({ queryKey: ["get-groups"] }),
      ]);
    } catch (err: any) {
      toast({
        title: "Failed to update",
        description: err?.response?.data?.message || err?.message || "Unknown error",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/groups">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            {group.logo ? (
              <img
                src={group.logo}
                alt="Group Logo"
                className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                <ImageIcon className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{group.title}</h2>
              <p className="text-gray-500 mt-2">
                {group.description || "No description available"}
              </p>
            </div>
          </div>
        </div>

        {/* Group Information Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Group Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Group Type</span>
                <span className="text-sm">{group.group_type || "Not specified"}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Created By</span>
                <span className="text-sm capitalize">
                  {group.createdBy === 'TEACHER' ? 'Teacher' : group.createdBy === 'GROUP' ? 'Group' : group.createdBy}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Total Members</span>
                <span className="text-sm">{group.members.length}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Total Tests</span>
                <span className="text-sm">{group.tests.length}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Price Per Student</span>
                  <Button size="sm" variant="outline" onClick={openPricing}>
                    <Edit className="h-4 w-4 mr-2" /> Manage
                  </Button>
                </div>
                {group.pricePerStudent && group.pricePerStudent.length ? (
                  <div className="flex flex-wrap gap-2">
                    {group.pricePerStudent
                      .slice()
                      .sort((a, b) => Number(a.duration) - Number(b.duration))
                      .map((p, idx) => (
                        <Badge key={`${group._id}-${p.duration}-${idx}`} variant="secondary">
                          {p.duration}m · ₹{p.price}
                        </Badge>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No plans configured</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Admin Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Admin Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                {group.admin.image ? (
                  <img
                    src={group.admin.image}
                    alt="Admin"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <UserPlus className="h-5 w-5 text-gray-400" />
                  </div>
                )}
                <div>
                  <div className="font-medium">{group.admin.name || "Unnamed Admin"}</div>
                  <div className="text-sm text-gray-500">Group Administrator</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Members Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Members ({group.members.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {group.members.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No members found</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {group.members.map((member, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{member.name || "Unnamed Member"}</div>
                      {renderRole(member.role)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tests Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Tests ({group.tests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {group.tests.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No tests found</p>
            ) : (
              <div className="space-y-4">
                {group.tests.map((test, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{test.name}</h3>
                        <p className="text-sm text-gray-500">{test.name_hi}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">{test.totalMarks} marks</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span>{test.totalQuestions} questions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{formatDuration(test.duration)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{formatDate(test.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{formatTime(test.startTime)} - {formatTime(test.endTime)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link to="/groups">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Groups
            </Button>
          </Link>
        </div>
      </div>

      {/* Manage Price Per Student Dialog */}
      <Dialog open={isPricingOpen} onOpenChange={setIsPricingOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Update Price Per Student</DialogTitle>
            <DialogDescription>Amounts in INR</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {prices.map((plan, idx) => (
              <div key={plan.duration} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
                <div className="sm:col-span-2">
                  <Label>Duration (months)</Label>
                  <Input value={plan.duration} disabled readOnly />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor={`gprice-${idx}`}>Price (₹)</Label>
                  <Input
                    id={`gprice-${idx}`}
                    type="number"
                    min={0}
                    inputMode="numeric"
                    placeholder="Enter price"
                    value={plan.price}
                    onChange={(e) => {
                      const next = [...prices];
                      next[idx] = { ...next[idx], price: e.target.value };
                      setPrices(next);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPricingOpen(false)} disabled={updateGroupPrices.isPending}>
              Cancel
            </Button>
            <Button onClick={handleSavePrices} disabled={updateGroupPrices.isPending}>
              {updateGroupPrices.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </AdminLayout>
  );
};

export default GroupDetail; 