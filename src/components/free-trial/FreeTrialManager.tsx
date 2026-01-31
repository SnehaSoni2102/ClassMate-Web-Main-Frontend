import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useGetFreeTrial } from "@/lib/api/queries/use-get-free-trial";
import { useUpdateFreeTrial } from "@/lib/api/mutations/update-free-trial-mutation";
import { Calendar, Clock, Save, Edit3 } from "lucide-react";

const FreeTrialManager = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [trialDays, setTrialDays] = useState<number>(0);
  const { toast } = useToast();

  const { data, isLoading, error } = useGetFreeTrial();
  const updateMutation = useUpdateFreeTrial();

  // Get the active free trial (assuming there's only one active)
  const activeTrial = data?.data?.find(trial => trial.isActive) || data?.data?.[0];

  React.useEffect(() => {
    if (activeTrial) {
      setTrialDays(activeTrial.days);
    }
  }, [activeTrial]);

  // Handle error with useEffect to avoid infinite re-renders
  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load free trial data",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleSave = async () => {
    if (!activeTrial) {
      toast({
        title: "Error",
        description: "No active trial found to update",
        variant: "destructive",
      });
      return;
    }

    if (trialDays < 0) {
      toast({
        title: "Error",
        description: "Trial days cannot be negative",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateMutation.mutateAsync({
        trialId: activeTrial._id,
        days: trialDays,
      });

      setIsEditing(false);
      toast({
        title: "Success",
        description: `Free trial days updated to ${trialDays} days`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update free trial days",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    if (activeTrial) {
      setTrialDays(activeTrial.days);
    }
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Free Trial Management
        </CardTitle>
        <CardDescription>
          Configure the number of free trial days for new user signups
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        ) : activeTrial ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Label htmlFor="trial-days" className="text-sm font-medium">
                  Free Trial Days:
                </Label>
                {isEditing ? (
                  <Input
                    id="trial-days"
                    type="number"
                    min="0"
                    value={trialDays}
                    onChange={(e) => setTrialDays(parseInt(e.target.value) || 0)}
                    className="w-20"
                  />
                ) : (
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {trialDays} {trialDays === 1 ? 'day' : 'days'}
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={updateMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      {updateMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={updateMutation.isPending}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-50 hover:bg-blue-100 border-blue-200"
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Created: {formatDate(activeTrial.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Updated: {formatDate(activeTrial.updatedAt)}</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> New users signing up will receive {trialDays} {trialDays === 1 ? 'day' : 'days'} of free access to the platform.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-500">No free trial configuration found</p>
            <p className="text-sm text-gray-400">Please contact support to set up free trial configuration</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FreeTrialManager;
