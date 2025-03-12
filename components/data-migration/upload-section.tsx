import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { FileUp, Database, FileArchive, FileSpreadsheet, AlertTriangle, CheckCircle, Download } from 'lucide-react';
import { FileData } from '@/hooks/use-file-processor';

interface UploadSectionProps {
  fileData: FileData | null;
  isProcessing: boolean;
  error: string | null;
  success: string | null;
  onFileUpload: (file: File) => void;
  onLoadSample: () => void;
}

/**
 * Upload Section Component
 * 
 * Handles file upload and displays upload status
 */
const UploadSection: React.FC<UploadSectionProps> = ({
  fileData,
  isProcessing,
  error,
  success,
  onFileUpload,
  onLoadSample
}) => {
  // File input reference
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  /**
   * Handles file selection from the file input
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
    
    // Reset the input value so the same file can be uploaded again
    event.target.value = '';
  };

  /**
   * Returns the appropriate icon for a file type
   */
  const getFileTypeIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'csv':
        return <FileSpreadsheet className="w-4 h-4" />;
      case 'xlsx':
      case 'xls':
        return <FileSpreadsheet className="w-4 h-4" />;
      case 'sql':
        return <Database className="w-4 h-4" />;
      default:
        return <FileArchive className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col gap-8" data-testid="upload-section">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Upload Legacy Data</CardTitle>
          </CardHeader>
          <CardContent>
            {/* File Upload Area */}
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept=".csv,.xlsx,.xls,.sql"
                aria-label="Upload file"
              />
              <div className="space-y-4">
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                  disabled={isProcessing}
                >
                  <FileUp className="w-4 h-4 mr-2" />
                  Select File
                </Button>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">or</p>
                  <Button 
                    variant="outline" 
                    onClick={onLoadSample}
                    disabled={isProcessing}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Load Sample Baltimore Data
                  </Button>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground mt-4">
                Supported formats: CSV, Excel (.xlsx, .xls), SQL backup files
              </div>
            </div>
            
            {/* File Info Card */}
            {fileData && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getFileTypeIcon(fileData.fileType)}
                    <span className="font-medium">{fileData.fileName}</span>
                  </div>
                  <span className="px-2 py-1 bg-primary/10 rounded-full text-xs font-medium">
                    {fileData.fileType.toUpperCase()}
                  </span>
                </div>
                {fileData.parsedData && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    {fileData.parsedData.length} records loaded
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Migration Capabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 text-green-500">✓</div>
                <div>
                  <p className="font-medium">SQL Expertise</p>
                  <p className="text-sm text-muted-foreground">
                    Writing queries from scratch and working with multiple tables
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 text-green-500">✓</div>
                <div>
                  <p className="font-medium">Data Format Handling</p>
                  <p className="text-sm text-muted-foreground">
                    CSV, Excel, SQL dumps and delimited files
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 text-green-500">✓</div>
                <div>
                  <p className="font-medium">GIS Components</p>
                  <p className="text-sm text-muted-foreground">
                    Geographic data parsing and visualization
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 text-green-500">✓</div>
                <div>
                  <p className="font-medium">Relational Structures</p>
                  <p className="text-sm text-muted-foreground">
                    Understanding of database schemas and relationships
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Status Messages */}
      {isProcessing && (
        <div className="p-4 border-l-4 border-blue-500 bg-blue-50 text-blue-700">
          <div className="flex items-center">
            <div className="spinner mr-2 animate-spin">⟳</div>
            <h3 className="font-bold">Processing</h3>
          </div>
          <p>Please wait while your file is being processed...</p>
        </div>
      )}
      
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default UploadSection;