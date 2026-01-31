import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, BookOpen, Loader2, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCreateCategory } from "@/lib/api/mutations/create-category-mutation";
import { useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { Link } from "react-router-dom";
import { useGetTopCategories } from "@/lib/api/queries/use-get-top-categories";
import { Badge } from "@/components/ui/badge";
import { useUpdateAllCategoryPrices, type PricingPlanInput } from "@/lib/api/mutations/update-all-category-prices-mutation";

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isManagePricingOpen, setIsManagePricingOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryNameHi, setNewCategoryNameHi] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [newCategoryDescriptionHi, setNewCategoryDescriptionHi] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [pricingPlans, setPricingPlans] = useState<{ duration: number; price: string }[]>([
    { duration: 1, price: "" },
    { duration: 3, price: "" },
    { duration: 6, price: "" },
    { duration: 12, price: "" },
  ]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get categories with search
  const { data, isLoading } = useGetTopCategories();
  const createCategory = useCreateCategory();
  const updateAllPrices = useUpdateAllCategoryPrices();

  const handleAddCategory = async () => {
    if (!newCategoryName.trim() || !newCategoryNameHi.trim() || !newCategoryDescription.trim() || !newCategoryDescriptionHi.trim()) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    if (!logoFile) {
      toast({
        title: "Error",
        description: "Please select a logo image",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("name", newCategoryName);
    formData.append("name_hi", newCategoryNameHi);
    formData.append("description", newCategoryDescription);
    formData.append("description_hi", newCategoryDescriptionHi);
    formData.append("logo", logoFile);

    try {
      await createCategory.mutateAsync(formData);
      toast({
        title: "Category Added",
        description: `${newCategoryName} has been added successfully.`,
      });
      setNewCategoryName("");
      setNewCategoryNameHi("");
      setNewCategoryDescription("");
      setNewCategoryDescriptionHi("");
      setLogoFile(null);
      setIsAddDialogOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["get-categories"] }),
        queryClient.invalidateQueries({ queryKey: ["get-top-categories"] }),
      ]);
    } catch (err: any) {
      toast({
        title: "Failed to add category",
        description: err?.response?.data?.message || err?.message || "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLogoFile(file);
  };

  const searchedData = data?.data?.filter((category) => category.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const openManagePricing = () => {
    // Keep inputs empty here; categories can have different existing prices
    setPricingPlans([
      { duration: 1, price: "" },
      { duration: 3, price: "" },
      { duration: 6, price: "" },
      { duration: 12, price: "" },
    ]);
    setIsManagePricingOpen(true);
  };

  const handleSubmitAllPricing = async () => {
    // Only include durations where a price is provided
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
      await updateAllPrices.mutateAsync(cleaned);
      toast({ title: "Pricing updated", description: "All categories' pricing plans updated." });
      setIsManagePricingOpen(false);
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Exam Categories</h2>
            <p className="text-gray-500 mt-2">
              Manage exam categories for various competitive and academic exams
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={openManagePricing} className="whitespace-nowrap">
              Manage All Pricing
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)} className="hidden md:inline-flex">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Input
              type="search"
              placeholder="Search categories..."
              className="w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Logo</TableHead>
                <TableHead>Category Name</TableHead>
                <TableHead>Category Name (Hindi)</TableHead>
                <TableHead className="min-w-[220px]">Pricing Plans</TableHead>
                <TableHead>Created Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : !searchedData?.length ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center">
                      <BookOpen className="h-10 w-10 text-gray-300 mb-2" />
                      <p className="font-medium text-gray-500">No categories found</p>
                      <p className="text-sm text-gray-400">
                        {searchTerm
                          ? "Try adjusting your search criteria"
                          : "Create your first category to get started"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                searchedData.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell>
                      {category.logo && (
                        <img
                          src={category.logo}
                          alt={category.name}
                          className="h-10 w-10 object-contain"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Link to={`/categories/${category._id}`} className="font-medium text-blue-500 hover:underline">{category.name}</Link>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{category.name_hi}</div>
                    </TableCell>
                    <TableCell>
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
                        <span className="text-sm text-gray-400">No plans</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {moment(category.createdAt).format('DD MMM YYYY')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Add Category Shortcut */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>
              Create a new category for exams
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Category Name (English) *</Label>
              <Input
                id="category-name"
                placeholder="e.g., SSC"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-name-hi">Category Name (Hindi) *</Label>
              <Input
                id="category-name-hi"
                placeholder="e.g., एसएससी"
                value={newCategoryNameHi}
                onChange={(e) => setNewCategoryNameHi(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-description">Description (English) *</Label>
              <Textarea
                id="category-description"
                placeholder="Enter category description..."
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                rows={3}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-description-hi">Description (Hindi) *</Label>
              <Textarea
                id="category-description-hi"
                placeholder="Enter category description in Hindi..."
                value={newCategoryDescriptionHi}
                onChange={(e) => setNewCategoryDescriptionHi(e.target.value)}
                rows={3}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-logo">Logo *</Label>
              <Input
                id="category-logo"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                required
              />
              {logoFile && (
                <div className="mt-2">
                  <img
                    src={URL.createObjectURL(logoFile)}
                    alt="Preview"
                    className="h-20 w-20 object-contain border rounded"
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddCategory}
              disabled={createCategory.isPending}
            >
              {createCategory.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Category'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage All Pricing Plans Dialog */}
      <Dialog open={isManagePricingOpen} onOpenChange={setIsManagePricingOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Update Pricing Plans (All Categories)</DialogTitle>
            <DialogDescription>
              Set subscription pricing for all top-level categories. Amounts in INR.
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
            <Button variant="outline" onClick={() => setIsManagePricingOpen(false)} disabled={updateAllPrices.isPending}>
              Cancel
            </Button>
            <Button onClick={handleSubmitAllPricing} disabled={updateAllPrices.isPending}>
              {updateAllPrices.isPending ? (
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
