import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Microscope, Moon, Sun, Zap, Target, FlaskConical, Shield, RefreshCw } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import ImageUpload from "@/components/image-upload";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function Home() {
  const { theme, setTheme } = useTheme();

  // Fetch recent analyses for the Recent Analyses section
  const { data: recentAnalyses, isLoading: isLoadingAnalyses } = useQuery({
    queryKey: ['/api/analyses'],
    select: (data) => Array.isArray(data) ? data.slice(0, 5) : []
  });

  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTopBacteria = (results: any) => {
    if (!results) return { name: 'Unknown', confidence: 0 };
    
    const bacteria = [
      { key: 'ec', name: 'E. coli', confidence: results.ec || 0 },
      { key: 'sa', name: 'S. aureus', confidence: results.sa || 0 },
      { key: 'kp', name: 'K. pneumoniae', confidence: results.kp || 0 }
    ];
    
    const top = bacteria.reduce((max, current) => 
      current.confidence > max.confidence ? current : max
    );
    
    return { name: top.name, confidence: Math.round(top.confidence * 100) };
  };

  return (
    <div className="min-h-screen bg-background text-foreground dark:bg-gray-950">
      {/* Header */}
      <header className="border-b border-border bg-card dark:bg-gray-900 dark:border-gray-800">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Microscope className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-foreground dark:text-white" data-testid="app-title">PathoScan AI</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={handleThemeChange}
                data-testid="theme-toggle"
              />
              <Moon className="h-4 w-4" />
            </div>
            <Link href="/reports">
              <Button variant="outline" data-testid="view-reports-button">
                View All
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4" data-testid="page-title">
            Bacterial Pathogen Classification
          </h2>
          <p className="text-muted-foreground dark:text-gray-400 text-lg max-w-2xl mx-auto" data-testid="page-description">
            Upload an image of a bacterial sample to analyze and identify the pathogen. Our AI model classifies 
            ESKAPE pathogens with high accuracy.
          </p>
        </div>

        {/* Two Panel Layout */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left Panel - Upload */}
          <Card className="bg-card dark:bg-gray-900 border-border dark:border-gray-700" data-testid="upload-panel">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4" data-testid="upload-section-title">
                Upload Sample Image
              </h3>
              <div>
                <ImageUpload />
              </div>
            </CardContent>
          </Card>

          {/* Right Panel - Info & Recent Analyses */}
          <div className="space-y-8">
            {/* About PathoScan AI */}
            <Card className="bg-card dark:bg-gray-900 border-border dark:border-gray-700" data-testid="about-panel">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-6" data-testid="about-title">
                  About PathoScan AI
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-600 rounded-lg mt-1">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-600 dark:text-green-400" data-testid="feature-fast-title">
                        Fast Analysis
                      </h4>
                      <p className="text-sm text-muted-foreground dark:text-gray-400" data-testid="feature-fast-description">
                        Get results in seconds with our optimized AI model
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg mt-1">
                      <Target className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-500 dark:text-blue-400" data-testid="feature-accuracy-title">
                        High Accuracy
                      </h4>
                      <p className="text-sm text-muted-foreground dark:text-gray-400" data-testid="feature-accuracy-description">
                        Trained on extensive datasets from laboratory samples
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-600 rounded-lg mt-1">
                      <FlaskConical className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-500 dark:text-purple-400" data-testid="feature-research-title">
                        Research Grade
                      </h4>
                      <p className="text-sm text-muted-foreground dark:text-gray-400" data-testid="feature-research-description">
                        Developed with pathologists for reliable identification
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-600 rounded-lg mt-1">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-orange-500 dark:text-orange-400" data-testid="feature-privacy-title">
                        Privacy Focused
                      </h4>
                      <p className="text-sm text-muted-foreground dark:text-gray-400" data-testid="feature-privacy-description">
                        All processing happens locally in your browser
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Analyses */}
            <Card className="bg-card dark:bg-gray-900 border-border dark:border-gray-700" data-testid="recent-analyses-panel">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold" data-testid="recent-analyses-title">
                    Recent Analyses
                  </h3>
                  <Link href="/reports">
                    <Button variant="ghost" size="sm" data-testid="view-all-button">
                      View All
                    </Button>
                  </Link>
                </div>
                
                <div className="space-y-3">
                  {isLoadingAnalyses ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : recentAnalyses && recentAnalyses.length > 0 ? (
                    recentAnalyses.map((analysis: any, index: number) => {
                      const topResult = getTopBacteria(analysis.results);
                      return (
                        <div
                          key={analysis._id || index}
                          className="flex items-center justify-between p-3 bg-muted/50 dark:bg-gray-800 rounded-lg"
                          data-testid={`recent-analysis-${index}`}
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm" data-testid={`analysis-result-${index}`}>
                              {topResult.name} ({topResult.confidence}%)
                            </p>
                            <p className="text-xs text-muted-foreground dark:text-gray-400" data-testid={`analysis-timestamp-${index}`}>
                              {formatTimestamp(analysis.timestamp)}
                            </p>
                          </div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8" data-testid="no-analyses">
                      <RefreshCw className="h-12 w-12 text-muted-foreground dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-muted-foreground dark:text-gray-500">No recent analyses</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-border dark:border-gray-800 bg-background dark:bg-gray-950">
        <div className="container mx-auto px-6 py-6 text-center">
          <p className="text-sm text-muted-foreground dark:text-gray-500" data-testid="copyright">
            © 2025 PathoScan AI - Bacterial Pathogen Classification Tool
          </p>
          <p className="text-xs text-muted-foreground/80 dark:text-gray-600 mt-2" data-testid="disclaimer">
            For research and educational purposes only. Not for clinical diagnoses.
          </p>
        </div>
      </footer>
    </div>
  );
}