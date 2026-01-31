
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

// Mock ticket data
const mockTicket = {
  id: "1",
  title: "Need help with accessing practice tests",
  description: "I've subscribed to the Standard Plan but I can't access the practice tests. It shows an error every time I try to open one.",
  status: "in_progress" as "open" | "in_progress" | "resolved" | "closed",
  priority: "high" as "low" | "medium" | "high",
  createdBy: "student-1",
  createdByName: "Rahul Kumar",
  createdByEmail: "rahul@example.com",
  assignedTo: "admin-1",
  assignedToName: "Admin User",
  createdAt: "2023-05-10T14:30:00Z",
  updatedAt: "2023-05-11T09:15:00Z",
  messages: [
    {
      id: "m1",
      userId: "student-1",
      userName: "Rahul Kumar",
      userRole: "student",
      content: "I've subscribed to the Standard Plan but I can't access the practice tests. It shows an error every time I try to open one. Can you please help me resolve this?",
      timestamp: "2023-05-10T14:30:00Z",
    },
    {
      id: "m2",
      userId: "admin-1",
      userName: "Admin User",
      userRole: "admin",
      content: "Hi Rahul, I'm sorry you're experiencing issues. Could you please share what error message you're seeing?",
      timestamp: "2023-05-10T16:45:00Z",
    },
    {
      id: "m3",
      userId: "student-1",
      userName: "Rahul Kumar",
      userRole: "student",
      content: "It says 'Access Denied' when I click on any test. I've already paid for the subscription last week.",
      timestamp: "2023-05-11T08:30:00Z",
    },
    {
      id: "m4",
      userId: "admin-1",
      userName: "Admin User", 
      userRole: "admin",
      content: "Thank you for the details. Let me check your account and subscription status. I'll get back to you shortly.",
      timestamp: "2023-05-11T09:15:00Z",
    },
  ],
};

export default function SupportTicketDetail() {
  const { id } = useParams<{ id: string }>();
  const [ticket] = useState(mockTicket);
  const [replyContent, setReplyContent] = useState("");
  const [status, setStatus] = useState<"open" | "in_progress" | "resolved" | "closed">(mockTicket.status);
  const [priority, setPriority] = useState<"low" | "medium" | "high">(mockTicket.priority);
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

  const handleSendReply = () => {
    if (!replyContent.trim()) {
      toast({
        title: "Empty Reply",
        description: "Please enter a message before sending.",
        variant: "destructive",
      });
      return;
    }

    // In a real app, you would send the reply to the backend
    toast({
      title: "Reply Sent",
      description: "Your reply has been sent to the user.",
    });
    setReplyContent("");
  };

  const handleStatusChange = (newStatus: "open" | "in_progress" | "resolved" | "closed") => {
    setStatus(newStatus);
    // In a real app, you would update the ticket status in the backend
    toast({
      title: "Status Updated",
      description: `Ticket status changed to ${newStatus.replace("_", " ")}.`,
    });
  };

  const handlePriorityChange = (newPriority: "low" | "medium" | "high") => {
    setPriority(newPriority);
    // In a real app, you would update the ticket priority in the backend
    toast({
      title: "Priority Updated",
      description: `Ticket priority changed to ${newPriority}.`,
    });
  };

  const getStatusBadge = (status: "open" | "in_progress" | "resolved" | "closed") => {
    switch (status) {
      case "open":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Open</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">In Progress</Badge>;
      case "resolved":
        return <Badge className="bg-green-500">Resolved</Badge>;
      case "closed":
        return <Badge variant="outline">Closed</Badge>;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: "low" | "medium" | "high") => {
    switch (priority) {
      case "low":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Low</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Medium</Badge>;
      case "high":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">High</Badge>;
      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/support">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Support Tickets
            </Link>
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{ticket.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-muted-foreground">Ticket #{id}</p>
              <span className="text-muted-foreground">•</span>
              <p className="text-muted-foreground">Created {formatDate(ticket.createdAt)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {ticket.messages.map((message) => (
                    <div key={message.id} className="flex gap-4">
                      <Avatar>
                        <AvatarImage src={`/avatars/${message.userId}.png`} />
                        <AvatarFallback>{message.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{message.userName}</p>
                          <Badge variant="outline" className="text-xs">
                            {message.userRole === "admin" ? "Admin" : 
                             message.userRole === "group_manager" ? "Group Manager" : "Student"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(message.timestamp)}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t mt-6 pt-6">
                  <h3 className="font-medium mb-2">Reply</h3>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Type your reply here..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={4}
                    />
                    <Button onClick={handleSendReply}>
                      <Send className="h-4 w-4 mr-2" />
                      Send Reply
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ticket Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    <Select value={status} onValueChange={(val) => handleStatusChange(val as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mt-2">{getStatusBadge(status)}</div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <div className="mt-1">
                    <Select value={priority} onValueChange={(val) => handlePriorityChange(val as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mt-2">{getPriorityBadge(priority)}</div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Submitted by</Label>
                  <div className="mt-1 border rounded-md p-3">
                    <p className="font-medium">{ticket.createdByName}</p>
                    <p className="text-sm text-muted-foreground">{ticket.createdByEmail}</p>
                    <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto" asChild>
                      <Link to={`/users/${ticket.createdBy}`}>
                        View Profile
                      </Link>
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Assigned to</Label>
                  <div className="mt-1 border rounded-md p-3">
                    {ticket.assignedTo ? (
                      <>
                        <p className="font-medium">{ticket.assignedToName}</p>
                        <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto">
                          Reassign
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" size="sm">Assign to me</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {status !== "resolved" && (
                  <Button className="w-full" onClick={() => handleStatusChange("resolved")}>
                    Mark as Resolved
                  </Button>
                )}
                {status !== "closed" && (
                  <Button variant="outline" className="w-full" onClick={() => handleStatusChange("closed")}>
                    Close Ticket
                  </Button>
                )}
                {(status === "resolved" || status === "closed") && (
                  <Button variant="outline" className="w-full" onClick={() => handleStatusChange("open")}>
                    Reopen Ticket
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
