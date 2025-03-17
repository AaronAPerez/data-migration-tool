import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { 
  HelpCircle, 
  FileText, 
  Download, 
  BookOpen, 
  Upload, 
  Database, 
  ArrowRightLeft,
  Code,
  CheckSquare,
  BarChart
} from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

/**
 * UserGuide component - Provides access to in-app documentation
 * and allows downloading the full user guide
 */
const UserGuide = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  /**
   * Generate and download the user guide as a markdown file
   */
  const handleDownloadGuide = () => {
    // Create markdown content
    const markdownContent = `# Data Migration Tool - User Guide

The Data Migration Tool helps you move data from legacy systems to modern applications by analyzing, transforming, and validating your data. Here's a step-by-step guide to using all features of the tool.

## Getting Started

The tool is organized into five main sections, represented by tabs:

1. **Upload** - Import your data files
2. **Analysis** - Examine your data structure and content
3. **Field Mapping** - Match source fields to destination fields
4. **SQL Builder** - Create custom queries for data extraction
5. **Validation Rules** - Define rules to ensure data quality

Let's walk through each step of the process.

## 1. Upload Section

This is where you'll import your data files for migration.

### How to Upload Data:

1. Click the **Select File** button to browse and select a file from your computer
   - Supported formats: CSV, Excel (.xlsx, .xls), SQL backup files
   
2. Alternatively, click **Load Sample Baltimore Data** to try the tool with sample data
   
3. Once uploaded, you'll see a confirmation message and details about your file

### What's Happening Behind the Scenes:

- The tool reads your file and detects the format automatically
- For CSV files, it identifies column headers and data types
- For Excel files, it processes the first sheet by default
- The system prepares the data for analysis in the next step

## 2. Analysis Section

Once your data is uploaded, click the **Analysis** tab to explore your dataset in detail.

### Understanding the Analysis Section:

The Analysis tab contains four sub-sections:

#### Structure Tab
- Shows a summary of your data (row count, column count)
- Identifies potential ID fields and reference fields
- Lists all columns with their data types and sample values
- Detects geographic data if present

#### Data Preview Tab
- Displays the first few rows of your data
- Helps you visually inspect actual values

#### Geographic Data Tab (if applicable)
- Visualizes location data on an interactive map
- Offers different view modes: Points, Clusters, and Connections
- Toggle options for labels and boundaries

#### Statistics Tab
- Provides numerical summaries for each field
- Shows min/max values for numeric fields
- Detects date formats
- Counts unique and missing values

### Tips for Effective Analysis:

- Check for missing or incorrect data in the preview
- Look at the data types detected - make sure they match what you expect
- Examine potential ID fields to ensure they're unique
- If geographic data is detected, verify coordinates on the map

## 3. Field Mapping Section

This is where you connect fields from your source data to fields in the target system.

### How Field Mapping Works:

1. The left column shows your **source fields** (from your uploaded data)
2. The right column shows the **target fields** (where data will be moved to)
3. The middle column shows the **transformation** applied

### Creating and Editing Mappings:

1. Click **Add Mapping** to create a new field connection
   
2. For each mapping, you need to select:
   - **Source Field**: The field from your uploaded data
   - **Target Field**: The corresponding field in the destination system
   - **Transformation**: How the data should be modified during transfer
   
3. Types of transformations available:
   - **No transformation**: Direct copy (no changes)
   - **Combine fields**: Merge multiple fields (like combining date and time)
   - **Split field**: Divide one field into multiple parts
   - **Format value**: Change the format (like date formats)
   - **Value lookup**: Replace values with alternatives (like status codes)
   - **Create object**: Combine multiple fields into a structured object
   - **Create geopoint**: Convert latitude/longitude into geographic points

4. The system shows a **confidence level** for each mapping:
   - **High**: The system is very confident in this mapping
   - **Medium**: Good match but may need verification
   - **Low**: Uncertain match that requires review
   - **Manual**: Mapping created by you manually

### Tips for Effective Mapping:

- Check **Unmapped Required Target Fields** to ensure all necessary fields are mapped
- Use the **confidence indicator** to focus on mappings that need verification
- For complex transformations, click the Settings icon to configure detailed parameters
- The completeness percentage shows your overall mapping progress

## 4. SQL Builder Section

This section helps you create SQL queries for extracting or transforming data.

### Using the SQL Builder:

1. **Select Table**: Choose the main data table you want to query
   
2. **Select Columns**: Choose which fields to include in your query
   
3. **WHERE Conditions**: Add filtering criteria
   - Click "Add Condition" to create new filters
   - For each condition, specify a column, operator, and value
   
4. **JOIN Settings**: Connect related tables
   - Select a table to join with
   - Specify which columns to use for joining
   
5. **ORDER BY & LIMIT**: Sort results and set limits
   - Choose a column to sort by
   - Set ascending or descending order
   - Limit the number of results

The SQL query is automatically generated and displayed at the bottom.

### Tips for SQL Builder:

- Use the "*" option to select all columns
- For complex data, use multiple WHERE conditions to filter precisely
- Join tables when you need to combine data from multiple sources
- The generated SQL can be copied and used in other database tools

## 5. Validation Rules Section

This section helps you ensure data quality by defining rules that your data must follow.

### Creating Validation Rules:

1. On the **Validation Rules** tab, click **Create First Rule** or go to the **Create Rule** tab
   
2. For each rule, specify:
   - **Field Name**: Which field to validate
   - **Rule Type**: Type of validation to perform
   - **Parameters**: Any parameters needed for the rule
   - **Error Message**: Message to display when validation fails
   - **Status**: Active, Draft, or Disabled
   
3. Click **Add Validation Rule** to save your rule

### Available Rule Types:

- **Required Field**: Field cannot be empty
- **String Length**: Field must have a specific length
- **Numeric Range**: Number must be within a range
- **Regular Expression**: Value must match a pattern
- **Date Format**: Date must follow a specific format
- **Allowed Values**: Value must be from a predefined list
- **Unique Values**: No duplicates allowed
- **Data Type Check**: Value must be a specific type

### Testing Your Validation Rules:

1. After creating rules, click **Test Rules**
2. The system will check your data against all active rules
3. Review the results to see which records pass or fail
4. Adjust rules as needed and test again

### Tips for Validation Rules:

- Start with basic rules (required fields, allowed values) before complex ones
- Test rules frequently as you build them
- Use the "Draft" status to create rules without activating them yet
- Export your rules to reuse them in other migrations

## Executing the Migration

Once you've completed all the steps above, you're ready to execute the migration:

1. Ensure all required fields are mapped
2. Verify that validation rules are appropriately set
3. Review the SQL query if you've customized the data extraction
4. Click the **Start Migration** button

During migration, you can monitor:
- Progress percentage
- Records processed/succeeded/failed
- Detailed logs of the migration process

After completion, you'll receive a summary report with statistics and any errors encountered.

## Troubleshooting Common Issues

### Data Format Problems:
- **Issue**: Column types are incorrectly detected
- **Solution**: Use transformations during mapping to convert types

### Missing Required Fields:
- **Issue**: Target system requires fields not present in source data
- **Solution**: Use "Combine fields" or "Format value" transformations to create needed fields

### Validation Failures:
- **Issue**: Data doesn't pass validation rules
- **Solution**: Check the error details, modify the data source or adjust validation rules

### Performance Issues:
- **Issue**: Large data sets process slowly
- **Solution**: Use LIMIT in SQL queries to process data in batches

## Best Practices

1. **Start Small**: Begin with a small subset of data to test the entire process
2. **Validate Early**: Set up validation rules before running large migrations
3. **Document Mappings**: Keep track of your field mappings for future reference
4. **Backup First**: Always backup your data before starting a migration
5. **Test Thoroughly**: Verify sample data in the target system before full migration

By following these steps, you'll be able to successfully migrate your data while ensuring quality and accuracy throughout the process.`;

    // Create a blob and download link
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data-migration-tool-user-guide.doc';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <>
      {/* Help button that opens the dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-4 right-4 z-50 rounded-full h-12 w-12 shadow-lg"
            aria-label="Open User Guide"
          >
            <HelpCircle className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <BookOpen className="h-5 w-5 text-primary" />
              Data Migration Tool - User Guide
            </DialogTitle>
            <DialogDescription>
              Step-by-step instructions for using the Data Migration Tool
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="mx-auto">
                <TabsTrigger value="overview">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="upload">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </TabsTrigger>
                <TabsTrigger value="analysis">
                  <Database className="h-4 w-4 mr-2" />
                  Analysis
                </TabsTrigger>
                <TabsTrigger value="mapping">
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  Mapping
                </TabsTrigger>
                <TabsTrigger value="sql">
                  <Code className="h-4 w-4 mr-2" />
                  SQL Builder
                </TabsTrigger>
                <TabsTrigger value="validation">
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Validation
                </TabsTrigger>
              </TabsList>
              
              <div className="flex-1 mt-4 overflow-hidden">
                {/* Direct implementation of ScrollArea from Radix UI */}
                <ScrollArea 
                type="always" style={{ height: 180 }}
                className="h-full w-full rounded-md border">
                  <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit] p-4">
                    <TabsContent value="overview" className="mt-0">
                      <Card>
                        <CardHeader>
                          <CardTitle>Getting Started</CardTitle>
                          <CardDescription>
                            Overview of the Data Migration Tool
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="leading-relaxed">
                            The Data Migration Tool helps you move data from legacy systems to modern applications 
                            by analyzing, transforming, and validating your data.
                          </p>
                          
                          <h3 className="text-lg font-medium mt-4">The tool is organized into five main sections:</h3>
                          
                          <div className="space-y-3 mt-2">
                            <div className="flex items-start gap-3">
                              <div className="bg-primary/10 p-2 rounded-full">
                                <Upload className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium">1. Upload</h4>
                                <p className="text-muted-foreground">Import your data files</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                              <div className="bg-primary/10 p-2 rounded-full">
                                <Database className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium">2. Analysis</h4>
                                <p className="text-muted-foreground">Examine your data structure and content</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                              <div className="bg-primary/10 p-2 rounded-full">
                                <ArrowRightLeft className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium">3. Field Mapping</h4>
                                <p className="text-muted-foreground">Match source fields to destination fields</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                              <div className="bg-primary/10 p-2 rounded-full">
                                <Code className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium">4. SQL Builder</h4>
                                <p className="text-muted-foreground">Create custom queries for data extraction</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                              <div className="bg-primary/10 p-2 rounded-full">
                                <CheckSquare className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium">5. Validation Rules</h4>
                                <p className="text-muted-foreground">Define rules to ensure data quality</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-6 p-4 bg-muted rounded-lg">
                            <h3 className="font-medium mb-2">Best Practices</h3>
                            <ul className="space-y-2 ml-5 list-disc">
                              <li>Start with a small subset of data to test the entire process</li>
                              <li>Set up validation rules before running large migrations</li>
                              <li>Keep track of your field mappings for future reference</li>
                              <li>Always backup your data before starting a migration</li>
                              <li>Verify sample data in the target system before full migration</li>
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="upload" className="mt-0">
                      <Card>
                        <CardHeader>
                          <CardTitle>Upload Section</CardTitle>
                          <CardDescription>
                            Import your data files for migration
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <h3 className="text-lg font-medium">How to Upload Data:</h3>
                          
                          <div className="space-y-3">
                            <div className="flex items-start gap-2">
                              <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                              <div>
                                <p className="font-medium">Click the <span className="bg-muted px-2 py-1 rounded">Select File</span> button to browse and select a file from your computer</p>
                                <p className="text-muted-foreground text-sm mt-1">Supported formats: CSV, Excel (.xlsx, .xls), SQL backup files</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-2">
                              <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                              <div>
                                <p className="font-medium">Alternatively, click <span className="bg-muted px-2 py-1 rounded">Load Sample Baltimore Data</span> to try the tool with sample data</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-2">
                              <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                              <div>
                                <p className="font-medium">Once uploaded, you&quot;ll see a confirmation message and details about your file</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-8">
                            <h3 className="text-lg font-medium">What&quot;s Happening Behind the Scenes:</h3>
                            <ul className="space-y-2 ml-5 list-disc mt-2">
                              <li>The tool reads your file and detects the format automatically</li>
                              <li>For CSV files, it identifies column headers and data types</li>
                              <li>For Excel files, it processes the first sheet by default</li>
                              <li>The system prepares the data for analysis in the next step</li>
                            </ul>
                          </div>
                          
                          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <h3 className="flex items-center gap-2 text-amber-800 font-medium">
                              <HelpCircle className="h-5 w-5 text-amber-500" />
                              Tip
                            </h3>
                            <p className="text-amber-800 mt-1">
                              Make sure your data files have clear column headers in the first row.
                              This helps the system correctly identify your data structure.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="analysis" className="mt-0">
                      <Card>
                        <CardHeader>
                          <CardTitle>Analysis Section</CardTitle>
                          <CardDescription>
                            Explore and understand your dataset
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="leading-relaxed">
                            Once your data is uploaded, click the <span className="bg-muted px-2 py-1 rounded">Analysis</span> tab 
                            to explore your dataset in detail. This section helps you understand the structure and quality of your data
                            before proceeding with mapping.
                          </p>
                          
                          <h3 className="text-lg font-medium mt-4">Understanding the Analysis Section:</h3>
                          
                          <div className="space-y-6 mt-2">
                            <div className="border rounded-lg p-4">
                              <h4 className="font-medium flex items-center gap-2">
                                <div className="bg-blue-100 p-1 rounded">
                                  <Database className="h-4 w-4 text-blue-600" />
                                </div>
                                Structure Tab
                              </h4>
                              <ul className="space-y-1 ml-5 list-disc mt-2 text-sm">
                                <li>Shows a summary of your data (row count, column count)</li>
                                <li>Identifies potential ID fields and reference fields</li>
                                <li>Lists all columns with their data types and sample values</li>
                                <li>Detects geographic data if present</li>
                              </ul>
                            </div>
                            
                            <div className="border rounded-lg p-4">
                              <h4 className="font-medium flex items-center gap-2">
                                <div className="bg-green-100 p-1 rounded">
                                  <FileText className="h-4 w-4 text-green-600" />
                                </div>
                                Data Preview Tab
                              </h4>
                              <ul className="space-y-1 ml-5 list-disc mt-2 text-sm">
                                <li>Displays the first few rows of your data</li>
                                <li>Helps you visually inspect actual values</li>
                              </ul>
                            </div>
                            
                            <div className="border rounded-lg p-4">
                              <h4 className="font-medium flex items-center gap-2">
                                <div className="bg-red-100 p-1 rounded">
                                  <Upload className="h-4 w-4 text-red-600" />
                                </div>
                                Geographic Data Tab (if applicable)
                              </h4>
                              <ul className="space-y-1 ml-5 list-disc mt-2 text-sm">
                                <li>Visualizes location data on an interactive map</li>
                                <li>Offers different view modes: Points, Clusters, and Connections</li>
                                <li>Toggle options for labels and boundaries</li>
                              </ul>
                            </div>
                            
                            <div className="border rounded-lg p-4">
                              <h4 className="font-medium flex items-center gap-2">
                                <div className="bg-purple-100 p-1 rounded">
                                  <BarChart className="h-4 w-4 text-purple-600" />
                                </div>
                                Statistics Tab
                              </h4>
                              <ul className="space-y-1 ml-5 list-disc mt-2 text-sm">
                                <li>Provides numerical summaries for each field</li>
                                <li>Shows min/max values for numeric fields</li>
                                <li>Detects date formats</li>
                                <li>Counts unique and missing values</li>
                              </ul>
                            </div>
                          </div>
                          
                          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h3 className="text-blue-800 font-medium mb-2">Tips for Effective Analysis:</h3>
                            <ul className="space-y-2 ml-5 list-disc text-blue-700">
                              <li>Check for missing or incorrect data in the preview</li>
                              <li>Look at the data types detected - make sure they match what you expect</li>
                              <li>Examine potential ID fields to ensure they&quot;re unique</li>
                              <li>If geographic data is detected, verify coordinates on the map</li>
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="mapping" className="mt-0">
                      <Card>
                        <CardHeader>
                          <CardTitle>Field Mapping Section</CardTitle>
                          <CardDescription>
                            Connect source fields to target fields
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="leading-relaxed">
                            The Field Mapping section is where you connect fields from your source data 
                            to fields in the target system. This is a critical step in the migration process.
                          </p>
                          
                          <h3 className="text-lg font-medium mt-4">How Field Mapping Works:</h3>
                          
                          <div className="space-y-3 mt-2">
                            <div className="flex items-start gap-2">
                              <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                              <div>
                                <p className="font-medium">The left column shows your <span className="bg-muted px-2 py-1 rounded">source fields</span> (from your uploaded data)</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-2">
                              <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                              <div>
                                <p className="font-medium">The right column shows the <span className="bg-muted px-2 py-1 rounded">target fields</span> (where data will be moved to)</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-2">
                              <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                              <div>
                                <p className="font-medium">The middle column shows the <span className="bg-muted px-2 py-1 rounded">transformation</span> applied</p>
                              </div>
                            </div>
                          </div>
                          
                          <h3 className="text-lg font-medium mt-6">Types of transformations available:</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                            <div className="border rounded-lg p-3">
                              <h4 className="font-medium text-sm">No transformation</h4>
                              <p className="text-xs text-muted-foreground">Direct copy (no changes)</p>
                            </div>
                            
                            <div className="border rounded-lg p-3">
                              <h4 className="font-medium text-sm">Combine fields</h4>
                              <p className="text-xs text-muted-foreground">Merge multiple fields (like date and time)</p>
                            </div>
                            
                            <div className="border rounded-lg p-3">
                              <h4 className="font-medium text-sm">Split field</h4>
                              <p className="text-xs text-muted-foreground">Divide one field into multiple parts</p>
                            </div>
                            
                            <div className="border rounded-lg p-3">
                              <h4 className="font-medium text-sm">Format value</h4>
                              <p className="text-xs text-muted-foreground">Change the format (like date formats)</p>
                            </div>
                            
                            <div className="border rounded-lg p-3">
                              <h4 className="font-medium text-sm">Value lookup</h4>
                              <p className="text-xs text-muted-foreground">Replace values with alternatives</p>
                            </div>
                            
                            <div className="border rounded-lg p-3">
                              <h4 className="font-medium text-sm">Create object</h4>
                              <p className="text-xs text-muted-foreground">Combine multiple fields into a structured object</p>
                            </div>
                            
                            <div className="border rounded-lg p-3">
                              <h4 className="font-medium text-sm">Create geopoint</h4>
                              <p className="text-xs text-muted-foreground">Convert latitude/longitude into geographic points</p>
                            </div>
                          </div>
                          
                          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <h3 className="text-green-800 font-medium mb-2">Tips for Effective Mapping:</h3>
                            <ul className="space-y-2 ml-5 list-disc text-green-700">
                              <li>Check &quot;Unmapped Required Target Fields&quot; to ensure all necessary fields are mapped</li>
                              <li>Use the confidence indicator to focus on mappings that need verification</li>
                              <li>For complex transformations, click the Settings icon to configure detailed parameters</li>
                              <li>The completeness percentage shows your overall mapping progress</li>
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="sql" className="mt-0">
                      <Card>
                        <CardHeader>
                          <CardTitle>SQL Builder Section</CardTitle>
                          <CardDescription>
                            Create custom queries for data extraction
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="leading-relaxed">
                            The SQL Builder section helps you create SQL queries for extracting or transforming data.
                            This is useful for more complex migrations or when you need to filter or join data.
                          </p>
                          
                          <h3 className="text-lg font-medium mt-4">Using the SQL Builder:</h3>
                          
                          <div className="space-y-3 mt-2">
                            <div className="flex items-start gap-2">
                              <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                              <div>
                                <p className="font-medium"><span className="bg-muted px-2 py-1 rounded">Select Table</span>: Choose the main data table you want to query</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-2">
                              <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                              <div>
                                <p className="font-medium"><span className="bg-muted px-2 py-1 rounded">Select Columns</span>: Choose which fields to include in your query</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-2">
                              <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                              <div>
                                <p className="font-medium"><span className="bg-muted px-2 py-1 rounded">WHERE Conditions</span>: Add filtering criteria</p>
                                <ul className="ml-5 list-disc text-sm text-muted-foreground mt-1">
                                  <li>Click &quot;Add Condition&quot; to create new filters</li>
                                  <li>For each condition, specify a column, operator, and value</li>
                                </ul>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-2">
                              <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
                              <div>
                                <p className="font-medium"><span className="bg-muted px-2 py-1 rounded">JOIN Settings</span>: Connect related tables</p>
                                <ul className="ml-5 list-disc text-sm text-muted-foreground mt-1">
                                  <li>Select a table to join with</li>
                                  <li>Specify which columns to use for joining</li>
                                </ul>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-2">
                              <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">5</div>
                              <div>
                                <p className="font-medium"><span className="bg-muted px-2 py-1 rounded">ORDER BY & LIMIT</span>: Sort results and set limits</p>
                                <ul className="ml-5 list-disc text-sm text-muted-foreground mt-1">
                                  <li>Choose a column to sort by</li>
                                  <li>Set ascending or descending order</li>
                                  <li>Limit the number of results</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm font-medium">The SQL query is automatically generated and displayed at the bottom.</p>
                          </div>
                          
                          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h3 className="text-blue-800 font-medium mb-2">Tips for SQL Builder:</h3>
                            <ul className="space-y-2 ml-5 list-disc text-blue-700">
                              <li>Use the &quot;*&quot; option to select all columns</li>
                              <li>For complex data, use multiple WHERE conditions to filter precisely</li>
                              <li>Join tables when you need to combine data from multiple sources</li>
                              <li>The generated SQL can be copied and used in other database tools</li>
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="validation" className="mt-0">
                      <Card>
                        <CardHeader>
                          <CardTitle>Validation Rules Section</CardTitle>
                          <CardDescription>
                            Define rules to ensure data quality
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="leading-relaxed">
                            The Validation Rules section helps you ensure data quality by defining rules 
                            that your data must follow. This prevents bad data from entering your target system.
                          </p>
                          
                          <h3 className="text-lg font-medium mt-4">Creating Validation Rules:</h3>
                          
                          <div className="space-y-3 mt-2">
                            <div className="flex items-start gap-2">
                              <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                              <div>
                                <p className="font-medium">On the Validation Rules tab, click <span className="bg-muted px-2 py-1 rounded">Create First Rule</span> or go to the <span className="bg-muted px-2 py-1 rounded">Create Rule</span> tab</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-2">
                              <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                              <div>
                                <p className="font-medium">For each rule, specify:</p>
                                <ul className="ml-5 list-disc text-sm text-muted-foreground mt-1">
                                  <li><strong>Field Name</strong>: Which field to validate</li>
                                  <li><strong>Rule Type</strong>: Type of validation to perform</li>
                                  <li><strong>Parameters</strong>: Any parameters needed for the rule</li>
                                  <li><strong>Error Message</strong>: Message to display when validation fails</li>
                                  <li><strong>Status</strong>: Active, Draft, or Disabled</li>
                                </ul>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-2">
                              <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                              <div>
                                <p className="font-medium">Click <span className="bg-muted px-2 py-1 rounded">Add Validation Rule</span> to save your rule</p>
                              </div>
                            </div>
                          </div>
                          
                          <h3 className="text-lg font-medium mt-6">Available Rule Types:</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                            <div className="border rounded-lg p-3">
                              <h4 className="font-medium text-sm">Required Field</h4>
                              <p className="text-xs text-muted-foreground">Field cannot be empty</p>
                            </div>
                            
                            <div className="border rounded-lg p-3">
                              <h4 className="font-medium text-sm">String Length</h4>
                              <p className="text-xs text-muted-foreground">Field must have a specific length</p>
                            </div>
                            
                            <div className="border rounded-lg p-3">
                              <h4 className="font-medium text-sm">Numeric Range</h4>
                              <p className="text-xs text-muted-foreground">Number must be within a range</p>
                            </div>
                            
                            <div className="border rounded-lg p-3">
                              <h4 className="font-medium text-sm">Regular Expression</h4>
                              <p className="text-xs text-muted-foreground">Value must match a pattern</p>
                            </div>
                            
                            <div className="border rounded-lg p-3">
                              <h4 className="font-medium text-sm">Date Format</h4>
                              <p className="text-xs text-muted-foreground">Date must follow a specific format</p>
                            </div>
                            
                            <div className="border rounded-lg p-3">
                              <h4 className="font-medium text-sm">Allowed Values</h4>
                              <p className="text-xs text-muted-foreground">Value must be from a predefined list</p>
                            </div>
                            
                            <div className="border rounded-lg p-3">
                              <h4 className="font-medium text-sm">Unique Values</h4>
                              <p className="text-xs text-muted-foreground">No duplicates allowed</p>
                            </div>
                            
                            <div className="border rounded-lg p-3">
                              <h4 className="font-medium text-sm">Data Type Check</h4>
                              <p className="text-xs text-muted-foreground">Value must be a specific type</p>
                            </div>
                          </div>
                          
                          <h3 className="text-lg font-medium mt-6">Testing Your Validation Rules:</h3>
                          
                          <div className="space-y-3 mt-2">
                            <div className="flex items-start gap-2">
                              <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                              <div>
                                <p>After creating rules, click <span className="bg-muted px-2 py-1 rounded">Test Rules</span></p>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-2">
                              <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                              <div>
                                <p>The system will check your data against all active rules</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-2">
                              <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                              <div>
                                <p>Review the results to see which records pass or fail</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-2">
                              <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
                              <div>
                                <p>Adjust rules as needed and test again</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <h3 className="text-green-800 font-medium mb-2">Tips for Validation Rules:</h3>
                            <ul className="space-y-2 ml-5 list-disc text-green-700">
                              <li>Start with basic rules (required fields, allowed values) before complex ones</li>
                              <li>Test rules frequently as you build them</li>
                              <li>Use the &quot;Draft&quot; status to create rules without activating them yet</li>
                              <li>Export your rules to reuse them in other migrations</li>
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </ScrollAreaPrimitive.Viewport>
                  <ScrollAreaPrimitive.Scrollbar
                    className="flex select-none touch-none p-0.5 bg-muted transition-colors duration-[160ms] ease-out hover:bg-muted/50 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
                    orientation="vertical"
                  >
                    <ScrollAreaPrimitive.Thumb 
                      className="flex-1 bg-border rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" 
                    />
                  </ScrollAreaPrimitive.Scrollbar>
                  <ScrollAreaPrimitive.Corner className="bg-muted" />
                </ScrollArea>
              </div>
            </Tabs>
          </div>
          
          <DialogFooter className="border-t pt-4 mt-4">
            <Button variant="outline" onClick={handleDownloadGuide} className="gap-2">
              <Download className="h-4 w-4" />
              Download Full User Guide
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserGuide;