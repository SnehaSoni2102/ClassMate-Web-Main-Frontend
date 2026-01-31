
import { useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
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
import { useGetSupportTickets } from "@/lib/api/queries/use-get-support-tickets";

export default function SupportPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "general" | "technical" | "billing">("all");

  const { data: supportTicketsResponse, isLoading } = useGetSupportTickets();

  // Filter support tickets
  const filteredTickets = (supportTicketsResponse?.data || []).filter((ticket) => {
    const matchesSearch = ticket.issue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || ticket.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate time ago for display
  const timeAgo = (dateString: string) => {
    const now = new Date();
    const pastDate = new Date(dateString);
    const diff = now.getTime() - pastDate.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days !== 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Student Support</h1>
          <p className="text-muted-foreground">
            Manage and respond to student queries, issues, and feedback.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:max-w-sm">
            <Input
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Category: {categoryFilter === "all" ? "All" :
                             categoryFilter === "general" ? "General" :
                             categoryFilter === "technical" ? "Technical" : "Billing"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setCategoryFilter("all")}>
                  All Categories
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCategoryFilter("general")}>
                  General
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCategoryFilter("technical")}>
                  Technical
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCategoryFilter("billing")}>
                  Billing
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableCaption>A list of all student support tickets.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    Loading support tickets...
                  </TableCell>
                </TableRow>
              ) : filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    No support tickets found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket) => (
                  <TableRow key={ticket._id}>
                    <TableCell>#{ticket._id.slice(-8)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        ticket.category === "general" ? "bg-blue-50 text-blue-700 border-blue-200" :
                        ticket.category === "technical" ? "bg-green-50 text-green-700 border-green-200" :
                        "bg-orange-50 text-orange-700 border-orange-200"
                      }>
                        {ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium py-3">
                      <div className="whitespace-normal break-words leading-relaxed">
                        {ticket.issue}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link to={`/users/${ticket?.user?._id}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                        {ticket?.user?.Name || ticket?.user?.phoneNumber || ticket?.user?.email ||  "Unknown User"}
                      </Link>
                    </TableCell>
                    <TableCell title={formatDate(ticket.createdAt)}>
                      {timeAgo(ticket.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
