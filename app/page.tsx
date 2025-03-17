'use client'

import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import UploadSection from '@/components/data-migration/upload-section';
import AnalysisSection from '@/components/data-migration/analysis-section';
import MappingSection from '@/components/data-migration/mapping-section';
import SQLQueryBuilder from '@/components/data-migration/sql-query-builder';
import ValidationRules from '@/components/data-migration/validation-rules';
import { FileUp, Database, ArrowRightLeft, Code, CheckSquare } from 'lucide-react';
import UserGuide from '@/components/data-migration/UserGuide';
import { useFileProcessor } from '@/hooks/use-file-processor';
import "./globals.css";


/**
 * Main Data Migration Tool Page
 * 
 * Integrates all components into a tabbed interface for the data migration workflow
 */
export default function DataMigrationTool() {
  // Use the file processor hook
  const {
    fileData,
    dataAnalysis,
    isProcessing,
    error,
    success,
    processFile,
    loadSampleData,
  } = useFileProcessor();
  
  // Active tab state
  const [activeTab, setActiveTab] = useState('upload');
  
  // Sample target fields for mapping demonstration
  const targetFields = [
    { name: 'incidentId', type: 'string', required: true, description: 'Unique identifier' },
    { name: 'incidentDateTime', type: 'datetime', required: true, description: 'Date and time of incident' },
    { name: 'location', type: 'object', required: true, description: 'Location information' },
    { name: 'coordinates', type: 'geopoint', required: false, description: 'Geographic coordinates' },
    { name: 'type', type: 'string', required: true, description: 'Type of incident' },
    { name: 'respondingUnit', type: 'string', required: true, description: 'Responding unit identifier' },
    { name: 'currentStatus', type: 'string', required: true, description: 'Current status' }
  ];
  
  // Define sample tables for SQL query builder
  const tables = {
    'incidents': {
      columns: ['id', 'incident_date', 'incident_type', 'location_id', 'status', 'priority', 'reported_by']
    },
    'locations': {
      columns: ['id', 'address', 'city', 'state', 'zip', 'latitude', 'longitude']
    },
    'units': {
      columns: ['id', 'name', 'type', 'station_id', 'status']
    },
    'personnel': {
      columns: ['id', 'first_name', 'last_name', 'rank', 'unit_id', 'status']
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Add User Guide component */}
      <UserGuide />
      
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Data Migration Tool</h1>
        <p className="text-muted-foreground mt-1">
          Analyze, transform, and migrate data from legacy systems
        </p>
      </header>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="upload" data-testid="upload-tab">
            <FileUp className="mr-2 h-4 w-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger 
            value="analysis" 
            disabled={!dataAnalysis}
            data-testid="analysis-tab"
          >
            <Database className="mr-2 h-4 w-4" />
            Analysis
          </TabsTrigger>
          <TabsTrigger 
            value="mapping" 
            disabled={!dataAnalysis}
            data-testid="mapping-tab"
          >
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Field Mapping
          </TabsTrigger>
          <TabsTrigger 
            value="sql" 
            disabled={!dataAnalysis}
            data-testid="sql-tab"
          >
            <Code className="mr-2 h-4 w-4" />
            SQL Builder
          </TabsTrigger>
          <TabsTrigger 
            value="validation" 
            disabled={!dataAnalysis}
            data-testid="validation-tab"
          >
            <CheckSquare className="mr-2 h-4 w-4" />
            Validation Rules
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload">
          <UploadSection
            fileData={fileData}
            isProcessing={isProcessing}
            error={error}
            success={success}
            onFileUpload={processFile}
            onLoadSample={loadSampleData}
          />
        </TabsContent>
        
        <TabsContent value="analysis">
          <AnalysisSection 
            dataAnalysis={dataAnalysis}
            parsedData={fileData?.parsedData}
          />
        </TabsContent>
        
        <TabsContent value="mapping">
          <MappingSection 
            sourceFields={dataAnalysis?.columns.map(col => ({
              name: col,
              type: dataAnalysis.dataTypes[col],
              sample: dataAnalysis.sample[0]?.[col]
            }))}
            targetFields={targetFields}
          />
        </TabsContent>
        
        <TabsContent value="sql">
          <SQLQueryBuilder tables={tables} />
        </TabsContent>
        
        <TabsContent value="validation">
          <ValidationRules data={fileData?.parsedData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}