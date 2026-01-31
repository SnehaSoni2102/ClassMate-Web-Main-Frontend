import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useBulkUploadQuestions } from "@/lib/api/mutations/bulk-upload-questions-mutation";
import { useQueryClient } from "@tanstack/react-query";
import { Upload, Loader2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function BulkUploadQuestionsModal({ isOpen, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutate: uploadQuestions, isPending } = useBulkUploadQuestions();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.type === "text/csv" ||
        selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        selectedFile.type === "application/vnd.ms-excel"
      ) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a CSV or Excel file",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpload = () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    uploadQuestions(formData, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Questions uploaded successfully",
        });
        queryClient.invalidateQueries({ queryKey: ["get-questions"] });
        onClose();
        setFile(null);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to upload questions",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Upload Questions</DialogTitle>
          <DialogDescription>
            Upload multiple questions using a CSV or Excel file. Make sure your file follows the required format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">CSV or Excel files only</p>
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {file && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{file.name}</span>
                <span className="text-xs text-gray-500">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFile(null)}
                disabled={isPending}
              >
                Remove
              </Button>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!file || isPending}>
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Questions"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 