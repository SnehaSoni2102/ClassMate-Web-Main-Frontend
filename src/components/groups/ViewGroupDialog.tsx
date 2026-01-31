
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, UserPlus, User } from "lucide-react";

interface Member {
  id: string;
  name: string;
  role: string;
  phone: string;
}

interface GroupDetails {
  id: string;
  name: string;
  adminName: string;
  adminPhone: string;
  isPublic: boolean;
  isActive: boolean;
  createdAt: string;
  studentCount: number;
  managerCount: number;
  members: Member[];
}

interface ViewGroupDialogProps {
  group: GroupDetails;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewGroupDialog({ group, isOpen, onClose }: ViewGroupDialogProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  const groupAdminDetails = group.members.find(member => member.role === "admin") || {
    name: group.adminName,
    phone: group.adminPhone
  };

  const managers = group.members.filter(member => member.role === "manager");
  const students = group.members.filter(member => member.role === "student");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">{group.name}</DialogTitle>
          <DialogDescription>
            Group details and members information
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Status</p>
            <div className="flex gap-2">
              <Badge className={group.isPublic ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                {group.isPublic ? "Public" : "Private"}
              </Badge>
              <Badge className={group.isActive ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"}>
                {group.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Created On</p>
            <p>{formatDate(group.createdAt)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Group Admin</p>
            <p>{groupAdminDetails.name}</p>
            <p className="text-sm text-gray-500">{groupAdminDetails.phone}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Member Count</p>
            <div className="flex gap-4">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-gray-400" />
                <span>{group.studentCount} Students</span>
              </div>
              <div className="flex items-center gap-1">
                <UserPlus className="h-4 w-4 text-gray-400" />
                <span>{group.managerCount} Managers</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h3 className="font-medium mb-3">Group Members</h3>
          <ScrollArea className="h-[280px] rounded-md border p-2">
            <div className="space-y-4">
              {managers.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Managers</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {managers.map(manager => (
                        <TableRow key={manager.id}>
                          <TableCell className="flex items-center gap-2">
                            <UserPlus className="h-4 w-4 text-gray-400" />
                            {manager.name}
                          </TableCell>
                          <TableCell>{manager.phone}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              {students.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Students</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map(student => (
                        <TableRow key={student.id}>
                          <TableCell className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            {student.name}
                          </TableCell>
                          <TableCell>{student.phone}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
