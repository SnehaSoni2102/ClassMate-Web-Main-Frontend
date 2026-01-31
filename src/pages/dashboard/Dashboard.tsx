
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import TestSelector from "@/components/selectors/TestSelector";
import { Option } from "@/components/ui/multiple-selector";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCreateBanner } from "@/lib/api/mutations/create-banner-mutation";
import { useGetBanners } from "@/lib/api/queries/use-get-banners";
import { useDeleteBanner } from "@/lib/api/mutations/delete-banner-mutation";
import { useQueryClient } from "@tanstack/react-query";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { ConfirmDeleteModal } from "@/components/modals/ConfirmDeleteModal";
import { Trash2 } from "lucide-react";
import FreeTrialManager from "@/components/free-trial/FreeTrialManager";

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [type, setType] = useState<"test" | "payment" | "other">("payment");
  const [selectedTest, setSelectedTest] = useState<Option[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isValidAspect, setIsValidAspect] = useState<boolean>(false);

  // Delete state
  const [deleteBannerId, setDeleteBannerId] = useState<string | null>(null);

  const { data: bannersResponse, isLoading: bannersLoading } = useGetBanners();
  const { mutate: createBanner, isPending: isUploading } = useCreateBanner();
  const { mutate: deleteBanner, isPending: isDeleting } = useDeleteBanner();

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const validateAspectRatio = (file: File) => {
    return new Promise<boolean>((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        const expected = 16 / 9;
        const actual = width / height;
        const isValid = Math.abs(actual - expected) / expected <= 0.01; // within 1%
        URL.revokeObjectURL(url);
        resolve(isValid);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(false);
      };
      img.src = url;
    });
  };

  const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(null);
    setIsValidAspect(false);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (!file) return;
    const ok = await validateAspectRatio(file);
    if (!ok) {
      toast({
        title: "Invalid banner size",
        description: "Image must be 16:9 (within 1% tolerance).",
        variant: "destructive",
      });
      return;
    }
    setImageFile(file);
    setIsValidAspect(true);
    setImagePreview(URL.createObjectURL(file));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      toast({ title: "No image", description: "Please select an image.", variant: "destructive" });
      return;
    }
    if (!isValidAspect) {
      toast({ title: "Invalid aspect", description: "Please upload a 16:9 image.", variant: "destructive" });
      return;
    }
    if (type === "test" && (!selectedTest.length || !selectedTest[0]?.value)) {
      toast({ title: "Test required", description: "Select a test for test-type banner.", variant: "destructive" });
      return;
    }

    const formData = new FormData();
    formData.append("type", type);
    formData.append("image", imageFile);
    if (type === "test" && selectedTest[0]?.value) {
      formData.append("testId", String(selectedTest[0].value));
    }

    createBanner(formData, {
      onSuccess: () => {
        // Full page refresh after successful upload as requested
        window.location.reload();
      },
      onError: (error: any) => {
        toast({ title: "Upload failed", description: error?.message || "Please try again.", variant: "destructive" });
      },
    });
  };

  const handleDeleteBanner = () => {
    if (!deleteBannerId) return;

    deleteBanner(deleteBannerId, {
      onSuccess: () => {
        // Full page refresh after successful deletion
        window.location.reload();
      },
      onError: (error: any) => {
        toast({ title: "Delete failed", description: error?.message || "Please try again.", variant: "destructive" });
        setDeleteBannerId(null);
      },
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-gray-500 mt-2">Welcome back, {user?.name || 'Admin'}!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Banner Management */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload Banner</CardTitle>
                <CardDescription>Upload a 16:9 banner for tests or payments</CardDescription>
              </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={onSubmit}>
                <div className="space-y-2">
                  <Label>Banner Type</Label>
                  <RadioGroup value={type} onValueChange={(v) => setType(v as "test" | "payment" | "other")} className="flex flex-row gap-6">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="payment" id="payment" />
                      <Label htmlFor="payment">Payment</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="test" id="test" />
                      <Label htmlFor="test">Test</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other">Other</Label>
                    </div>
                  </RadioGroup>
                </div>

                {type === "test" && (
                  <div className="space-y-2">
                    <Label>Select Test</Label>
                    <TestSelector
                      multiple={false}
                      value={selectedTest}
                      onChange={(val) => setSelectedTest(val)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="banner">Banner Image (16:9)</Label>
                  <Input id="banner" type="file" accept="image/*" onChange={onImageChange} />
                  <p className="text-xs text-gray-500">Recommended size: 1600x900 or any 16:9 ratio. We validate within 1% tolerance.</p>
                </div>

                {imagePreview && (
                  <div className="max-w-xl">
                    <AspectRatio ratio={16/9}>
                      <img src={imagePreview} alt="Preview" className="h-full w-full rounded-md object-cover border" />
                    </AspectRatio>
                  </div>
                )}

                <div>
                  <Button type="submit" disabled={isUploading}>{isUploading ? "Uploading..." : "Upload Banner"}</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing Banners</CardTitle>
              <CardDescription>These are used in the mobile app carousel</CardDescription>
            </CardHeader>
            <CardContent>
              {bannersLoading ? (
                <div className="text-sm text-gray-500">Loading banners...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bannersResponse?.data?.map((b) => (
                    <div key={b._id} className="space-y-2 relative">
                      <div className="absolute top-2 right-2 z-10">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteBannerId(b._id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <AspectRatio ratio={16/9}>
                        <img src={b.image} alt={b.type} className="h-full w-full rounded-md object-cover border" />
                      </AspectRatio>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{b.type}</Badge>
                        <span className="text-xs text-gray-500">{new Date(b.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                  {!bannersResponse?.data?.length && (
                    <div className="text-sm text-gray-500">No banners found.</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          </div>

          {/* Right Column - Free Trial & Quick Actions */}
          <div className="space-y-4">
            <FreeTrialManager />

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks you might want to perform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {[
                  { title: "Create New Test", href: "/tests/create" },
                  { title: "Create All India Test", href: "/tests/create-all-india" },
                  { title: "Add Question to Question Bank", href: "/questions/create" },
                  { title: "View Student Queries", href: "/support" },
                  { title: "View Test Results", href: "/tests" },
                ].map((action, i) => (
                  <a 
                    key={i}
                    href={action.href}
                    className="flex items-center gap-3 rounded-md border border-gray-200 p-3 text-sm font-medium transition-colors hover:bg-blue-50 hover:text-blue-700"
                  >
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-700">{i + 1}</span>
                    </div>
                    {action.title}
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          </div>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={!!deleteBannerId}
        onClose={() => setDeleteBannerId(null)}
        onConfirm={handleDeleteBanner}
        isLoading={isDeleting}
        title="Delete Banner"
        description="Are you sure you want to delete this banner? This action cannot be undone."
      />
    </AdminLayout>
  );
};



export default Dashboard;
