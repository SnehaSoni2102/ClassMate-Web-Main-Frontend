import React, { useState } from "react";
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

import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Users, Loader2 } from "lucide-react";
import {
  useGetTransactions,
  type Transaction,
} from "@/lib/api/queries/use-get-transactions";

export default function TransactionsPage() {
  const { data, isLoading, error } = useGetTransactions();
  const [searchTerm, setSearchTerm] = useState("");

  // Handle API error
  React.useEffect(() => {
    if (error) {
      console.error("Failed to load transactions:", error);
    }
  }, [error]);

  // Get user data from transaction (can be string or object)
  const getUserData = (transaction: Transaction) => {
    if (typeof transaction.user === "object") {
      return transaction.user;
    }
    if (transaction.senderDetails) {
      return transaction.senderDetails;
    }
    return null;
  };

  // Filter transactions based on search term
  const filteredTransactions = React.useMemo(() => {
    const transactions = data?.data || [];

    if (!searchTerm.trim()) {
      return transactions;
    }

    return transactions.filter((transaction) => {
      const userData = getUserData(transaction);

      const matchesSearch =
        (userData?.Name
          ? userData.Name.toLowerCase().includes(searchTerm.toLowerCase())
          : false) ||
        (userData?.email
          ? userData.email.toLowerCase().includes(searchTerm.toLowerCase())
          : false) ||
        (userData?.phoneNumber
          ? userData.phoneNumber
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          : false) ||
        (transaction?.description
          ? transaction.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          : false) ||
        (transaction?._id
          ? transaction._id.toLowerCase().includes(searchTerm.toLowerCase())
          : false);

      return matchesSearch;
    });
  }, [data?.data, searchTerm]);

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

  // Format amount for display
  const formatAmount = (amount: number) => {
    return `₹${amount}`;
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            View and manage all financial transactions including payments,
            refunds and group fees.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:max-w-sm">
            <Input
              placeholder="Search by user name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Group/Category</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="h-10 w-10 text-gray-300 mb-2" />
                      <p className="font-medium text-gray-500">
                        No transactions found
                      </p>
                      <p className="text-sm text-gray-400">
                        {searchTerm
                          ? "Try adjusting your search criteria."
                          : "No transactions available."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => {
                  const userData = getUserData(transaction);
                  const isPaid = transaction?.status === "PAID";
                  const isCreated = transaction?.status === "CREATED";

                  return (
                    <TableRow key={transaction?._id || Math.random()}>
                      <TableCell className="font-medium">
                        #{transaction?._id ? transaction._id.slice(-8) : "N/A"}
                      </TableCell>
                      <TableCell className="font-medium">
                        ₹{transaction?.amount || 0}
                        {transaction?.currency &&
                          transaction.currency !== "INR" && (
                            <span className="text-sm text-muted-foreground ml-1">
                              ({transaction.currency})
                            </span>
                          )}
                      </TableCell>
                      <TableCell>
                        {isPaid ? (
                          <Badge className="bg-green-500">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            Paid
                          </Badge>
                        ) : isCreated ? (
                          <Badge
                            variant="outline"
                            className="bg-yellow-50 text-yellow-700 border-yellow-200"
                          >
                            <Loader2 className="h-3 w-3 mr-1" />
                            Created
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            {transaction?.status || "Unknown"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {userData ? (
                          <div className="flex flex-col">
                            <Link
                              to={`/users/${userData._id}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                            >
                              {userData.Name || "Anonymous"}
                            </Link>
                            <span className="text-sm text-muted-foreground">
                              {userData.email || "No email"}
                            </span>
                            {userData.phoneNumber && (
                              <span className="text-xs text-muted-foreground">
                                {userData.phoneNumber}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            No user data
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <div className="flex flex-col">
                          <span
                            className="truncate"
                            title={transaction?.description || "No description"}
                          >
                            {transaction?.description || "No description"}
                          </span>
                          {transaction?.mode && (
                            <span className="text-xs text-muted-foreground mt-1">
                              Mode: {transaction.mode}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[150px]">
                        {transaction?.group ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">Group</span>
                            <Link
                              to={`/groups/${transaction.group.groupId}`}
                              className="text-xs text-blue-600 hover:text-blue-800 hover:underline truncate"
                              title={`Navigate to group: ${transaction.group.groupId}`}
                            >
                              {transaction.group.groupId}
                            </Link>
                          </div>
                        ) : transaction?.categories &&
                          transaction.categories.length > 0 ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              Category
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {transaction.categories.length} item
                              {transaction.categories.length > 1 ? "s" : ""}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {transaction?.createdAt
                          ? new Date(transaction.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
