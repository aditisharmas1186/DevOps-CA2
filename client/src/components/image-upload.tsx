import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, ImagePlus, Info } from "lucide-react";
import { classifyImage } from "@/lib/model";
import AnalysisResult from "./analysis-result";
import type { AnalysisResult as AnalysisResultType } from "@shared/schema";

// Helper function to convert from API response format to component format
function adaptToComponentFormat(result: any): {
  _id: string;
  imageUrl: string;
  results: {
    ec: number;      // E.coli
    sa: number;      // S.Aureus
    kp: number;      // Klebsiella Pneumonae
    invalid?: number; // Invalid classification

  };
  notes?: string;
  timestamp: string;
} {
  return {
    _id: result.id?.toString() || result._id || '',
    imageUrl: result.imageUrl,
    results: {
      ec: result.results?.ec || 0,
      sa: result.results?.sa || 0,
      kp: result.results?.kp || 0,
      invalid: result.results?.invalid || 0
    },
    notes: result.notes || '',
    timestamp: result.timestamp?.toString() || new Date().toString()
  };
}

export default function ImageUpload() {
  const [preview, setPreview] = useState<string>();
  const imageRef = useRef<HTMLImageElement>(null);
  const { toast } = useToast();
  const { register, handleSubmit, reset } = useForm();

  const { mutate, data: result, isPending, reset: resetMutation } = useMutation({
    mutationFn: async (data: { 
      image: string; 
      notes: string;
      classification: { ec: number; sa: number; kp: number; invalid: number; }
    }) => {
      const res = await apiRequest("POST", "/api/analyze", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Analysis Complete",
        description: "Your sample has been successfully analyzed",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to analyze image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file (JPG or PNG)",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = handleSubmit(async (data) => {
    if (!preview || !imageRef.current) return;

    try {
      // Classify the image using our ML model
      const classification = await classifyImage(imageRef.current);

      // Check if the image is invalid
      if (classification.invalid > 0.5) {
        toast({
          title: "Invalid Image",
          description: "Please upload a valid microscopic sample image.",
          variant: "destructive",
        });
        return;
      }

      mutate({
        image: preview.split(",")[1],
        notes: data.notes,
        classification
      });
    } catch (error) {
      toast({
        title: "Classification Error",
        description: "Failed to analyze the image. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleReset = () => {
    setPreview(undefined);
    reset();
    resetMutation();
    // Ensure we're actually resetting the view to the upload form
    if (result) {
      window.location.href = window.location.pathname;
    }
  };

  return (
    <>
      {result ? (
        <div className="space-y-4">
          <AnalysisResult result={adaptToComponentFormat(result)} />
          <Button onClick={handleReset} className="w-full" data-testid="analyze-another-button">
            Analyze Another Sample
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
            {preview ? (
              <div className="space-y-4">
                <img
                  ref={imageRef}
                  src={preview}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded"
                  data-testid="preview-image"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPreview(undefined)}
                  className="w-full"
                  data-testid="choose-different-image-button"
                >
                  <ImagePlus className="mr-2 h-4 w-4" />
                  Choose Different Image
                </Button>
              </div>
            ) : (
              <label className="block cursor-pointer" data-testid="upload-area">
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={onFileChange}
                  className="hidden"
                  data-testid="file-input"
                />
                <div className="py-8 px-4 flex flex-col items-center justify-center gap-2 text-muted-foreground min-h-[120px]">
                  <Upload className="h-8 w-8" />
                  <span className="font-medium">Drag and drop image or click to browse</span>
                  <div className="flex items-center gap-1 text-xs opacity-75">
                    <Info className="h-3 w-3" />
                    <span>Supported formats: JPG, PNG</span>
                  </div>
                </div>
              </label>
            )}
          </div>

          <Textarea
            placeholder="Additional notes about the sample..."
            {...register("notes")}
            className="min-h-[80px]"
            data-testid="notes-input"
          />

          <Button
            type="submit"
            disabled={!preview || isPending}
            className="w-full"
            data-testid="analyze-button"
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
                Analyzing...
              </div>
            ) : (
              "Analyze Sample"
            )}
          </Button>
        </form>
      )}
    </>
  );
}
