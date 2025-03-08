import { Badge, ArrowRightLeft, Table, Settings, AlertTriangle } from 'lucide-react';
import React, { useState } from 'react'
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/table';

//  Field Mapping Component
//  Interactive interface for mapping source fields to target fields
//  with transformation options

const FieldMapping = ({ sourceFields, targetFields }) => {
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
  
  const [mappings, setMappings] = useState([
    { id: 1, sourceField: 'incident_id', targetField: 'incidentId', transform: 'none', confidence: 'high' },
    { id: 2, sourceField: 'incident_date', targetField: 'incidentDateTime', transform: 'combine', transformParams: { sourceFields: ['incident_date', 'incident_time'], format: 'YYYY-MM-DD HH:mm:ss' }, confidence: 'medium' },
    { id: 3, sourceField: 'address', targetField: 'location', transform: 'object', transformParams: { properties: ['address', 'city', 'state', 'zip'] }, confidence: 'high' },
    { id: 4, sourceField: 'latitude', targetField: 'coordinates', transform: 'geopoint', transformParams: { lat: 'latitude', lng: 'longitude' }, confidence: 'high' },
    { id: 5, sourceField: 'incident_type', targetField: 'type', transform: 'none', confidence: 'high' },
    { id: 6, sourceField: 'unit_id', targetField: 'respondingUnit', transform: 'none', confidence: 'high' },
    { id: 7, sourceField: 'status', targetField: 'currentStatus', transform: 'none', confidence: 'medium' }
  ]);
  
  const [editMapping, setEditMapping] = useState(null);
  
  // Calculate mapping completeness
  const requiredTargetFields = sampleTargetFields.filter(f => f.required).length;
  const mappedRequiredFields = sampleTargetFields
    .filter(f => f.required)
    .filter(f => mappings.some(m => m.targetField === f.name))
    .length;
  
  const completeness = Math.round((mappedRequiredFields / requiredTargetFields) * 100);
  
  // Update mapping
  const updateMapping = (id, field, value) => {
    setMappings(mappings.map(mapping => 
      mapping.id === id ? { ...mapping, [field]: value } : mapping
    ));
  };
  
  // Add new mapping
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
  
  // Remove mapping
  const removeMapping = (id) => {
    setMappings(mappings.filter(m => m.id !== id));
  };
  
  const openEditDialog = (mapping) => {
    setEditMapping({ ...mapping });
  };
  
  const saveEditMapping = () => {
    if (!editMapping) return;
    
    setMappings(mappings.map(mapping => 
      mapping.id === editMapping.id ? editMapping : mapping
    ));
    
    setEditMapping(null);
  };
  
  // Get confidence badge color
  const getConfidenceBadge = (confidence) => {
    switch (confidence) {
      case 'high':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">High</Badge>;
      case 'medium':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Medium</Badge>;
      case 'low':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Low</Badge>;
      case 'manual':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Manual</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  // Get transform description
  const getTransformDescription = (mapping) => {
    switch (mapping.transform) {
      case 'none':
        return 'Direct copy';
      case 'combine':
        return `Combine ${mapping.transformParams?.sourceFields?.join(' + ')}`;
      case 'object':
        return `Create object from ${mapping.transformParams?.properties?.join(', ')}`;
      case 'geopoint':
        return `Create geopoint from ${mapping.transformParams?.lat} + ${mapping.transformParams?.lng}`;
      case 'split':
        return `Split by ${mapping.transformParams?.delimiter}`;
      case 'format':
        return `Format: ${mapping.transformParams?.format}`;
      case 'lookup':
        return 'Value lookup/translation';
      default:
        return mapping.transform;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5" />
            Field Mapping
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="text-sm">
              Completeness: <span className="font-medium">{completeness}%</span>
            </div>
            <div className="w-20 h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${
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
          Map fields from your source data to First Due's data structure
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={addMapping}>
              Add Mapping
            </Button>
          </div>
          
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Source Field</TableHead>
                  <TableHead className="w-[250px]">Target Field</TableHead>
                  <TableHead>Transformation</TableHead>
                  <TableHead className="w-[100px]">Confidence</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mappings.map(mapping => (
                  <TableRow key={mapping.id}>
                    <TableCell>
                      <div className="font-medium">{mapping.sourceField}</div>
                      {sampleSourceFields.find(f => f.name === mapping.sourceField)?.sample && (
                        <div className="text-xs text-gray-500 truncate">
                          Sample: {sampleSourceFields.find(f => f.name === mapping.sourceField)?.sample}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{mapping.targetField}</div>
                      {sampleTargetFields.find(f => f.name === mapping.targetField)?.required && (
                        <div className="mt-1">
                          <Badge variant="outline" className="text-xs">Required</Badge>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>{getTransformDescription(mapping)}</div>
                    </TableCell>
                    <TableCell>
                      {getConfidenceBadge(mapping.confidence)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => openEditDialog(mapping)}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeMapping(mapping.id)}
                        >
                          ✕
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                
                {mappings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                      No field mappings defined. Click "Add Mapping" to create one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <Accordion type="single" collapsible>
              <AccordionItem value="unmapped">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span>Unmapped Required Target Fields</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 mt-2">
                    {sampleTargetFields
                      .filter(f => f.required)
                      .filter(f => !mappings.some(m => m.targetField === f.name))
                      .map(field => (
                        <div key={field.name} className="flex justify-between p-2 bg-white rounded border">
                          <div>
                            <div className="font-medium">{field.name}</div>
                            <div className="text-sm text-gray-500">{field.description}</div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              const newId = Math.max(0, ...mappings.map(m => m.id)) + 1;
                              setMappings([...mappings, { 
                                id: newId, 
                                sourceField: '', 
                                targetField: field.name, 
                                transform: 'none', 
                                confidence: 'manual' 
                              }]);
                            }}
                          >
                            Map Field
                          </Button>
                        </div>
                      ))}
                    
                    {sampleTargetFields
                      .filter(f => f.required)
                      .filter(f => !mappings.some(m => m.targetField === f.name))
                      .length === 0 && (
                        <div className="text-green-600 font-medium">
                          All required target fields have been mapped!
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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Field Mapping</DialogTitle>
                <DialogDescription>
                  Configure how the source field maps to the target field
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Source Field</label>
                    <Select 
                      value={editMapping.sourceField}
                      onValueChange={(value) => setEditMapping({...editMapping, sourceField: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select source field" />
                      </SelectTrigger>
                      <SelectContent>
                        {sampleSourceFields.map(field => (
                          <SelectItem key={field.name} value={field.name}>
                            {field.name} ({field.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Target Field</label>
                    <Select 
                      value={editMapping.targetField}
                      onValueChange={(value) => setEditMapping({...editMapping, targetField: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select target field" />
                      </SelectTrigger>
                      <SelectContent>
                        {sampleTargetFields.map(field => (
                          <SelectItem key={field.name} value={field.name}>
                            {field.name} {field.required ? '(Required)' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Transformation</label>
                  <Select 
                    value={editMapping.transform}
                    onValueChange={(value) => setEditMapping({...editMapping, transform: value})}
                  >
                    <SelectTrigger>
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
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Fields to Combine</label>
                    <div className="p-2 border rounded bg-gray-50">
                      {sampleSourceFields.map(field => (
                        <div key={field.name} className="flex items-center my-1">
                          <input 
                            type="checkbox" 
                            id={`combine-${field.name}`}
                            checked={(editMapping.transformParams?.sourceFields || []).includes(field.name)}
                            onChange={(e) => {
                              const currentFields = editMapping.transformParams?.sourceFields || [];
                              const updatedFields = e.target.checked
                                ? [...currentFields, field.name]
                                : currentFields.filter(f => f !== field.name);
                              
                              setEditMapping({
                                ...editMapping,
                                transformParams: {
                                  ...editMapping.transformParams,
                                  sourceFields: updatedFields
                                }
                              });
                            }}
                            className="mr-2"
                          />
                          <label htmlFor={`combine-${field.name}`}>{field.name}</label>
                        </div>
                      ))}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Format</label>
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
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        For dates: YYYY (year), MM (month), DD (day), HH (hour), mm (minute), ss (second)
                      </div>
                    </div>
                  </div>
                )}
                
                {editMapping.transform === 'geopoint' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Latitude Field</label>
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
                        <SelectTrigger>
                          <SelectValue placeholder="Select latitude field" />
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
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Longitude Field</label>
                      <Select 
                        value={editMapping.transformParams?.lng || ''}
                        onValueChange={(value) => setEditMapping({
                          ...editMapping,
                          transformParams: {
                            ...editMapping.transformParams,
                            lng: value
                          }
                        })}
                      >
                        <SelectTrigger>
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
                )}
                
                {editMapping.transform === 'object' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Object Properties</label>
                    <div className="p-2 border rounded bg-gray-50">
                      {sampleSourceFields.map(field => (
                        <div key={field.name} className="flex items-center my-1">
                          <input 
                            type="checkbox" 
                            id={`property-${field.name}`}
                            checked={(editMapping.transformParams?.properties || []).includes(field.name)}
                            onChange={(e) => {
                              const currentProps = editMapping.transformParams?.properties || [];
                              const updatedProps = e.target.checked
                                ? [...currentProps, field.name]
                                : currentProps.filter(p => p !== field.name);
                              
                              setEditMapping({
                                ...editMapping,
                                transformParams: {
                                  ...editMapping.transformParams,
                                  properties: updatedProps
                                }
                              });
                            }}
                            className="mr-2"
                          />
                          <label htmlFor={`property-${field.name}`}>{field.name}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {editMapping.transform === 'lookup' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Value Mappings</label>
                    <div className="border rounded overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Source Value</TableHead>
                            <TableHead>Target Value</TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(editMapping.transformParams?.valueMappings || []).map((mapping, index) => (
                            <TableRow key={index}>
                              <TableCell>
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
                                />
                              </TableCell>
                              <TableCell>
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
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
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
                                  ✕
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    <Button
                      variant="outline"
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
                      Add Value Mapping
                    </Button>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditMapping(null)}>
                  Cancel
                </Button>
                <Button onClick={saveEditMapping}>
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


export default MappingSection