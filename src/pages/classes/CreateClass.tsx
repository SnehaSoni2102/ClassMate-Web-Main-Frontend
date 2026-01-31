import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCreateClass } from "@/lib/api/mutations/create-class-mutation";
import { useQueryClient } from "@tanstack/react-query";

export default function CreateClass() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  
  const { mutate: createClass, isPending } = useCreateClass();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a class name",
        variant: "destructive",
      });
      return;
    }

    createClass(
      { name },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Class created successfully",
          });
          queryClient.invalidateQueries({ queryKey: ["search-classes"] });
          navigate("/classes");
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to create class",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/classes">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Classes
            </Link>
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Class</h1>
          <p className="text-muted-foreground mt-1">
            Create a new class to organize your content.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Class Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Class Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter class name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => navigate("/classes")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Class"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}