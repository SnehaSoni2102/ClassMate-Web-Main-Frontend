
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, UserPlus, User } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface EditGroupDialogProps {
  group: GroupDetails;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedGroup: GroupDetails) => void;
}

export function EditGroupDialog({ group, isOpen, onClose, onSave }: EditGroupDialogProps) {
  const [editedGroup, setEditedGroup] = useState<GroupDetails>({...group});
  const [searchTerm, setSearchTerm] = useState("");
  const [adminSearchOpen, setAdminSearchOpen] = useState(false);
  
  const handleInputChange = (field: string, value: string | boolean) => {
    setEditedGroup(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSave = () => {
    // Update counts
    const updatedGroup = {
      ...editedGroup,
      studentCount: editedGroup.members.filter(m => m.role === "student").length,
      managerCount: editedGroup.members.filter(m => m.role === "manager").length,
      // Update admin details as well
      adminName: editedGroup.members.find(m => m.role === "admin")?.name || editedGroup.adminName,
      adminPhone: editedGroup.members.find(m => m.role === "admin")?.phone || editedGroup.adminPhone
    };
    
    onSave(updatedGroup);
  };
  
  const changeUserRole = (userId: string, newRole: string) => {
    // If changing to admin, previous admin becomes a manager
    if (newRole === "admin") {
      setEditedGroup(prev => ({
        ...prev,
        members: prev.members.map(member => {
          if (member.role === "admin") {
            return { ...member, role: "manager" };
          }
          if (member.id === userId) {
            return { ...member, role: "admin" };
          }
          return member;
        })
      }));
    } else {
      // Standard role change
      setEditedGroup(prev => ({
        ...prev,
        members: prev.members.map(member => 
          member.id === userId ? { ...member, role: newRole } : member
        )
      }));
    }
  };
  
  // Filter members based on search term
  const filteredMembers = editedGroup.members.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    member.phone.includes(searchTerm)
  );
  
  // Organize members by role
  const adminMember = editedGroup.members.find(m => m.role === "admin");
  const managerMembers = editedGroup.members.filter(m => m.role === "manager");
  const studentMembers = editedGroup.members.filter(m => m.role === "student");
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Group</DialogTitle>
          <DialogDescription>
            Make changes to the group settings and member roles
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Group Name</Label>
                <Input
                  id="name"
                  value={editedGroup.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="visibility">Visibility</Label>
                  <Select 
                    value={editedGroup.isPublic ? "public" : "private"}
                    onValueChange={(value) => handleInputChange("isPublic", value === "public")}
                  >
                    <SelectTrigger id="visibility">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch 
                      id="status" 
                      checked={editedGroup.isActive}
                      onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                    />
                    <Label htmlFor="status" className="cursor-pointer">
                      {editedGroup.isActive ? "Active" : "Inactive"}
                    </Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 pt-4">
                <Label>Group Admin</Label>
                
                {adminMember ? (
                  <div className="border rounded-md p-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="font-medium">{adminMember.name}</p>
                        <p className="text-sm text-gray-500">{adminMember.phone}</p>
                      </div>
                    </div>
                    <Popover open={adminSearchOpen} onOpenChange={setAdminSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="ml-auto">
                          Change Admin
                          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0" align="end">
                        <Command>
                          <CommandInput placeholder="Search members..." className="h-9" />
                          <CommandList>
                            <CommandEmpty>No members found.</CommandEmpty>
                            <CommandGroup heading="Managers">
                              {managerMembers.map((member) => (
                                <CommandItem
                                  key={member.id}
                                  value={member.id}
                                  onSelect={() => {
                                    changeUserRole(member.id, "admin");
                                    setAdminSearchOpen(false);
                                  }}
                                  className="flex items-center gap-2 text-sm"
                                >
                                  <UserPlus className="h-4 w-4" />
                                  <span>{member.name}</span>
                                  <span className="text-gray-500 ml-1">
                                    {member.phone}
                                  </span>
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      adminMember.id === member.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                            <CommandGroup heading="Students">
                              {studentMembers.map((member) => (
                                <CommandItem
                                  key={member.id}
                                  value={member.id}
                                  onSelect={() => {
                                    changeUserRole(member.id, "admin");
                                    setAdminSearchOpen(false);
                                  }}
                                  className="flex items-center gap-2 text-sm"
                                >
                                  <User className="h-4 w-4" />
                                  <span>{member.name}</span>
                                  <span className="text-gray-500 ml-1">
                                    {member.phone}
                                  </span>
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      adminMember.id === member.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                ) : (
                  <div className="border rounded-md p-3 bg-yellow-50 border-yellow-300">
                    <p className="text-yellow-600">No group admin found. Please select one from the members.</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-2 pt-4">
                <div className="flex justify-between items-center">
                  <Label>Group Managers ({managerMembers.length})</Label>
                  <Input
                    placeholder="Search members..."
                    className="w-48"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {managerMembers.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No managers assigned</p>
                  ) : (
                    managerMembers
                      .filter(m => 
                        m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        m.phone.includes(searchTerm)
                      )
                      .map((manager) => (
                        <div key={manager.id} className="border rounded-md p-2 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <UserPlus className="h-4 w-4 text-gray-500" />
                            <div>
                              <p>{manager.name}</p>
                              <p className="text-sm text-gray-500">{manager.phone}</p>
                            </div>
                          </div>
                          <Select
                            value={manager.role}
                            onValueChange={(value) => changeUserRole(manager.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="student">Student</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ))
                  )}
                </div>
              </div>
              
              <div className="space-y-2 pt-4">
                <div className="flex justify-between items-center">
                  <Label>Group Students ({studentMembers.length})</Label>
                </div>
                
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {studentMembers.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No students assigned</p>
                  ) : (
                    studentMembers
                      .filter(m => 
                        m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        m.phone.includes(searchTerm)
                      )
                      .map((student) => (
                        <div key={student.id} className="border rounded-md p-2 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <div>
                              <p>{student.name}</p>
                              <p className="text-sm text-gray-500">{student.phone}</p>
                            </div>
                          </div>
                          <Select
                            value={student.role}
                            onValueChange={(value) => changeUserRole(student.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="student">Student</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
        
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
