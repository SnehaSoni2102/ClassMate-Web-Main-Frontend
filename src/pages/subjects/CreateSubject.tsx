import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCreateSubject } from "@/lib/api/mutations/create-subject-mutation";
import { useQueryClient } from "@tanstack/react-query";

export default function CreateSubject() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createSubject = useCreateSubject();
  const queryClient = useQueryClient();
  
  const [name, setName] = useState("");
  const [nameHi, setNameHi] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !nameHi.trim()) {
      toast({
        title: "Error",
        description: "Subject names cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      await createSubject.mutateAsync({ name, name_hi: nameHi });
      toast({
        title: "Subject Created",
        description: `${name} has been created successfully.`,
      });
      await queryClient.invalidateQueries({ queryKey: ["search-subjects"] });
      navigate("/subjects");
    } catch (err: any) {
      toast({
        title: "Failed to create subject",
        description: err?.response?.data?.message || err?.message || "Unknown error",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/subjects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Subjects
            </Link>
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Subject</h1>
          <p className="text-muted-foreground mt-1">
            Create a new subject to organize topics and questions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Subject Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Subject Name (English)</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Physics"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name_hi">Subject Name (Hindi)</Label>
                  <Input
                    id="name_hi"
                    placeholder="e.g., भौतिक विज्ञान"
                    value={nameHi}
                    onChange={(e) => setNameHi(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => navigate("/subjects")}>
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={createSubject.isPending}
            >
              {createSubject.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Subject'
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}