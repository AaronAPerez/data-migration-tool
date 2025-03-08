import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs';
import { FileCheck, FileWarning, CheckSquare, Table, Badge } from 'lucide-react';
import { format } from 'path';
import React, { useState } from 'react'
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/table';

// Data Validation Rules Builder 
// Allows creation and testing of validation rules for data migration.
// Demonstrates understanding of data integrity requirements.
 
const DataValidationRules = ({ data }) => {
  const [activeTab, setActiveTab] = useState('rules');
  const [rules, setRules] = useState([
    { id: 1, field: 'address', rule: 'required', message: 'Address is required', status: 'active' },
    { id: 2, field: 'incident_date', rule: 'date_format', params: 'YYYY-MM-DD', message: 'Invalid date format', status: 'active' },
    { id: 3, field: 'latitude', rule: 'range', params: { min: -90, max: 90 }, message: 'Latitude must be between -90 and 90', status: 'active' },
    { id: 4, field: 'longitude', rule: 'range', params: { min: -180, max: 180 }, message: 'Longitude must be between -180 and 180', status: 'active' },
    { id: 5, field: 'status', rule: 'allowed_values', params: ['open', 'closed', 'in-progress'], message: 'Invalid status value', status: 'active' },
    { id: 6, field: 'email', rule: 'regex', params: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}, message: 'Invalid email format', status: 'draft' }
  ]);
  
  const [newRule, setNewRule] = useState({
    field: '',
    rule: 'required',
    params: '',
    message: '',
    status: 'draft'
  });
  
  const [testResults, setTestResults] = useState(null);
  
  const ruleTypes = [
    { value: 'required', label: 'Required Field' },
    { value: 'length', label: 'String Length' },
    { value: 'range', label: 'Numeric Range' },
    { value: 'regex', label: 'Regular Expression' },
    { value: 'date_format', label: 'Date Format' },
    { value: 'allowed_values', label: 'Allowed Values' },
    { value: 'unique', label: 'Unique Values' },
    { value: 'data_type', label: 'Data Type Check' }
  ];
  
  // Sample data for testing
  const sampleData = data || [
    { id: 1, address: '123 Main St', city: 'Baltimore', incident_date: '2023-04-15', latitude: 39.2904, longitude: -76.6122, status: 'closed', email: 'contact@fd.org' },
    { id: 2, address: '', city: 'Baltimore', incident_date: '2023/05/20', latitude: 39.2809, longitude: -76.5883, status: 'open', email: 'support@fd.org' },
    { id: 3, address: '456 Park Ave', city: 'Baltimore', incident_date: '2023-06-30', latitude: 92.5, longitude: -76.6150, status: 'pending', email: 'info@fd.org' },
    { id: 4, address: '789 Harbor Dr', city: 'Baltimore', incident_date: '2023-07-12', latitude: 39.2932, longitude: -185.2, status: 'in-progress', email: 'notify@fd.org' },
    { id: 5, address: '101 Tower Rd', city: 'Baltimore', incident_date: 'invalid', latitude: 39.2732, longitude: -76.6031, status: 'closed', email: 'test@fd' }
  ];
  
  // Add a new rule
  const addRule = () => {
    if (!newRule.field || !newRule.message) return;
    
    const ruleId = Math.max(0, ...rules.map(r => r.id)) + 1;
    
    setRules([
      ...rules,
      {
        id: ruleId,
        ...newRule
      }
    ]);
    
    // Reset form
    setNewRule({
      field: '',
      rule: 'required',
      params: '',
      message: '',
      status: 'draft'
    });
  };
  
  // Update existing rule
  const updateRule = (id, field, value) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, [field]: value } : rule
    ));
  };
  
  // Delete rule
  const deleteRule = (id) => {
    setRules(rules.filter(rule => rule.id !== id));
  };
  
  // Test rules against sample data
  const testRules = () => {
    const results = {
      total: sampleData.length,
      passed: 0,
      failed: 0,
      records: []
    };
    
    // For each data record
    sampleData.forEach(record => {
      const recordResult = {
        id: record.id,
        errors: [],
        passed: true
      };
      
      // Check active rules
      rules.filter(rule => rule.status === 'active').forEach(rule => {
        // Skip if field doesn't exist
        if (!(rule.field in record)) return;
        
        const value = record[rule.field];
        let valid = true;
        
        // Validate based on rule type
        switch (rule.rule) {
          case 'required':
            valid = value !== null && value !== undefined && value !== '';
            break;
            
          case 'length':
            if (typeof value !== 'string') {
              valid = false;
            } else {
              const params = typeof rule.params === 'object' ? rule.params : { min: 0, max: parseInt(rule.params) };
              valid = value.length >= (params.min || 0) && 
                     (params.max ? value.length <= params.max : true);
            }
            break;
            
          case 'range':
            if (typeof value !== 'number') {
              valid = false;
            } else {
              const params = typeof rule.params === 'object' ? rule.params : JSON.parse(rule.params);
              valid = value >= (params.min !== undefined ? params.min : -Infinity) && 
                     value <= (params.max !== undefined ? params.max : Infinity);
            }
            break;
            
          case 'regex':
            try {
              const regex = new RegExp(rule.params);
              valid = regex.test(String(value));
            } catch (e) {
              valid = false;
            }
            break;
            
          case 'date_format':
            // Simple date validation - could be enhanced with proper date library
            if (rule.params === 'YYYY-MM-DD') {
              valid = /^\d{4}-\d{2}-\d{2}$/.test(String(value));
            } else {
              valid = !isNaN(Date.parse(value));
            }
            break;
            
          case 'allowed_values':
            const allowedValues = Array.isArray(rule.params) ? 
                                 rule.params : 
                                 rule.params.split(',').map(v => v.trim());
            valid = allowedValues.includes(String(value).toLowerCase());
            break;
            
          case 'unique':
            // Would need full dataset to properly check
            valid = true;
            break;
            
          case 'data_type':
            switch (rule.params) {
              case 'number':
                valid = typeof value === 'number';
                break;
              case 'string':
                valid = typeof value === 'string';
                break;
              case 'boolean':
                valid = typeof value === 'boolean';
                break;
              default:
                valid = true;
            }
            break;
            
          default:
            valid = true;
        }
        
        if (!valid) {
          recordResult.errors.push({
            field: rule.field,
            message: rule.message,
            value: value
          });
          recordResult.passed = false;
        }
      });
      
      if (recordResult.passed) {
        results.passed++;
      } else {
        results.failed++;
      }
      
      results.records.push(recordResult);
    });
    
    setTestResults(results);
    setActiveTab('test');
  };
  
  // Export rules as JSON
  const exportRules = () => {
    const rulesJson = JSON.stringify(rules, null, 2);
    const blob = new Blob([rulesJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data_validation_rules.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="rules">
            <FileCheck className="w-4 h-4 mr-2" />
            Validation Rules
          </TabsTrigger>
          <TabsTrigger value="create">
            <FileWarning className="w-4 h-4 mr-2" />
            Create Rule
          </TabsTrigger>
          <TabsTrigger value="test" disabled={!testResults}>
            <CheckSquare className="w-4 h-4 mr-2" />
            Test Results
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="rules" className="space-y-4">
          <div className="flex justify-between">
            <h3 className="text-lg font-medium">Data Validation Rules</h3>
            <div className="space-x-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={exportRules}
              >
                Export Rules
              </Button>
              <Button 
                size="sm"
                onClick={testRules}
              >
                Test Rules
              </Button>
            </div>
          </div>
          
          {rules.length === 0 ? (
            <div className="p-4 text-center bg-muted rounded-lg">
              <p>No validation rules defined yet.</p>
              <Button 
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setActiveTab('create')}
              >
                Create First Rule
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Field</TableHead>
                    <TableHead>Validation</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map(rule => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.field}</TableCell>
                      <TableCell>
                        <div>
                          <Badge variant="outline">
                            {ruleTypes.find(t => t.value === rule.rule)?.label || rule.rule}
                          </Badge>
                        </div>
                        {rule.params && (
                          <div className="text-xs mt-1 text-muted-foreground">
                            {typeof rule.params === 'object' 
                              ? JSON.stringify(rule.params) 
                              : rule.params}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{rule.message}</TableCell>
                      <TableCell>
                        <select
                          value={rule.status}
                          onChange={(e) => updateRule(rule.id, 'status', e.target.value)}
                          className="p-1 text-xs border rounded"
                        >
                          <option value="active">Active</option>
                          <option value="draft">Draft</option>
                          <option value="disabled">Disabled</option>
                        </select>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => deleteRule(rule.id)}
                          >
                            ✕
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="create" className="space-y-4">
          <h3 className="text-lg font-medium">Create New Validation Rule</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Field Name</label>
                <Input
                  value={newRule.field}
                  onChange={(e) => setNewRule({...newRule, field: e.target.value})}
                  placeholder="e.g. address, latitude, incident_date"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Rule Type</label>
                <select
                  value={newRule.rule}
                  onChange={(e) => setNewRule({...newRule, rule: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  {ruleTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Parameters
                  <span className="text-xs text-muted-foreground ml-1">
                    {newRule.rule === 'required' ? '(none needed)' : ''}
                    {newRule.rule === 'length' ? '(min,max or max only)' : ''}
                    {newRule.rule === 'range' ? '(min,max)' : ''}
                    {newRule.rule === 'regex' ? '(pattern)' : ''}
                    {newRule.rule === 'date_format' ? '(format)' : ''}
                    {newRule.rule === 'allowed_values' ? '(comma-separated)' : ''}
                    {newRule.rule === 'data_type' ? '(type name)' : ''}
                  </span>
                </label>
                <Input
                  value={newRule.params}
                  onChange={(e) => setNewRule({...newRule, params: e.target.value})}
                  placeholder={
                    newRule.rule === 'required' ? 'No parameters needed' :
                    newRule.rule === 'length' ? 'e.g. 5,100 or just 100' :
                    newRule.rule === 'range' ? 'e.g. -90,90' :
                    newRule.rule === 'regex' ? 'e.g. ^[A-Z].*' :
                    newRule.rule === 'date_format' ? 'e.g. YYYY-MM-DD' :
                    newRule.rule === 'allowed_values' ? 'e.g. open,closed,pending' :
                    newRule.rule === 'data_type' ? 'e.g. number, string, boolean' :
                    'Parameters'
                  }
                  disabled={newRule.rule === 'required'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Error Message</label>
                <Input
                  value={newRule.message}
                  onChange={(e) => setNewRule({...newRule, message: e.target.value})}
                  placeholder="e.g. Field is required, Invalid format"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={newRule.status}
                  onChange={(e) => setNewRule({...newRule, status: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
              
              <div className="pt-2">
                <Button 
                  onClick={addRule}
                  disabled={!newRule.field || !newRule.message}
                >
                  Add Validation Rule
                </Button>
              </div>
            </div>
            
            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="font-medium mb-2">Rule Preview</h4>
              
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Field:</span>
                  <span className="ml-2 font-medium">{newRule.field || '(not set)'}</span>
                </div>
                
                <div>
                  <span className="text-sm text-muted-foreground">Validation:</span>
                  <span className="ml-2">
                    <Badge variant="outline">
                      {ruleTypes.find(t => t.value === newRule.rule)?.label || newRule.rule}
                    </Badge>
                  </span>
                </div>
                
                {newRule.params && (
                  <div>
                    <span className="text-sm text-muted-foreground">Parameters:</span>
                    <code className="ml-2 text-sm bg-muted p-1 rounded">
                      {newRule.params}
                    </code>
                  </div>
                )}
                
                <div>
                  <span className="text-sm text-muted-foreground">Error Message:</span>
                  <span className="ml-2">{newRule.message || '(not set)'}</span>
                </div>
                
                <div>
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant={
                    newRule.status === 'active' ? 'default' :
                    newRule.status === 'draft' ? 'secondary' : 
                    'outline'
                  }>
                    {newRule.status}
                  </Badge>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-muted-foreground">
                <h4 className="font-medium text-foreground mb-1">Sample Usage:</h4>
                <pre className="p-2 bg-muted rounded text-xs">
{`// Validation code example
function validate${newRule.field ? newRule.field.charAt(0).toUpperCase() + newRule.field.slice(1) : 'Field'}(value) {
  ${newRule.rule === 'required' 
    ? `if (!value) return "${newRule.message || 'Field is required'}";`
    : newRule.rule === 'length' 
    ? `if (value.length ${newRule.params ? `> ${newRule.params}` : '< 1 || value.length > maxLength'}) return "${newRule.message || 'Invalid length'}";`
    : newRule.rule === 'range'
    ? `if (value < min || value > max) return "${newRule.message || 'Value out of range'}";`
    : newRule.rule === 'regex'
    ? `if (!/${newRule.params || '.*'}/.test(value)) return "${newRule.message || 'Invalid format'}";`
    : newRule.rule === 'allowed_values'
    ? `if (!['${(newRule.params || 'value1,value2').split(',').join("', '")}'].includes(value)) return "${newRule.message || 'Invalid value'}";`
    : `// Add validation logic here`
  }
  return null; // No error
}`}
                </pre>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="test" className="space-y-4">
          {testResults && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Validation Test Results</h3>
                <div>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={testRules}
                  >
                    Run Tests Again
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg bg-muted/20">
                  <div className="text-sm text-muted-foreground mb-1">Total Records</div>
                  <div className="text-2xl font-bold">{testResults.total}</div>
                </div>
                
                <div className="p-4 border rounded-lg bg-green-50">
                  <div className="text-sm text-muted-foreground mb-1">Passed</div>
                  <div className="text-2xl font-bold text-green-600">
                    {testResults.passed} 
                    <span className="text-sm font-normal ml-1">
                      ({Math.round((testResults.passed / testResults.total) * 100)}%)
                    </span>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg bg-red-50">
                  <div className="text-sm text-muted-foreground mb-1">Failed</div>
                  <div className="text-2xl font-bold text-red-600">
                    {testResults.failed}
                    <span className="text-sm font-normal ml-1">
                      ({Math.round((testResults.failed / testResults.total) * 100)}%)
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Record ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Issues</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testResults.records.map(record => (
                      <TableRow key={record.id}>
                        <TableCell>{record.id}</TableCell>
                        <TableCell>
                          {record.passed ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              Passed
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              Failed
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {record.errors.length > 0 ? (
                            <div className="space-y-1">
                              {record.errors.map((error, i) => (
                                <div key={i} className="text-sm">
                                  <span className="font-medium">{error.field}:</span> {error.message}
                                  <div className="text-xs text-muted-foreground">
                                    Value: {String(error.value)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              No validation errors
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ValidationRules