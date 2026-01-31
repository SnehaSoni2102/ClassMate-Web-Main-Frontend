import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Calendar, Loader2, Edit } from "lucide-react";
import { useGetCategoryTree } from "@/lib/api/queries/use-get-category-tree";
import { CategoryTreeItem } from "@/components/categories/CategoryTreeItem";
import { findLeafCategories } from "@/lib/utils";
import moment from "moment";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useUpdateCategoryPrices, type PricingPlanInput } from "@/lib/api/mutations/update-category-prices-mutation";
import { useQueryClient } from "@tanstack/react-query";

export default function CategoryDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetCategoryTree(id!);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPricingDialogOpen, setIsPricingDialogOpen] = useState(false);
  const [pricingPlans, setPricingPlans] = useState<{ duration: number; price: string }[]>([
    { duration: 1, price: "" },
    { duration: 3, price: "" },
    { duration: 6, price: "" },
    { duration: 12, price: "" },
  ]);
  const updateCategoryPrices = useUpdateCategoryPrices();

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !data?.data) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Category Not Found</h2>
          <p className="text-gray-500 mb-4">The category you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/categories">Back to Categories</Link>
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const category = data.data;
  const leafCategories = findLeafCategories(category);
  const isTopLevel = category.parent === null || typeof category.parent === "undefined";

  const openPricingDialog = () => {
    if (category.pricingPlans?.length) {
      const prefilled = [1, 3, 6, 12].map((d) => {
        const found = category.pricingPlans!.find((p) => Number(p.duration) === d);
        return { duration: d, price: found ? String(found.price) : "" };
      });
      setPricingPlans(prefilled);
    } else {
      setPricingPlans([
        { duration: 1, price: "" },
        { duration: 3, price: "" },
        { duration: 6, price: "" },
        { duration: 12, price: "" },
      ]);
    }
    setIsPricingDialogOpen(true);
  };

  const handleSaveCategoryPricing = async () => {
    const entries = pricingPlans.filter((p) => String(p.price).trim() !== "");
    if (entries.length === 0) {
      toast({ title: "No prices entered", description: "Enter at least one price to update.", variant: "destructive" });
      return;
    }
    const cleaned: PricingPlanInput[] = entries
      .map((p) => ({ duration: p.duration, price: Number(p.price) }))
      .filter((p) => !Number.isNaN(p.price) && p.price >= 0);
    if (cleaned.length === 0) {
      toast({ title: "Invalid input", description: "Enter valid non-negative prices.", variant: "destructive" });
      return;
    }
    try {
      await updateCategoryPrices.mutateAsync({ categoryId: category._id, pricingPlans: cleaned });
      toast({ title: "Pricing updated", description: "Category pricing plans updated." });
      setIsPricingDialogOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["get-category-tree", category._id] });
      await queryClient.invalidateQueries({ queryKey: ["get-top-categories"] });
    } catch (err: any) {
      toast({
        title: "Failed to update pricing",
        description: err?.response?.data?.message || err?.message || "Unknown error",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/categories">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Categories
            </Link>
          </Button>
        </div>

        {/* Category Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Category Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                <div className="h-24 w-24 rounded-lg border bg-white p-2">
                  <img
                    src={category.logo}
                    alt={category.name}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold">{category.name}</h2>
                    <p className="text-lg text-gray-600">{category.name_hi}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Created {moment(category.createdAt).format("MMM D, YYYY")}</span>
                    </div>
                    <Badge variant="outline">
                      {category.exams.length} Exams
                    </Badge>
                  </div>
                  {isTopLevel && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Pricing Plans</span>
                        <Button size="sm" variant="outline" onClick={openPricingDialog}>
                          <Edit className="h-4 w-4 mr-2" /> Manage
                        </Button>
                      </div>
                      {category.pricingPlans && category.pricingPlans.length ? (
                        <div className="flex flex-wrap gap-2">
                          {category.pricingPlans
                            .slice()
                            .sort((a, b) => Number(a.duration) - Number(b.duration))
                            .map((plan) => (
                              <Badge key={`${category._id}-${plan.duration}`} variant="secondary">
                                {plan.duration}m · ₹{plan.price}
                              </Badge>
                            ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">No plans configured</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Leaf Categories</span>
                  <Badge variant="secondary" className="text-lg">
                    {leafCategories.length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Total Exams</span>
                  <Badge variant="secondary" className="text-lg">
                    {leafCategories.reduce((total, leaf) => total + leaf.exams.length, 0)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Latest Update</span>
                  <span className="text-sm text-gray-500">
                    {moment(category.updatedAt).format("MMM D, YYYY")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Tree Structure */}
        <Card>
          <CardHeader>
            <CardTitle>Category Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryTreeItem 
              category={category} 
              onExamCreated={() => {
                // Refetch the category tree data
                window.location.reload();
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Manage Category Pricing Plans Dialog */}
      <Dialog open={isPricingDialogOpen} onOpenChange={setIsPricingDialogOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Update Pricing Plans</DialogTitle>
            <DialogDescription>
              Set subscription pricing for this top-level category. Amounts in INR.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {pricingPlans.map((plan, idx) => (
              <div key={plan.duration} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
                <div className="sm:col-span-2">
                  <Label>Duration (months)</Label>
                  <Input value={plan.duration} disabled readOnly />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor={`price-${idx}`}>Price (₹)</Label>
                  <Input
                    id={`price-${idx}`}
                    type="number"
                    min={0}
                    inputMode="numeric"
                    placeholder="Enter price"
                    value={plan.price}
                    onChange={(e) => {
                      const next = [...pricingPlans];
                      next[idx] = { ...next[idx], price: e.target.value };
                      setPricingPlans(next);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPricingDialogOpen(false)} disabled={updateCategoryPrices.isPending}>
              Cancel
            </Button>
            <Button onClick={handleSaveCategoryPricing} disabled={updateCategoryPrices.isPending}>
              {updateCategoryPrices.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
} 