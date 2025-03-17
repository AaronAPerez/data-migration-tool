import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useFormSubmission } from '@/hooks/useFormSubmission';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  PlayCircle, 
  AlertTriangle, 
  CheckCircle, 
  ClockIcon,
  FileCheck,
  Workflow, 
  RefreshCw,
  Terminal,
  XCircle 
} from 'lucide-react';
import { LogEntry, MigrationStats, MigrationStep } from '@/types/shared-types';

/**
 * Execution Section Component
 * 
 * Manages and displays migration execution progress, logs, and summary
 */
const ExecutionSection = () => {
  // Form submission hook
  const { isSubmitting } = useFormSubmission<Record<string, unknown>>();

  // Migration state
  const [migrationActive, setMigrationActive] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<string>('process');
  const [progress, setProgress] = useState<number>(0);
  const [migrationSteps, setMigrationSteps] = useState<MigrationStep[]>([
    {
      id: 'prepare',
      name: 'Prepare Data',
      description: 'Validate and prepare data for migration',
      status: 'pending'
    },
    {
      id: 'transform',
      name: 'Transform Data',
      description: 'Apply field mappings and transformations',
      status: 'pending'
    },
    {
      id: 'validateDest',
      name: 'Validate Target',
      description: 'Ensure target system can accept the data',
      status: 'pending'
    },
    {
      id: 'migrate',
      name: 'Migrate Data',
      description: 'Transfer data to target system',
      status: 'pending'
    },
    {
      id: 'verify',
      name: 'Verify Migration',
      description: 'Verify data was transferred correctly',
      status: 'pending'
    }
  ]);
  const [migrationStats, setMigrationStats] = useState<MigrationStats>({
    totalRecords: 0,
    processedRecords: 0,
    successRecords: 0,
    errorRecords: 0,
    skippedRecords: 0
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);

  /**
   * Start the migration process
   */
  const startMigration = async () => {
    // Reset state
    setMigrationActive(true);
    setProgress(0);
    setMigrationSteps(migrationSteps.map(step => ({ ...step, status: 'pending' })));
    setMigrationStats({
      totalRecords: 287,  // Sample total
      processedRecords: 0,
      successRecords: 0,
      errorRecords: 0,
      skippedRecords: 0,
      startTime: new Date()
    });
    setLogs([]);
    
    // Log start
    addLogEntry('info', 'Starting migration process');
    
    // Run migration steps
    await runMigrationSteps();
  };

  /**
   * Run all migration steps with simulated delay
   */
  const runMigrationSteps = async () => {
    // Simulate step 1: Prepare Data
    await updateStep('prepare', 'running');
    addLogEntry('info', 'Preparing data for migration');
    await simulateProgress(0, 20);
    await updateStep('prepare', 'completed');
    addLogEntry('success', 'Data preparation completed successfully');
    
    // Simulate step 2: Transform Data
    await updateStep('transform', 'running');
    addLogEntry('info', 'Applying transformations to source data');
    await simulateProgress(20, 40);
    
    // Simulate an error during transformation
    addLogEntry('warn', 'Found 5 records with invalid date format');
    addLogEntry('info', 'Attempting to auto-correct date formats');
    await simulateProgress(40, 45);
    
    await updateStep('transform', 'completed');
    addLogEntry('success', 'Data transformation completed with warnings');
    
    // Simulate step 3: Validate Target
    await updateStep('validateDest', 'running');
    addLogEntry('info', 'Validating target system readiness');
    await simulateProgress(45, 55);
    await updateStep('validateDest', 'completed');
    addLogEntry('success', 'Target system validation successful');
    
    // Simulate step 4: Migrate Data
    await updateStep('migrate', 'running');
    addLogEntry('info', 'Beginning data transfer to target system');
    
    // Simulate batched data migration with progress updates
    for (let i = 0; i < 5; i++) {
      const batchSize = Math.floor(Math.random() * 20) + 40; // 40-60 records per batch
      addLogEntry('info', `Migrating batch ${i+1} (${batchSize} records)`);
      
      // Simulate some failures
      const failures = i === 2 ? 3 : (i === 4 ? 1 : 0);
      if (failures > 0) {
        addLogEntry('error', `Failed to migrate ${failures} records in batch ${i+1}`);
        setMigrationStats(prev => ({
          ...prev,
          errorRecords: prev.errorRecords + failures,
          processedRecords: prev.processedRecords + batchSize,
          successRecords: prev.successRecords + (batchSize - failures)
        }));
      } else {
        setMigrationStats(prev => ({
          ...prev,
          processedRecords: prev.processedRecords + batchSize,
          successRecords: prev.successRecords + batchSize
        }));
      }
      
      await simulateProgress(55 + (i * 7), 55 + ((i+1) * 7));
    }
    
    await updateStep('migrate', 'completed');
    addLogEntry('success', 'Data migration completed with 4 errors');
    
    // Simulate step 5: Verify Migration
    await updateStep('verify', 'running');
    addLogEntry('info', 'Verifying migrated data integrity');
    await simulateProgress(90, 100);
    
    // Randomly decide if verification passes or fails
    const verificationPasses = Math.random() > 0.7;
    
    if (verificationPasses) {
      await updateStep('verify', 'completed');
      addLogEntry('success', 'Data verification completed successfully');
    } else {
      await updateStep('verify', 'error', 'Data integrity check failed');
      addLogEntry('error', 'Data verification failed: checksum mismatch');
    }
    
    // Complete migration
    setMigrationStats(prev => ({
      ...prev,
      endTime: new Date()
    }));
    
    addLogEntry('info', 'Migration process completed');
    setMigrationActive(false);
  };

  /**
   * Update a step's status
   */
  const updateStep = async (stepId: string, status: 'pending' | 'running' | 'completed' | 'error', message?: string) => {
    setMigrationSteps(prev => 
      prev.map(step => 
        step.id === stepId 
          ? { ...step, status, message } 
          : step
      )
    );
    
    // Add some delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  /**
   * Simulate progress from start to end percent
   */
  const simulateProgress = async (start: number, end: number) => {
    const steps = 10;
    const increment = (end - start) / steps;
    
    for (let i = 0; i <= steps; i++) {
      setProgress(Math.min(start + (i * increment), 100));
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  };

  /**
   * Add a log entry
   */
  const addLogEntry = (level: 'info' | 'warn' | 'error' | 'success', message: string) => {
    setLogs(prev => [
      ...prev,
      {
        timestamp: new Date(),
        level,
        message
      }
    ]);
  };

  /**
   * Format duration from start and end time
   */
  const formatDuration = (start?: Date, end?: Date) => {
    if (!start || !end) return 'N/A';
    
    const diffMs = end.getTime() - start.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    
    const minutes = Math.floor(diffSec / 60);
    const seconds = diffSec % 60;
    
    return `${minutes}m ${seconds}s`;
  };

  /**
   * Get step icon based on status
   */
  const getStepIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-muted-foreground" />;
      case 'running':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-muted-foreground" />;
    }
  };

  /**
   * Get log entry icon based on level
   */
  const getLogIcon = (level: string) => {
    switch (level) {
      case 'info':
        return <Terminal className="h-4 w-4 text-blue-500" />;
      case 'warn':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Terminal className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Workflow className="mr-2 h-5 w-5" />
                Migration Execution
              </CardTitle>
              <CardDescription>
                Execute the migration process with the defined settings
              </CardDescription>
            </div>
            
            <div>
              {!migrationActive ? (
                <Button 
                  onClick={startMigration}
                  disabled={isSubmitting}
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Start Migration
                </Button>
              ) : (
                <Badge>Migration in Progress</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="process">
                <Workflow className="mr-2 h-4 w-4" />
                Process
              </TabsTrigger>
              <TabsTrigger value="logs">
                <Terminal className="mr-2 h-4 w-4" />
                Logs
              </TabsTrigger>
              <TabsTrigger value="summary" disabled={!migrationStats.endTime}>
                <FileCheck className="mr-2 h-4 w-4" />
                Summary
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="process" className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Migration Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </div>
              
              {/* Migration Steps */}
              <div className="space-y-2 mt-4">
                {migrationSteps.map((step, index) => (
                  <div key={step.id} className="flex items-start p-3 border rounded-md">
                    <div className="mr-3 mt-0.5">
                      {getStepIcon(step.status)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium">
                          {index + 1}. {step.name}
                        </h4>
                        <Badge variant={
                          step.status === 'completed' ? 'default' : 
                          step.status === 'running' ? 'secondary' :
                          step.status === 'error' ? 'destructive' :
                          'outline'
                        }>
                          {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-1">
                        {step.description}
                      </p>
                      
                      {step.message && (
                        <div className="mt-2 text-sm text-red-500">
                          {step.message}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Records Counter */}
              {migrationActive && (
                <div className="grid grid-cols-5 gap-2 mt-4">
                  <div className="p-3 bg-muted rounded-md text-center">
                    <div className="text-sm text-muted-foreground">Total</div>
                    <div className="text-lg font-bold">{migrationStats.totalRecords}</div>
                  </div>
                  
                  <div className="p-3 bg-muted rounded-md text-center">
                    <div className="text-sm text-muted-foreground">Processed</div>
                    <div className="text-lg font-bold">{migrationStats.processedRecords}</div>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-md text-center">
                    <div className="text-sm text-green-600">Success</div>
                    <div className="text-lg font-bold text-green-600">{migrationStats.successRecords}</div>
                  </div>
                  
                  <div className="p-3 bg-red-50 rounded-md text-center">
                    <div className="text-sm text-red-600">Errors</div>
                    <div className="text-lg font-bold text-red-600">{migrationStats.errorRecords}</div>
                  </div>
                  
                  <div className="p-3 bg-yellow-50 rounded-md text-center">
                    <div className="text-sm text-yellow-600">Skipped</div>
                    <div className="text-lg font-bold text-yellow-600">{migrationStats.skippedRecords}</div>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="logs">
              <div className="border rounded-lg p-2 bg-muted/20 h-[400px] overflow-y-auto font-mono text-sm">
                {logs.length === 0 ? (
                  <div className="text-center p-4 text-muted-foreground">
                    No logs available. Start the migration to see logs.
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {logs.map((log, index) => (
                      <div key={index} className="flex items-start">
                        <div className="mr-2 mt-0.5">
                          {getLogIcon(log.level)}
                        </div>
                        
                        <div>
                          <span className="text-xs text-muted-foreground mr-2">
                            [{log.timestamp.toLocaleTimeString()}]
                          </span>
                          <span className={
                            log.level === 'error' ? 'text-red-500' :
                            log.level === 'warn' ? 'text-yellow-600' :
                            log.level === 'success' ? 'text-green-600' :
                            ''
                          }>
                            {log.message}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="summary">
              {migrationStats.endTime && (
                <div className="space-y-6">
                  {/* Summary Header */}
                  <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                    <div>
                      <h3 className="text-lg font-medium">Migration Summary</h3>
                      <p className="text-sm text-muted-foreground">
                        Completed on {migrationStats.endTime.toLocaleString()}
                      </p>
                    </div>
                    
                    <Badge variant={
                      migrationStats.errorRecords === 0 ? 'default' : 
                      migrationStats.errorRecords < 5 ? 'secondary' : 
                      'destructive'
                    }>
                      {migrationStats.errorRecords === 0 ? 'Success' : 
                       migrationStats.errorRecords < 5 ? 'Warning' : 'Failed'}
                    </Badge>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="p-3 border rounded-md">
                        <div className="text-sm text-muted-foreground">Total Duration</div>
                        <div className="text-lg font-bold">
                          {formatDuration(migrationStats.startTime, migrationStats.endTime)}
                        </div>
                      </div>
                      
                      <div className="p-3 border rounded-md">
                        <div className="text-sm text-muted-foreground">Total Records</div>
                        <div className="text-lg font-bold">{migrationStats.totalRecords}</div>
                      </div>
                      
                      <div className="p-3 border rounded-md">
                        <div className="text-sm text-muted-foreground">Records per Second</div>
                        <div className="text-lg font-bold">
                          {migrationStats.startTime && migrationStats.endTime ? (
                            (migrationStats.processedRecords / 
                              ((migrationStats.endTime.getTime() - migrationStats.startTime.getTime()) / 1000)).toFixed(2)
                          ) : 'N/A'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="p-3 border rounded-md bg-green-50">
                        <div className="text-sm text-green-600">Successful Records</div>
                        <div className="text-lg font-bold text-green-600">
                          {migrationStats.successRecords} 
                          <span className="text-sm font-normal ml-1">
                            ({Math.round((migrationStats.successRecords / migrationStats.totalRecords) * 100)}%)
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-3 border rounded-md bg-red-50">
                        <div className="text-sm text-red-600">Failed Records</div>
                        <div className="text-lg font-bold text-red-600">
                          {migrationStats.errorRecords}
                          <span className="text-sm font-normal ml-1">
                            ({Math.round((migrationStats.errorRecords / migrationStats.totalRecords) * 100)}%)
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-3 border rounded-md bg-yellow-50">
                        <div className="text-sm text-yellow-600">Skipped Records</div>
                        <div className="text-lg font-bold text-yellow-600">
                          {migrationStats.skippedRecords}
                          <span className="text-sm font-normal ml-1">
                            ({Math.round((migrationStats.skippedRecords / migrationStats.totalRecords) * 100)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status alerts */}
                  {migrationStats.errorRecords > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Migration Completed with Errors</AlertTitle>
                      <AlertDescription>
                        {migrationStats.errorRecords} records failed to migrate. Check the logs for details.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {migrationStats.errorRecords === 0 && (
                    <Alert>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <AlertTitle>Migration Completed Successfully</AlertTitle>
                      <AlertDescription>
                        All records were migrated successfully in {formatDuration(migrationStats.startTime, migrationStats.endTime)}.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        // Export logs functionality would go here
                        alert('Logs exported');
                      }}
                    >
                      Export Logs
                    </Button>
                    
                    <Button onClick={startMigration}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Run Again
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExecutionSection;