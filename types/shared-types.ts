// Shared type definitions for the data migration tool

/**
 * Field information structure
 */
export interface FieldInfo {
    name: string;
    type: string;
    sample?: string | number | boolean;
    required?: boolean;
    description?: string;
  }
  
  /**
   * Data analysis structure
   */
  export interface DataAnalysis {
    rowCount: number;
    columnCount: number;
    columns: string[];
    dataTypes: Record<string, string>;
    sample: Record<string, string | number | boolean | null>[];
    hasGisData: boolean;
    possiblePrimaryKeys: string[];
    possibleForeignKeys: string[];
    nullValueCounts?: Record<string, number>;
    uniqueValueCounts?: Record<string, number>;
    ranges?: Record<string, { min: number; max: number }>;
  }
  
  /**
   * File data structure
   */
  export interface FileData {
    fileName: string;
    fileType: string;
    raw: unknown;
    parsedData?: Record<string, string | number | boolean | null>[];
    error?: string;
  }
  
  /**
   * Mapping item structure
   */
  export interface MappingItem {
    id: number;
    sourceField: string;
    targetField: string;
    transform: string;
    transformParams?: TransformParams;
    confidence: 'high' | 'medium' | 'low' | 'manual';
  }
  
  /**
   * Transform parameters for mapping
   */
  export interface TransformParams {
    sourceFields?: string[];
    format?: string;
    properties?: string[];
    lat?: string;
    lng?: string;
    delimiter?: string;
    valueMappings?: Array<{
      source: string;
      target: string;
    }>;
  }
  
  /**
   * GIS Point data structure
   */
  export interface GISPoint {
    id: string | number;
    lat: number;
    lon: number;
    name: string;
    type: string;
  }
  
  /**
   * Migration step structure
   */
  export interface MigrationStep {
    id: string;
    name: string;
    description: string;
    status: 'pending' | 'running' | 'completed' | 'error';
    message?: string;
  }
  
  /**
   * Migration stats structure
   */
  export interface MigrationStats {
    totalRecords: number;
    processedRecords: number;
    successRecords: number;
    errorRecords: number;
    skippedRecords: number;
    startTime?: Date;
    endTime?: Date;
  }
  
  /**
   * Log entry structure
   */
  export interface LogEntry {
    timestamp: Date;
    level: 'info' | 'warn' | 'error' | 'success';
    message: string;
  }
  
  /**
   * Validation rule structure
   */
  export interface ValidationRule {
    id: number;
    field: string;
    rule: string;
    params?: string | Record<string, unknown>;
    message: string;
    status: 'active' | 'draft' | 'disabled';
  }
  
  /**
   * Validation test results structure
   */
  export interface ValidationTestResults {
    total: number;
    passed: number;
    failed: number;
    records: Array<{
      id: number | string;
      errors: Array<{
        field: string;
        message: string;
        value: unknown;
      }>;
      passed: boolean;
    }>;
  }
  
  /**
   * Database table structure
   */
  export interface DbTable {
    columns: string[];
  }