import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

/**
 * Type definitions for the File Processor Hook
 */
export interface FileData {
  fileName: string;
  fileType: string;
  raw: any;
  parsedData?: any[];
  error?: string;
}

export interface DataAnalysis {
  rowCount: number;
  columnCount: number;
  columns: string[];
  dataTypes: Record<string, string>;
  sample: any[];
  hasGisData: boolean;
  possiblePrimaryKeys: string[];
  possibleForeignKeys: string[];
  nullValueCounts?: Record<string, number>;
  uniqueValueCounts?: Record<string, number>;
  ranges?: Record<string, { min: any; max: any }>;
}

/**
 * Custom hook for file processing and data analysis
 */
export function useFileProcessor() {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [dataAnalysis, setDataAnalysis] = useState<DataAnalysis | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /**
   * Process an uploaded file based on its extension
   */
  const processFile = useCallback(async (file: File) => {
    if (!file) return;
    
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    
    try {
      let parsedData;
      
      // Process file based on extension
      if (extension === 'csv') {
        parsedData = await processCsvFile(file);
      } else if (['xlsx', 'xls'].includes(extension)) {
        parsedData = await processExcelFile(file);
      } else {
        throw new Error(`Unsupported file format: .${extension}`);
      }
      
      // Set file data
      setFileData({
        fileName: file.name,
        fileType: extension,
        raw: file,
        parsedData
      });
      
      // Analyze the data
      const analysis = analyzeData(parsedData);
      setDataAnalysis(analysis);
      
      setSuccess('File successfully processed and analyzed');
    } catch (err) {
      setError(`Error processing file: ${err instanceof Error ? err.message : String(err)}`);
      console.error('File processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Load the sample Baltimore incidents CSV
   */
  const loadSampleData = useCallback(async () => {
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/sample_data/baltimore_incidents.csv');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const text = await response.text();
      const fileName = 'baltimore_incidents.csv';
      
      // Parse the CSV data
      const result = Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      });
      
      if (result.errors && result.errors.length > 0) {
        console.warn('CSV parsing warnings:', result.errors);
      }
      
      // Set file data
      setFileData({
        fileName,
        fileType: 'csv',
        raw: text,
        parsedData: result.data
      });
      
      // Analyze the data
      const analysis = analyzeData(result.data);
      setDataAnalysis(analysis);
      
      setSuccess('Sample Baltimore incidents data loaded successfully');
    } catch (err) {
      setError(`Error loading sample data: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Sample data loading error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Process CSV files using PapaParse
   */
  const processCsvFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors && results.errors.length > 0) {
            console.warn('CSV parsing warnings:', results.errors);
          }
          resolve(results.data);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  };

  /**
   * Process Excel files using SheetJS
   */
  const processExcelFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) {
            throw new Error('Failed to read Excel file');
          }
          
          const workbook = XLSX.read(data, {
            type: 'binary',
            cellDates: true
          });
          
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            raw: false,
            defval: null
          });
          
          resolve(jsonData);
        } catch (err) {
          reject(err);
        }
      };
      
      reader.onerror = (err) => {
        reject(err);
      };
      
      reader.readAsBinaryString(file);
    });
  };

  /**
   * Analyzes the data structure and quality
   */
  const analyzeData = (data: any[]): DataAnalysis => {
    if (!data || data.length === 0) {
      throw new Error("No data to analyze");
    }
    
    // Basic data analysis
    const analysis: DataAnalysis = {
      rowCount: data.length,
      columnCount: Object.keys(data[0] || {}).length,
      columns: Object.keys(data[0] || {}),
      dataTypes: {},
      sample: data.slice(0, 5),
      hasGisData: false,
      possiblePrimaryKeys: [],
      possibleForeignKeys: [],
      nullValueCounts: {},
      uniqueValueCounts: {},
      ranges: {}
    };
    
    // Analyze columns
    Object.keys(data[0] || {}).forEach(column => {
      const values = data.map(row => row[column]);
      const type = inferDataType(values);
      analysis.dataTypes[column] = type;
      
      // Count null values
      const nullCount = values.filter(v => v === null || v === undefined || v === '').length;
      if (analysis.nullValueCounts) {
        analysis.nullValueCounts[column] = nullCount;
      }
      
      // Count unique values
      const uniqueValues = new Set(values.filter(v => v !== null && v !== undefined && v !== ''));
      if (analysis.uniqueValueCounts) {
        analysis.uniqueValueCounts[column] = uniqueValues.size;
      }
      
      // Calculate range for numeric columns
      if (type === 'Number' && analysis.ranges) {
        const numericValues = values.filter(v => typeof v === 'number' && !isNaN(v)) as number[];
        if (numericValues.length > 0) {
          analysis.ranges[column] = {
            min: Math.min(...numericValues),
            max: Math.max(...numericValues)
          };
        }
      }
      
      // Look for potential GIS data
      const lowerColumn = column.toLowerCase();
      if (lowerColumn.includes('lat') || lowerColumn.includes('lon') || 
          lowerColumn.includes('coord') || lowerColumn.includes('location') ||
          lowerColumn.includes('x_') || lowerColumn.includes('y_')) {
        analysis.hasGisData = true;
      }
      
      // Look for potential unique IDs (primary keys)
      if (uniqueValues.size === data.length &&
          (lowerColumn.includes('id') || lowerColumn.includes('key') || lowerColumn.endsWith('_id'))) {
        analysis.possiblePrimaryKeys.push(column);
      }
      
      // Look for potential foreign keys
      if ((lowerColumn.includes('id') || lowerColumn.includes('key') || lowerColumn.endsWith('_id')) && 
          !analysis.possiblePrimaryKeys.includes(column)) {
        analysis.possibleForeignKeys.push(column);
      }
    });
    
    return analysis;
  };
  
  /**
   * Infers the data type for a column based on its values
   */
  const inferDataType = (values: any[]): string => {
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
   * Reset all state
   */
  const resetData = useCallback(() => {
    setFileData(null);
    setDataAnalysis(null);
    setError(null);
    setSuccess(null);
  }, []);

  return {
    fileData,
    dataAnalysis,
    isProcessing,
    error,
    success,
    processFile,
    loadSampleData,
    resetData,
  };
}