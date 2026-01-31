
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Users, Download } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

// Mock transaction data
const mockTransaction = {
  id: "2",
  amount: 300,
  type: "group_fee" as "payment" | "refund" | "group_fee",
  status: "completed" as "completed" | "pending" | "failed",
  userId: "user-2",
  userName: "Jane Smith",
  userEmail: "jane@example.com",
  groupId: "group-1",
  groupName: "Physics Masters",
  description: "Monthly group fee payment",
  createdAt: "2023-05-02T09:15:00Z",
  paymentMethod: "Credit Card",
  cardLast4: "4242",
  receiptUrl: "#",
  notes: "Payment received on time",
};

export default function TransactionDetail() {
  const { id } = useParams<{ id: string }>();
  const [transaction] = useState(mockTransaction);
  const { toast } = useToast();

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

  const handleUpdateStatus = (newStatus: "completed" | "failed") => {
    // In a real app, you would update the transaction status in the backend
    toast({
      title: "Transaction Status Updated",
      description: `Transaction #${id} status changed to ${newStatus}.`,
    });
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/transactions">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Transactions
            </Link>
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transaction Details</h1>
            <p className="text-muted-foreground mt-1">
              Transaction ID: #{id}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <a href={transaction.receiptUrl} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </a>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Transaction Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Amount</h3>
                    <p className="text-2xl font-bold">{formatAmount(transaction.amount)}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <div className="mt-1">
                      {transaction.status === "completed" && (
                        <Badge className="bg-green-500">Completed</Badge>
                      )}
                      {transaction.status === "pending" && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          Pending
                        </Badge>
                      )}
                      {transaction.status === "failed" && (
                        <Badge variant="destructive">Failed</Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
                    <div className="mt-1">
                      {transaction.type === "payment" && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                          Payment
                        </Badge>
                      )}
                      {transaction.type === "refund" && (
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          <ArrowDownLeft className="h-3 w-3 mr-1" />
                          Refund
                        </Badge>
                      )}
                      {transaction.type === "group_fee" && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          <Users className="h-3 w-3 mr-1" />
                          Group Fee
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Date & Time</h3>
                    <p>{formatDate(transaction.createdAt)}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Payment Method</h3>
                    <p>{transaction.paymentMethod} {transaction.cardLast4 && `(**** ${transaction.cardLast4})`}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                  <p className="mt-1">{transaction.description}</p>
                </div>

                {transaction.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                    <p className="mt-1">{transaction.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User & Group Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">User</h3>
                <div className="mt-1 border rounded-md p-3">
                  <p className="font-medium">{transaction.userName}</p>
                  <p className="text-sm text-muted-foreground">{transaction.userEmail}</p>
                  <Button variant="ghost" size="sm" className="mt-2 h-8 px-2 py-0" asChild>
                    <Link to={`/users/${transaction.userId}`}>
                      View User Profile
                    </Link>
                  </Button>
                </div>
              </div>

              {transaction.groupId && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Group</h3>
                  <div className="mt-1 border rounded-md p-3">
                    <p className="font-medium">{transaction.groupName}</p>
                    <Button variant="ghost" size="sm" className="mt-2 h-8 px-2 py-0" asChild>
                      <Link to={`/groups/${transaction.groupId}`}>
                        View Group Details
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {transaction.status === "pending" && (
          <Card>
            <CardHeader>
              <CardTitle>Update Transaction Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                This transaction is currently pending. You can mark it as completed or failed.
              </p>
              <div className="flex items-center gap-2">
                <Button variant="default" onClick={() => handleUpdateStatus("completed")}>
                  Mark as Completed
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Mark as Failed</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will mark the transaction as failed. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleUpdateStatus("failed")}>
                        Yes, mark as failed
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
