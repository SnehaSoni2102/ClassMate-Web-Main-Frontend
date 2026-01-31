import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCreateTopic } from "@/lib/api/mutations/create-topic-mutation";
import { useQueryClient } from "@tanstack/react-query";

export default function CreateTopic() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createTopic = useCreateTopic();
  const queryClient = useQueryClient();
  
  const [name, setName] = useState("");
  const [nameHi, setNameHi] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !nameHi.trim()) {
      toast({
        title: "Error",
        description: "Topic names cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      await createTopic.mutateAsync({ name, name_hi: nameHi });
      toast({
        title: "Topic Created",
        description: `${name} has been created successfully.`,
      });
      await queryClient.invalidateQueries({ queryKey: ["search-topics"] });
      navigate("/topics");
    } catch (err: any) {
      toast({
        title: "Failed to create topic",
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
            <Link to="/topics">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Topics
            </Link>
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Topic</h1>
          <p className="text-muted-foreground mt-1">
            Create a new topic to organize questions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Topic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Topic Name (English)</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Mechanics"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name_hi">Topic Name (Hindi)</Label>
                  <Input
                    id="name_hi"
                    placeholder="e.g., यांत्रिकी"
                    value={nameHi}
                    onChange={(e) => setNameHi(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => navigate("/topics")}>
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={createTopic.isPending}
            >
              {createTopic.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Topic'
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}