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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, UserPlus, Users, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useGetGroups } from "@/lib/api/queries/use-get-groups";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateAllGroupPrices } from "@/lib/api/mutations/update-all-group-prices-mutation";



const GroupsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isManagePricingOpen, setIsManagePricingOpen] = useState(false);
  const [pricingInputs, setPricingInputs] = useState<{ duration: number; price: string }[]>([
    { duration: 1, price: "" },
    { duration: 3, price: "" },
    { duration: 6, price: "" },
    { duration: 12, price: "" },
  ]);
  const updateAllGroupPrices = useUpdateAllGroupPrices();

  const { data, isLoading, error } = useGetGroups({
    page: currentPage,
    limit: 10,
    searchTerm: searchQuery || undefined,
  });

  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load groups",
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const openManagePricing = () => {
    setPricingInputs([
      { duration: 1, price: "" },
      { duration: 3, price: "" },
      { duration: 6, price: "" },
      { duration: 12, price: "" },
    ]);
    setIsManagePricingOpen(true);
  };

  const handleSaveAllPricing = async () => {
    const entries = pricingInputs.filter((p) => String(p.price).trim() !== "");
    if (entries.length === 0) {
      toast({ title: "No prices entered", description: "Enter at least one price to update.", variant: "destructive" });
      return;
    }
    const payload = entries.map((p) => ({ duration: p.duration, price: Number(p.price) })).filter((p) => !Number.isNaN(p.price) && p.price >= 0);
    if (payload.length === 0) {
      toast({ title: "Invalid input", description: "Enter valid non-negative prices.", variant: "destructive" });
      return;
    }
    try {
      await updateAllGroupPrices.mutateAsync(payload);
      toast({ title: "Updated", description: "All groups' pricing updated." });
      setIsManagePricingOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["get-groups"] });
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Groups</h2>
            <p className="text-gray-500 mt-2">
              Manage study groups, members and permissions
            </p>
          </div>
          <Button variant="outline" onClick={openManagePricing}>Manage All Pricing</Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search groups..."
              className="w-full pl-9"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group Name</TableHead>
                <TableHead>Group Admin</TableHead>
                <TableHead>Group Type</TableHead>
                <TableHead>Members</TableHead>
                <TableHead className="min-w-[220px]">Price/Student</TableHead>
                <TableHead>Logo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : !data?.data || data.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center">
                      <UserPlus className="h-10 w-10 text-gray-300 mb-2" />
                      <p className="font-medium text-gray-500">No groups found</p>
                      <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.data.map((group) => (
                  <TableRow key={group._id}>
                    <TableCell>
                      <Link 
                        to={`/groups/${group._id}`}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      >
                        {group.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {group.admin.image ? (
                          <img
                            src={group.admin.image}
                            alt={group.admin.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                            <Users className="h-3 w-3 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{group.admin.name || "Unnamed Admin"}</div>
                          <div className="text-sm text-gray-500">{group.admin.phone}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {group.group_type || "Not specified"}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-gray-400" />
                      {group.membersCount}
                    </TableCell>
                    <TableCell>
                      {group.pricePerStudent && group.pricePerStudent.length ? (
                        <div className="flex flex-wrap gap-2">
                          {group.pricePerStudent
                            .slice()
                            .sort((a, b) => Number(a.duration) - Number(b.duration))
                            .map((p) => (
                              <Badge key={`${group._id}-${p.duration}`} variant="secondary">
                                {p.duration}m · ₹{p.price}
                              </Badge>
                            ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No plans</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {group.logo && (
                        <div className="flex items-center gap-2">
                          <img
                            src={group.logo}
                            alt="Group Logo"
                            className="w-6 h-6 rounded object-cover"
                          />
                        </div>
                      )}
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
              `Showing ${((data.meta.page - 1) * data.meta.limit) + 1} to ${Math.min(data.meta.page * data.meta.limit, data.meta.total)} of ${data.meta.total} groups`
            ) : (
              "Loading..."
            )}
          </p>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={!data?.meta || data.meta.page <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-500">
              Page {data?.meta?.page || 1} of {data?.meta?.totalPages || 1}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              disabled={!data?.meta || data.meta.page >= data.meta.totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Manage All Pricing Dialog */}
      <Dialog open={isManagePricingOpen} onOpenChange={setIsManagePricingOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Update Price Per Student (All Groups)</DialogTitle>
            <DialogDescription>Amounts in INR</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {pricingInputs.map((plan, idx) => (
              <div key={plan.duration} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
                <div className="sm:col-span-2">
                  <Label>Duration (months)</Label>
                  <Input value={plan.duration} disabled readOnly />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor={`price-${idx}`}>Price (₹)</Label>
                  <Input
                    id={`price-${idx}`}
                    type="number"
                    min={0}
                    inputMode="numeric"
                    placeholder="Enter price"
                    value={plan.price}
                    onChange={(e) => {
                      const next = [...pricingInputs];
                      next[idx] = { ...next[idx], price: e.target.value };
                      setPricingInputs(next);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManagePricingOpen(false)} disabled={updateAllGroupPrices.isPending}>
              Cancel
            </Button>
            <Button onClick={handleSaveAllPricing} disabled={updateAllGroupPrices.isPending}>
              {updateAllGroupPrices.isPending ? (
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

export default GroupsPage;
