import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRightLeft, 
  AlertTriangle, 
  Settings,
  Plus,
  X,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { FieldInfo, MappingItem } from '@/types/shared-types';

interface MappingProps {
  sourceFields?: FieldInfo[];
  targetFields?: FieldInfo[];
}

/**
 * Field Mapping Component
 * Interactive interface for mapping source fields to target fields
 * with transformation options
 */
const MappingSection = ({ sourceFields, targetFields }: MappingProps) => {
  // Sample data for demonstration
  const sampleSourceFields = sourceFields || [
    { name: 'incident_id', type: 'varchar', sample: 'FD-2023-1001' },
    { name: 'incident_date', type: 'date', sample: '2023-05-12' },
    { name: 'incident_time', type: 'time', sample: '14:32:45' },
    { name: 'address', type: 'varchar', sample: '123 Main St' },
    { name: 'city', type: 'varchar', sample: 'Baltimore' },
    { name: 'state', type: 'varchar', sample: 'MD' },
    { name: 'zip', type: 'varchar', sample: '21201' },
    { name: 'latitude', type: 'decimal', sample: '39.2904' },
    { name: 'longitude', type: 'decimal', sample: '-76.6122' },
    { name: 'incident_type', type: 'varchar', sample: 'Structure Fire' },
    { name: 'unit_id', type: 'varchar', sample: 'E07' },
    { name: 'status', type: 'varchar', sample: 'Closed' }
  ];
  
  const sampleTargetFields = targetFields || [
    { name: 'incidentId', type: 'string', required: true, description: 'Unique identifier' },
    { name: 'incidentDateTime', type: 'datetime', required: true, description: 'Date and time of incident' },
    { name: 'location', type: 'object', required: true, description: 'Location information' },
    { name: 'coordinates', type: 'geopoint', required: false, description: 'Geographic coordinates' },
    { name: 'type', type: 'string', required: true, description: 'Type of incident' },
    { name: 'respondingUnit', type: 'string', required: true, description: 'Responding unit identifier' },
    { name: 'currentStatus', type: 'string', required: true, description: 'Current status' }
  ];
  
  const [mappings, setMappings] = useState<MappingItem[]>([
    { id: 1, sourceField: 'incident_id', targetField: 'incidentId', transform: 'none', confidence: 'high' },
    { id: 2, sourceField: 'incident_date', targetField: 'incidentDateTime', transform: 'combine', transformParams: { sourceFields: ['incident_date', 'incident_time'], format: 'YYYY-MM-DD HH:mm:ss' }, confidence: 'medium' },
    { id: 3, sourceField: 'address', targetField: 'location', transform: 'object', transformParams: { properties: ['address', 'city', 'state', 'zip'] }, confidence: 'high' },
    { id: 4, sourceField: 'latitude', targetField: 'coordinates', transform: 'geopoint', transformParams: { lat: 'latitude', lng: 'longitude' }, confidence: 'high' },
    { id: 5, sourceField: 'incident_type', targetField: 'type', transform: 'none', confidence: 'high' },
    { id: 6, sourceField: 'unit_id', targetField: 'respondingUnit', transform: 'none', confidence: 'high' },
    { id: 7, sourceField: 'status', targetField: 'currentStatus', transform: 'none', confidence: 'medium' }
  ]);
  
  const [editMapping, setEditMapping] = useState<MappingItem | null>(null);
  
  // Calculate mapping completeness
  const requiredTargetFields = sampleTargetFields.filter(f => f.required).length;
  const mappedRequiredFields = sampleTargetFields
    .filter(f => f.required)
    .filter(f => mappings.some(m => m.targetField === f.name))
    .length;
  
  const completeness = Math.round((mappedRequiredFields / requiredTargetFields) * 100);
  
  // Note: This function is kept for future features but is not currently used
  // /**
  //  * Update mapping
  //  */
  // const updateMapping = (id: number, field: string, value: string) => {
  //   setMappings(mappings.map(mapping => 
  //     mapping.id === id ? { ...mapping, [field]: value } : mapping
  //   ));
  // };
  
  /**
   * Add new mapping
   */
  const addMapping = () => {
    const newId = Math.max(0, ...mappings.map(m => m.id)) + 1;
    setMappings([...mappings, { 
      id: newId, 
      sourceField: '', 
      targetField: '', 
      transform: 'none', 
      confidence: 'manual' 
    }]);
  };
  
  /**
   * Remove mapping
   */
  const removeMapping = (id: number) => {
    setMappings(mappings.filter(m => m.id !== id));
  };
  
  /**
   * Open edit dialog
   */
  const openEditDialog = (mapping: MappingItem) => {
    setEditMapping({ ...mapping });
  };
  
  /**
   * Save edit mapping
   */
  const saveEditMapping = () => {
    if (!editMapping) return;
    
    setMappings(mappings.map(mapping => 
      mapping.id === editMapping.id ? editMapping : mapping
    ));
    
    setEditMapping(null);
  };
  
  /**
   * Get confidence badge
   */
  const getConfidenceBadge = (confidence: 'high' | 'medium' | 'low' | 'manual') => {
    switch (confidence) {
      case 'high':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-1 px-2 py-1">
            <CheckCircle className="h-3 w-3" />
            High
          </Badge>
        );
      case 'medium':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 px-2 py-1">
            Medium
          </Badge>
        );
      case 'low':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 px-2 py-1">
            Low
          </Badge>
        );
      case 'manual':
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 px-2 py-1">
            Manual
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  /**
   * Get transform description
   */
  const getTransformDescription = (mapping: MappingItem) => {
    switch (mapping.transform) {
      case 'none':
        return 'Direct copy';
      case 'combine':
        return (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Combine</span>
            <div className="space-x-1">
              {mapping.transformParams?.sourceFields?.map((field, idx) => (
                <React.Fragment key={field}>
                  <Badge variant="outline" className="bg-gray-50">
                    {field}
                  </Badge>
                  {idx < (mapping.transformParams?.sourceFields?.length || 0) - 1 && "+"}
                </React.Fragment>
              ))}
            </div>
          </div>
        );
      case 'object':
        return (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Object from</span>
            <div className="flex flex-wrap gap-1">
              {mapping.transformParams?.properties?.map((prop) => (
                <Badge key={prop} variant="outline" className="bg-gray-50">
                  {prop}
                </Badge>
              ))}
            </div>
          </div>
        );
      case 'geopoint':
        return (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">GeoPoint</span>
            <Badge variant="outline" className="bg-gray-50">
              {mapping.transformParams?.lat}
            </Badge>
            <span>+</span>
            <Badge variant="outline" className="bg-gray-50">
              {mapping.transformParams?.lng}
            </Badge>
          </div>
        );
      case 'split':
        return `Split by ${mapping.transformParams?.delimiter}`;
      case 'format':
        return (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Format:</span>
            <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">
              {mapping.transformParams?.format}
            </code>
          </div>
        );
      case 'lookup':
        return 'Value lookup/translation';
      default:
        return mapping.transform;
    }
  };
  
  /**
   * Get field type badge
   */
  const getFieldTypeBadge = (type: string) => {
    const bgColor = 
      type === 'string' || type === 'varchar' ? 'bg-blue-50 text-blue-700' :
      type === 'number' || type === 'decimal' ? 'bg-purple-50 text-purple-700' :
      type === 'date' || type === 'datetime' ? 'bg-green-50 text-green-700' :
      type === 'boolean' ? 'bg-yellow-50 text-yellow-700' :
      type === 'object' ? 'bg-gray-50 text-gray-700' :
      type === 'geopoint' ? 'bg-red-50 text-red-700' :
      'bg-gray-50 text-gray-700';
    
    return (
      <span className={`${bgColor} text-xs px-2 py-0.5 rounded-full font-medium`}>
        {type}
      </span>
    );
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-primary">
            <ArrowRightLeft className="w-5 h-5" />
            Field Mapping
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium">
              Completeness: <span className="font-bold">{completeness}%</span>
            </div>
            <div className="w-24 h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div 
                className={`h-full transition-all duration-500 ${
                  completeness >= 90 ? 'bg-green-500' : 
                  completeness >= 70 ? 'bg-blue-500' : 
                  completeness >= 50 ? 'bg-yellow-500' : 
                  'bg-red-500'
                }`}
                style={{ width: `${completeness}%` }}
              ></div>
            </div>
          </div>
        </div>
        <CardDescription>
          Map fields from your source data to target data structure
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={addMapping} className="flex items-center gap-1 shadow">
              <Plus className="h-4 w-4" />
              Add Mapping
            </Button>
          </div>
          
          <div className="border rounded-lg overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[250px]">Source Field</TableHead>
                  <TableHead className="w-[50px] text-center"></TableHead>
                  <TableHead className="w-[250px]">Target Field</TableHead>
                  <TableHead>Transformation</TableHead>
                  <TableHead className="w-[100px]">Confidence</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mappings.map(mapping => (
                  <TableRow key={mapping.id} className="hover:bg-muted/10 transition-colors">
                    <TableCell className="border-r border-dashed border-muted">
                      <div className="font-medium">{mapping.sourceField}</div>
                      {sampleSourceFields.find(f => f.name === mapping.sourceField)?.sample && (
                        <div className="flex items-center mt-1 gap-2">
                          <span className="text-xs text-muted-foreground">Sample:</span>
                          <code className="text-xs bg-muted/30 px-2 py-0.5 rounded">
                            {String(sampleSourceFields.find(f => f.name === mapping.sourceField)?.sample || '')}
                          </code>
                        </div>
                      )}
                      {sampleSourceFields.find(f => f.name === mapping.sourceField)?.type && (
                        <div className="mt-1">
                          {getFieldTypeBadge(sampleSourceFields.find(f => f.name === mapping.sourceField)?.type || '')}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <ArrowRight className="w-4 h-4 text-muted-foreground mx-auto" />
                    </TableCell>
                    <TableCell className="border-l border-dashed border-muted">
                      <div className="font-medium">{mapping.targetField}</div>
                      {sampleTargetFields.find(f => f.name === mapping.targetField)?.required && (
                        <div className="mt-1">
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">Required</Badge>
                        </div>
                      )}
                      {sampleTargetFields.find(f => f.name === mapping.targetField)?.type && (
                        <div className="mt-1">
                          {getFieldTypeBadge(sampleTargetFields.find(f => f.name === mapping.targetField)?.type || '')}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{getTransformDescription(mapping)}</div>
                    </TableCell>
                    <TableCell>
                      {getConfidenceBadge(mapping.confidence)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => openEditDialog(mapping)}
                          className="hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeMapping(mapping.id)}
                          className="hover:bg-red-50 hover:text-red-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                
                {mappings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <ArrowRightLeft className="h-8 w-8 opacity-30" />
                        <p>No field mappings defined</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={addMapping}
                          className="mt-2"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Create First Mapping
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg shadow-sm border border-blue-100">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="unmapped" className="border-none">
                <AccordionTrigger className="py-2 hover:no-underline">
                  <div className="flex items-center gap-2 text-blue-800">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="font-medium">Unmapped Required Target Fields</span>
                    
                    {/* Badge showing count of unmapped fields */}
                    {sampleTargetFields
                      .filter(f => f.required)
                      .filter(f => !mappings.some(m => m.targetField === f.name))
                      .length > 0 && (
                        <Badge className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100">
                          {sampleTargetFields
                            .filter(f => f.required)
                            .filter(f => !mappings.some(m => m.targetField === f.name))
                            .length}
                        </Badge>
                      )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                  <div className="space-y-2">
                    {sampleTargetFields
                      .filter(f => f.required)
                      .filter(f => !mappings.some(m => m.targetField === f.name))
                      .map(field => (
                        <div key={field.name} className="flex justify-between items-center p-3 bg-white rounded border shadow-sm hover:border-blue-300 transition-colors">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{field.name}</span>
                              {getFieldTypeBadge(field.type)}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">{field.description}</div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-blue-200 hover:border-blue-400 hover:bg-blue-50"
                            onClick={() => {
                              const newId = Math.max(0, ...mappings.map(m => m.id)) + 1;
                              setMappings([...mappings, { 
                                id: newId, 
                                sourceField: '', 
                                targetField: field.name, 
                                transform: 'none', 
                                confidence: 'manual' 
                              }]);
                              
                              // Open edit dialog right away for better UX
                              setTimeout(() => {
                                openEditDialog(mappings[mappings.length - 1]);
                              }, 100);
                            }}
                          >
                            <ArrowRightLeft className="w-3 h-3 mr-1" />
                            Map Field
                          </Button>
                        </div>
                      ))}
                    
                    {sampleTargetFields
                      .filter(f => f.required)
                      .filter(f => !mappings.some(m => m.targetField === f.name))
                      .length === 0 && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 text-green-800 rounded-md border border-green-100">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="font-medium">All required target fields have been mapped!</span>
                        </div>
                      )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
        
        {/* Edit Mapping Dialog */}
        {editMapping && (
          <Dialog open={!!editMapping} onOpenChange={(open) => {
            if (!open) setEditMapping(null);
          }}>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ArrowRightLeft className="h-5 w-5 text-primary" />
                  Edit Field Mapping
                </DialogTitle>
                <DialogDescription>
                  Configure how the source field maps to the target field
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-5 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Source Field</label>
                    <Select 
                      value={editMapping.sourceField}
                      onValueChange={(value) => setEditMapping({...editMapping, sourceField: value})}
                    >
                      <SelectTrigger className="w-full border-gray-300 focus:border-blue-300">
                        <SelectValue placeholder="Select source field" />
                      </SelectTrigger>
                      <SelectContent>
                        {sampleSourceFields.map(field => (
                          <SelectItem key={field.name} value={field.name}>
                            <span className="flex items-center gap-2">
                              {field.name}
                              <span className="text-xs text-gray-500">({field.type})</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {/* Show sample if available */}
                    {editMapping.sourceField && sampleSourceFields.find(f => f.name === editMapping.sourceField)?.sample && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700 font-mono">
                        Sample: {String(sampleSourceFields.find(f => f.name === editMapping.sourceField)?.sample || '')}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Target Field</label>
                    <Select 
                      value={editMapping.targetField}
                      onValueChange={(value) => setEditMapping({...editMapping, targetField: value})}
                    >
                      <SelectTrigger className="w-full border-gray-300 focus:border-blue-300">
                        <SelectValue placeholder="Select target field" />
                      </SelectTrigger>
                      <SelectContent>
                        {sampleTargetFields.map(field => (
                          <SelectItem key={field.name} value={field.name} className="flex items-center gap-2">
                            <span className="flex items-center gap-2">
                              {field.name}
                              {field.required && (
                                <Badge variant="outline" className="ml-1 bg-red-50 text-red-700 text-xs">Required</Badge>
                              )}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {/* Show description if available */}
                    {editMapping.targetField && sampleTargetFields.find(f => f.name === editMapping.targetField)?.description && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700">
                        {sampleTargetFields.find(f => f.name === editMapping.targetField)?.description}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <label className="block text-sm font-medium mb-2 text-gray-700">Transformation</label>
                  <Select 
                    value={editMapping.transform}
                    onValueChange={(value) => setEditMapping({...editMapping, transform: value})}
                  >
                    <SelectTrigger className="w-full border-gray-300 focus:border-blue-300">
                      <SelectValue placeholder="Select transformation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No transformation</SelectItem>
                      <SelectItem value="combine">Combine fields</SelectItem>
                      <SelectItem value="split">Split field</SelectItem>
                      <SelectItem value="format">Format value</SelectItem>
                      <SelectItem value="lookup">Value lookup/translation</SelectItem>
                      <SelectItem value="object">Create object</SelectItem>
                      <SelectItem value="geopoint">Create geopoint</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {editMapping.transform === 'combine' && (
                  <div className="space-y-3 bg-gray-50 p-3 rounded-md border">
                    <label className="block text-sm font-medium text-gray-700">Fields to Combine</label>
                    <div className="grid grid-cols-2 gap-2">
                      {sampleSourceFields.map(field => (
                        <div key={field.name} className="flex items-center p-2 bg-white rounded border">
                          <input 
                            type="checkbox" 
                            id={`combine-${field.name}`}
                            checked={(editMapping.transformParams?.sourceFields || []).includes(field.name)}
                            onChange={(e) => {
                              const currentFields = editMapping.transformParams?.sourceFields || [];
                              const updatedFields = e.target.checked
                                ? [...currentFields, field.name]
                                : currentFields.filter((f) => f !== field.name);
                              
                              setEditMapping({
                                ...editMapping,
                                transformParams: {
                                  ...editMapping.transformParams,
                                  sourceFields: updatedFields
                                }
                              });
                            }}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                          />
                          <label htmlFor={`combine-${field.name}`} className="text-sm">{field.name}</label>
                        </div>
                      ))}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Format</label>
                      <Input
                        value={editMapping.transformParams?.format || ''}
                        onChange={(e) => setEditMapping({
                          ...editMapping,
                          transformParams: {
                            ...editMapping.transformParams,
                            format: e.target.value
                          }
                        })}
                        placeholder="e.g., YYYY-MM-DD HH:mm:ss"
                        className="border-gray-300 focus:border-blue-300 font-mono"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        For dates: YYYY (year), MM (month), DD (day), HH (hour), mm (minute), ss (second)
                      </div>
                    </div>
                  </div>
                )}
                
                {editMapping.transform === 'geopoint' && (
                  <div className="space-y-3 bg-gray-50 p-3 rounded-md border">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Latitude Field</label>
                        <Select 
                          value={editMapping.transformParams?.lat || ''}
                          onValueChange={(value) => setEditMapping({
                            ...editMapping,
                            transformParams: {
                              ...editMapping.transformParams,
                              lat: value
                            }
                          })}
                        >
                          <SelectTrigger className="w-full border-gray-300 bg-white">
                            <SelectValue placeholder="Select longitude field" />
                          </SelectTrigger>
                          <SelectContent>
                            {sampleSourceFields.map(field => (
                              <SelectItem key={field.name} value={field.name}>
                                {field.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-100 text-sm">
                      <div className="flex items-center gap-2 text-blue-800">
                        <div className="flex-shrink-0">ℹ️</div>
                        <span>Geographic point data will be created using the selected latitude and longitude fields.</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {editMapping.transform === 'object' && (
                  <div className="space-y-3 bg-gray-50 p-3 rounded-md border">
                    <label className="block text-sm font-medium text-gray-700">Object Properties</label>
                    <div className="max-h-48 overflow-y-auto grid grid-cols-2 gap-2">
                      {sampleSourceFields.map(field => (
                        <div key={field.name} className="flex items-center p-2 bg-white rounded border">
                          <input 
                            type="checkbox" 
                            id={`property-${field.name}`}
                            checked={(editMapping.transformParams?.properties || []).includes(field.name)}
                            onChange={(e) => {
                              const currentProps = editMapping.transformParams?.properties || [];
                              const updatedProps = e.target.checked
                                ? [...currentProps, field.name]
                                : currentProps.filter((p: string) => p !== field.name);
                              
                              setEditMapping({
                                ...editMapping,
                                transformParams: {
                                  ...editMapping.transformParams,
                                  properties: updatedProps
                                }
                              });
                            }}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                          />
                          <label htmlFor={`property-${field.name}`} className="text-sm">{field.name}</label>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-100 text-sm">
                      <div className="flex items-center gap-2 text-blue-800">
                        <div className="flex-shrink-0">ℹ️</div>
                        <span>Selected fields will be combined into a single object with the field names as keys.</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {editMapping.transform === 'lookup' && (
                  <div className="space-y-3 bg-gray-50 p-3 rounded-md border">
                    <label className="block text-sm font-medium text-gray-700">Value Mappings</label>
                    <div className="border rounded-md overflow-hidden bg-white">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="bg-muted/20">Source Value</TableHead>
                            <TableHead className="bg-muted/20">Target Value</TableHead>
                            <TableHead className="w-[60px] bg-muted/20"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(editMapping.transformParams?.valueMappings || []).map((mapping, index: number) => (
                            <TableRow key={index} className="hover:bg-gray-50">
                              <TableCell className="p-2">
                                <Input
                                  value={mapping.source}
                                  onChange={(e) => {
                                    const updatedMappings = [...(editMapping.transformParams?.valueMappings || [])];
                                    updatedMappings[index].source = e.target.value;
                                    
                                    setEditMapping({
                                      ...editMapping,
                                      transformParams: {
                                        ...editMapping.transformParams,
                                        valueMappings: updatedMappings
                                      }
                                    });
                                  }}
                                  className="border-gray-300 text-sm"
                                  placeholder="Source value"
                                />
                              </TableCell>
                              <TableCell className="p-2">
                                <Input
                                  value={mapping.target}
                                  onChange={(e) => {
                                    const updatedMappings = [...(editMapping.transformParams?.valueMappings || [])];
                                    updatedMappings[index].target = e.target.value;
                                    
                                    setEditMapping({
                                      ...editMapping,
                                      transformParams: {
                                        ...editMapping.transformParams,
                                        valueMappings: updatedMappings
                                      }
                                    });
                                  }}
                                  className="border-gray-300 text-sm"
                                  placeholder="Target value"
                                />
                              </TableCell>
                              <TableCell className="p-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                                  onClick={() => {
                                    const updatedMappings = [...(editMapping.transformParams?.valueMappings || [])];
                                    updatedMappings.splice(index, 1);
                                    
                                    setEditMapping({
                                      ...editMapping,
                                      transformParams: {
                                        ...editMapping.transformParams,
                                        valueMappings: updatedMappings
                                      }
                                    });
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          
                          {(!editMapping.transformParams?.valueMappings || editMapping.transformParams.valueMappings.length === 0) && (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center py-3 text-gray-500">
                                No value mappings defined
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    
                    <Button
                      variant="outline"
                      className="w-full mt-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                      onClick={() => {
                        const currentMappings = editMapping.transformParams?.valueMappings || [];
                        
                        setEditMapping({
                          ...editMapping,
                          transformParams: {
                            ...editMapping.transformParams,
                            valueMappings: [...currentMappings, { source: '', target: '' }]
                          }
                        });
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Value Mapping
                    </Button>
                    
                    <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-100 text-sm">
                      <div className="flex items-center gap-2 text-blue-800">
                        <div className="flex-shrink-0">ℹ️</div>
                        <span>Values from the source field will be translated to the corresponding target values.</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="pt-3 border-t flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Mapping Confidence</label>
                  <Select 
                    value={editMapping.confidence}
                    onValueChange={(value: 'manual' | 'high' | 'medium' | 'low') => setEditMapping({...editMapping, confidence: value})}
                  >
                    <SelectTrigger className="w-32 border-gray-300">
                      <SelectValue placeholder="Confidence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter className="border-t pt-4">
                <Button variant="outline" onClick={() => setEditMapping(null)} className="hover:bg-gray-50">
                  Cancel
                </Button>
                <Button 
                  onClick={saveEditMapping} 
                  disabled={!editMapping.sourceField || !editMapping.targetField}
                  className="bg-primary hover:bg-primary/90 shadow-sm"
                >
                  Save Mapping
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default MappingSection;   