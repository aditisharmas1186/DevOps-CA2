import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import AnalysisResult from "@/components/analysis-result";
import type { AnalysisResult as AnalysisResultType } from "@shared/schema";

export default function Reports() {
  const { data: analyses, isLoading } = useQuery<AnalysisResultType[]>({
    queryKey: ["/api/analyses"],
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Analysis Reports</h1>
        </div>

        {isLoading ? (
          <Card className="p-8">
            <div className="h-32 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          </Card>
        ) : !analyses?.length ? (
          <Card className="p-8 text-center">
            <CardHeader>
              <CardTitle>No Reports Yet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Upload a sample to get started with your first analysis
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {analyses.map((analysis) => (
              <AnalysisResult key={analysis.id} result={analysis} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
