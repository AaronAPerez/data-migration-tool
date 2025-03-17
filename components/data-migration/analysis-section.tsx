import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  BarChart, Database, Table2, DownloadCloud, Map 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataAnalysis } from '@/types/shared-types';
import GISVisualization from './gis-visualization';

interface AnalysisSectionProps {
  dataAnalysis: DataAnalysis | null;
  parsedData?: Record<string, string | number | boolean | null>[];
}

/**
 * Analysis Section Component
 * 
 * Displays detailed analysis of uploaded data with multiple visualization tabs
 */
const AnalysisSection = ({ dataAnalysis, parsedData }: AnalysisSectionProps) => {
  const [analysisTab, setAnalysisTab] = useState('structure');

  /**
   * Handle CSV export
   */
  const handleExportData = () => {
    if (!parsedData) return;
    
    // Create CSV content
    const headers = Object.keys(parsedData[0] || {}).join(',');
    const rows = parsedData.map(row => 
      Object.values(row).map(val => 
        val === null || val === undefined ? '' : 
        typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
      ).join(',')
    ).join('\n');
    
    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'exported_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!dataAnalysis) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <Database className="mx-auto h-12 w-12 opacity-20 mb-4" />
        <h3 className="text-lg font-medium mb-2">No Data Available</h3>
        <p>Upload a file to see data analysis here.</p>
      </div>
    );
  }

  // Extract data for GIS visualization if present
  const gisData = dataAnalysis.hasGisData && parsedData ? 
    parsedData.map(row => {
      const latField = Object.keys(row).find(key => key.toLowerCase().includes('lat'));
      const lonField = Object.keys(row).find(key => key.toLowerCase().includes('lon'));
      
      if (!latField || !lonField) return null;
      
      const lat = parseFloat(String(row[latField] || '0'));
      const lon = parseFloat(String(row[lonField] || '0'));
      
      if (isNaN(lat) || isNaN(lon)) return null;
      
      return {
        id: String(row.incident_id || row.id || Math.random().toString(36).substring(2, 9)),
        lat,
        lon,
        name: String(row.address || row.incident_type || 'Location'),
        type: String(row.incident_type || 'Unknown')
      };
    }).filter(Boolean) : 
    [];

  return (
    <div className="space-y-6" data-testid="analysis-section">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Data Analysis</h2>
          <p className="text-muted-foreground">
            Analyzing {dataAnalysis.rowCount} records with {dataAnalysis.columnCount} columns
          </p>
        </div>
        
        <Button
          variant="outline"
          onClick={handleExportData}
          disabled={!parsedData}
        >
          <DownloadCloud className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>
      
      <Tabs value={analysisTab} onValueChange={setAnalysisTab}>
        <TabsList>
          <TabsTrigger value="structure">
            <Database className="mr-2 h-4 w-4" />
            Structure
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Table2 className="mr-2 h-4 w-4" />
            Data Preview
          </TabsTrigger>
          {dataAnalysis.hasGisData && (
            <TabsTrigger value="geo">
              <Map className="mr-2 h-4 w-4" />
              Geographic Data
            </TabsTrigger>
          )}
          <TabsTrigger value="stats">
            <BarChart className="mr-2 h-4 w-4" />
            Statistics
          </TabsTrigger>
        </TabsList>
        
        {/* Structure Analysis Tab */}
        <TabsContent value="structure">
          <Card>
            <CardHeader>
              <CardTitle>Data Structure Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Overview</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Rows:</span>
                        <span className="font-medium">{dataAnalysis.rowCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Columns:</span>
                        <span className="font-medium">{dataAnalysis.columnCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GIS Data:</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          dataAnalysis.hasGisData ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-800'
                        }`}>
                          {dataAnalysis.hasGisData ? "Detected" : "Not Found"}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {dataAnalysis.possiblePrimaryKeys.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Potential ID Fields</h3>
                      <div className="space-y-1">
                        {dataAnalysis.possiblePrimaryKeys.map(key => (
                          <Badge key={key} variant="outline" className="mr-1">
                            {key}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {dataAnalysis.possibleForeignKeys.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Potential Reference Fields</h3>
                      <div className="space-y-1">
                        {dataAnalysis.possibleForeignKeys.map(key => (
                          <Badge key={key} variant="outline" className="mr-1">
                            {key}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Column Analysis</h3>
                  <div className="max-h-[300px] overflow-y-auto rounded border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Column</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Non-Null</TableHead>
                          <TableHead>Sample</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.keys(dataAnalysis.dataTypes).map(column => (
                          <TableRow key={column}>
                            <TableCell className="font-medium">{column}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {dataAnalysis.dataTypes[column]}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {dataAnalysis.nullValueCounts && 
                               (dataAnalysis.rowCount - dataAnalysis.nullValueCounts[column]) + 
                               ` (${Math.round((dataAnalysis.rowCount - dataAnalysis.nullValueCounts[column]) / dataAnalysis.rowCount * 100)}%)`}
                            </TableCell>
                            <TableCell className="truncate max-w-[150px]">
                              {dataAnalysis.sample[0] && 
                               String(dataAnalysis.sample[0][column] !== null && 
                                      dataAnalysis.sample[0][column] !== undefined ? 
                                      dataAnalysis.sample[0][column] : 'NULL')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Data Preview Tab */}
        <TabsContent value="preview">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Data Preview</CardTitle>
              <div className="text-sm text-muted-foreground">
                Showing first 5 records of {dataAnalysis.rowCount}
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {dataAnalysis.columns.map(column => (
                        <TableHead key={column} className="whitespace-nowrap">
                          {column}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dataAnalysis.sample.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {dataAnalysis.columns.map(column => (
                          <TableCell key={column} className="truncate max-w-[150px]">
                            {row[column] !== null && row[column] !== undefined
                              ? String(row[column])
                              : <span className="text-muted-foreground italic">NULL</span>}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Geographic Data Tab */}
        {dataAnalysis.hasGisData && (
          <TabsContent value="geo">
            <Card>
              <CardHeader>
                <CardTitle>Geographic Data Visualization</CardTitle>
              </CardHeader>
              <CardContent>
                {gisData && gisData.length > 0 ? (
                  <GISVisualization data={[]}/>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <Map className="mx-auto h-12 w-12 opacity-20 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Cannot Visualize GIS Data</h3>
                    <p>Geographic data fields were detected but could not be properly parsed.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
        
        {/* Statistics Tab */}
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Data Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Numeric fields statistics */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Numeric Fields</h3>
                  <div className="overflow-x-auto rounded border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Field</TableHead>
                          <TableHead>Min</TableHead>
                          <TableHead>Max</TableHead>
                          <TableHead>Unique Values</TableHead>
                          <TableHead>Missing Values</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(dataAnalysis.dataTypes)
                          .filter(([type]) => type === 'Number' || type === 'Number (as string)')
                          .map(([column]) => (
                            <TableRow key={column}>
                              <TableCell className="font-medium">{column}</TableCell>
                              <TableCell>
                                {dataAnalysis.ranges && dataAnalysis.ranges[column]
                                  ? dataAnalysis.ranges[column].min
                                  : 'N/A'}
                              </TableCell>
                              <TableCell>
                                {dataAnalysis.ranges && dataAnalysis.ranges[column]
                                  ? dataAnalysis.ranges[column].max
                                  : 'N/A'}
                              </TableCell>
                              <TableCell>
                                {dataAnalysis.uniqueValueCounts?.[column] || 'N/A'}
                              </TableCell>
                              <TableCell>
                                {dataAnalysis.nullValueCounts?.[column] || 0}
                              </TableCell>
                            </TableRow>
                          ))}
                        
                        {Object.values(dataAnalysis.dataTypes).filter(type => 
                          type === 'Number' || type === 'Number (as string)').length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center p-4 text-muted-foreground">
                              No numeric fields found in the data
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                {/* Date fields statistics */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Date Fields</h3>
                  <div className="overflow-x-auto rounded border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Field</TableHead>
                          <TableHead>Format</TableHead>
                          <TableHead>Unique Values</TableHead>
                          <TableHead>Missing Values</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(dataAnalysis.dataTypes)
                          .filter(([type]) => type === 'Date')
                          .map(([column]) => (
                            <TableRow key={column}>
                              <TableCell className="font-medium">{column}</TableCell>
                              <TableCell>
                                {/* Attempt to detect date format */}
                                {dataAnalysis.sample.some(row => row[column]) 
                                  ? inferDateFormat(dataAnalysis.sample.find(row => row[column])?.[column])
                                  : 'Unknown'}
                              </TableCell>
                              <TableCell>
                                {dataAnalysis.uniqueValueCounts?.[column] || 'N/A'}
                              </TableCell>
                              <TableCell>
                                {dataAnalysis.nullValueCounts?.[column] || 0}
                              </TableCell>
                            </TableRow>
                          ))}
                        
                        {Object.values(dataAnalysis.dataTypes).filter(type => 
                          type === 'Date').length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center p-4 text-muted-foreground">
                              No date fields found in the data
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

/**
 * Helper function to infer date format from a sample
 */
const inferDateFormat = (sample: unknown): string => {
  if (!sample) return 'Unknown';
  
  const dateStr = String(sample);
  
  // Common date formats
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return 'YYYY-MM-DD';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return 'MM/DD/YYYY';
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) return 'DD.MM.YYYY';
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) return 'DD-MM-YYYY';
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(dateStr)) return 'YYYY/MM/DD';
  
  // Check if it has time component
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(dateStr)) return 'ISO DateTime';
  if (/^\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}:\d{2}/.test(dateStr)) return 'MM/DD/YYYY HH:MM:SS';
  
  return 'Custom';
};

export default AnalysisSection;