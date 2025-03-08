// Main application component
'use client'

import React, { useState, useCallback, useRef } from 'react';
import { ThemeToggle } from '@/components/theme-toggle'
import Papa from 'papaparse';

// Simplified components without dependencies
const Card = ({ children, className = '' }) => (
  <div className={`border rounded-lg shadow-sm p-4 ${className}`}>{children}</div>
);

const Button = ({ children, onClick, className = '', disabled = false }) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    className={`px-4 py-2 rounded-md font-medium ${
      disabled ? 'bg-gray-200 text-gray-500' : 'bg-blue-500 text-white hover:bg-blue-600'
    } ${className}`}
  >
    {children}
  </button>
);

export default function DataMigrationTool() {
  // File and data states
  const [fileData, setFileData] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Analysis states
  const [dataAnalysis, setDataAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");
  
  // Refs
  const fileInputRef = useRef(null);
  
  /**
   * Handles file upload and parsing based on file extension
   */
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setFileName(file.name);
    setFileData(file);
    setError(null);
    setSuccess(null);
    
    const extension = file.name.split('.').pop().toLowerCase();
    setFileType(extension);
    
    // Process file based on extension
    if (extension === 'csv') {
      processCsvFile(file);
    } else {
      setError(`Only CSV files are supported in this simplified version.`);
    }
  }, []);
  
  /**
   * Processes CSV files using PapaParse
   */
  const processCsvFile = async (file) => {
    try {
      const text = await file.text();
      Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors && results.errors.length > 0) {
            setError(`Warning: ${results.errors[0].message}. Some data may be incomplete.`);
          }
          
          setParsedData(results.data);
          analyzeData(results.data);
          setActiveTab("analysis");
          setSuccess("CSV file successfully parsed and analyzed");
        },
        error: (error) => {
          setError(`Error parsing CSV: ${error.message}`);
        }
      });
    } catch (err) {
      setError(`Error reading file: ${err.message}`);
    }
  };
  
  /**
   * Analyzes the data structure and quality
   */
  const analyzeData = (data) => {
    if (!data || data.length === 0) {
      setError("No data to analyze");
      return;
    }
    
    // Basic data analysis
    const analysis = {
      rowCount: data.length,
      columnCount: Object.keys(data[0] || {}).length,
      columns: Object.keys(data[0] || {}),
      dataTypes: {},
      sample: data.slice(0, 5),
      hasGisData: false,
      possiblePrimaryKeys: [],
      possibleForeignKeys: [],
    };
    
    // Analyze columns
    Object.keys(data[0] || {}).forEach(column => {
      const values = data.map(row => row[column]);
      const type = inferDataType(values);
      analysis.dataTypes[column] = type;
      
      // Look for potential GIS data
      const lowerColumn = column.toLowerCase();
      if (lowerColumn.includes('lat') || lowerColumn.includes('lon') || 
          lowerColumn.includes('coord') || lowerColumn.includes('location') ||
          lowerColumn.includes('x_') || lowerColumn.includes('y_')) {
        analysis.hasGisData = true;
      }
      
      // Look for potential unique IDs (primary keys)
      const uniqueValues = new Set(values.filter(v => v !== null && v !== undefined));
      if (uniqueValues.size === data.length &&
          (lowerColumn.includes('id') || lowerColumn.includes('key'))) {
        analysis.possiblePrimaryKeys.push(column);
      }
      
      // Look for potential foreign keys
      if ((lowerColumn.includes('id') || lowerColumn.includes('key')) && 
          !analysis.possiblePrimaryKeys.includes(column)) {
        analysis.possibleForeignKeys.push(column);
      }
    });
    
    setDataAnalysis(analysis);
  };
  
  /**
   * Infers the data type for a column
   */
  const inferDataType = (values) => {
    // Get a non-null sample
    const sample = values.find(v => v !== null && v !== undefined && v !== '');
    if (sample === undefined) return 'Unknown';
    
    if (typeof sample === 'number') return 'Number';
    if (typeof sample === 'boolean') return 'Boolean';
    
    // Check if it's a date
    if (typeof sample === 'string') {
      // Check date format
      if (!isNaN(Date.parse(sample))) return 'Date';
      
      // Check if it's a number stored as string
      if (!isNaN(parseFloat(sample)) && parseFloat(sample).toString() === sample) return 'Number (as string)';
      
      return 'String';
    }
    
    return typeof sample;
  };
  
  /**
   * UI Component for file upload
   */
  const UploadSection = () => (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="col-span-2">
          <h2 className="text-xl font-bold mb-4">Upload Legacy Data</h2>
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileUpload}
              accept=".csv,.xlsx,.xls,.sql"
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full mb-4"
            >
              Select File
            </Button>
            <div className="text-sm text-gray-500">
              Supported formats: CSV, Excel (.xlsx, .xls), SQL backup files
            </div>
          </div>
          
          {fileName && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{fileName}</span>
                </div>
                <span className="px-2 py-1 bg-gray-200 rounded-full text-xs">{fileType.toUpperCase()}</span>
              </div>
            </div>
          )}
        </Card>
        
        <Card>
          <h2 className="text-xl font-bold mb-4">Migration Experience</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 text-green-500">✓</div>
              <div>
                <p className="font-medium">SQL Expertise</p>
                <p className="text-sm text-gray-500">
                  Writing queries from scratch and working with multiple tables
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 text-green-500">✓</div>
              <div>
                <p className="font-medium">Data Format Handling</p>
                <p className="text-sm text-gray-500">
                  CSV, Excel, SQL dumps and delimited files
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 text-green-500">✓</div>
              <div>
                <p className="font-medium">GIS Components</p>
                <p className="text-sm text-gray-500">
                  Geographic data parsing and visualization
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 text-green-500">✓</div>
              <div>
                <p className="font-medium">Relational Structures</p>
                <p className="text-sm text-gray-500">
                  Understanding of database schemas and relationships
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {error && (
        <div className="p-4 border-l-4 border-red-500 bg-red-50 text-red-700">
          <h3 className="font-bold">Error</h3>
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="p-4 border-l-4 border-green-500 bg-green-50 text-green-700">
          <h3 className="font-bold">Success</h3>
          <p>{success}</p>
        </div>
      )}
    </div>
  );
  
  /* UI Component for data analysis */
  const AnalysisSection = () => (
    <div className="space-y-6">
      {dataAnalysis && (
        <Card>
          <h2 className="text-xl font-bold mb-4">Data Structure Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Overview</h3>
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
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Potential ID Fields</h3>
                  <div className="space-y-1">
                    {dataAnalysis.possiblePrimaryKeys.map(key => (
                      <span key={key} className="inline-block mr-1 px-2 py-1 bg-gray-200 rounded-full text-xs">
                        {key}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Column Analysis</h3>
              <div className="max-h-[300px] overflow-y-auto rounded border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Column</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Sample</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.keys(dataAnalysis.dataTypes).map(column => (
                      <tr key={column}>
                        <td className="px-4 py-2 font-medium">{column}</td>
                        <td className="px-4 py-2">
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                            {dataAnalysis.dataTypes[column]}
                          </span>
                        </td>
                        <td className="px-4 py-2 truncate max-w-[150px]">
                          {dataAnalysis.sample[0] && 
                           String(dataAnalysis.sample[0][column] !== null ? 
                                  dataAnalysis.sample[0][column] : 'NULL')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Data Preview</h3>
            <div className="overflow-x-auto rounded border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {dataAnalysis.columns.map(column => (
                      <th key={column} className="px-4 py-2 text-left text-xs font-medium text-gray-500">{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dataAnalysis.sample.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {dataAnalysis.columns.map(column => (
                        <td key={column} className="px-4 py-2 truncate max-w-[150px]">
                          {row[column] !== null && row[column] !== undefined
                            ? String(row[column])
                            : <span className="text-gray-400 italic">NULL</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
  
  /* Main UI component structure */
  return (
    <div className="container mx-4 py-6 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Data Migration Tool</h1>
        <p className="text-gray-500">
          Analyze, transform, and migrate data from legacy systems
        </p>
      </header>
      
      <div className="mb-6">
        <div className="flex border-b">
          <button 
            className={`px-4 py-2 ${activeTab === "upload" ? "border-b-2 border-blue-500 font-medium" : ""}`}
            onClick={() => setActiveTab("upload")}
          >
            Upload
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === "analysis" ? "border-b-2 border-blue-500 font-medium" : ""}`}
            onClick={() => setActiveTab("analysis")}
            disabled={!parsedData}
          >
            Analysis
          </button>
        </div>
      </div>
      
      {activeTab === "upload" && <UploadSection />}
      {activeTab === "analysis" && <AnalysisSection />}
    </div>
  );
};

