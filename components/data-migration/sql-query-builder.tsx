import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button';
import { Input } from '../ui/input';



//  SQL Query Builder Component
//  Allows interactive creation of SQL queries for data extraction and transformation.
//  Demonstrates advanced SQL knowledge and ability to create complex queries.
 
const SQLQueryBuilder = ({ tables }) => {
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [joinTable, setJoinTable] = useState('');
  const [joinColumn, setJoinColumn] = useState('');
  const [joinTargetColumn, setJoinTargetColumn] = useState('');
  const [orderByColumn, setOrderByColumn] = useState('');
  const [orderDirection, setOrderDirection] = useState('ASC');
  const [limit, setLimit] = useState(100);
  const [generatedSQL, setGeneratedSQL] = useState('');
  
  // Sample tables data structure for demo
  const sampleTables = tables || {
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
  
  // Function to generate the SQL query based on selections
  const generateQuery = () => {
    if (!selectedTable || selectedColumns.length === 0) {
      setGeneratedSQL('');
      return;
    }
    
    let query = 'SELECT ';
    
    // Add columns
    if (selectedColumns.includes('*')) {
      if (joinTable) {
        query += `${selectedTable}.*, ${joinTable}.*`;
      } else {
        query += '*';
      }
    } else {
      query += selectedColumns.map(col => {
        // If joining, prefix with table name
        if (joinTable && sampleTables[joinTable].columns.includes(col)) {
          return `${joinTable}.${col}`;
        } else {
          return `${selectedTable}.${col}`;
        }
      }).join(', ');
    }
    
    // Add FROM clause
    query += `\nFROM ${selectedTable}`;
    
    // Add JOIN if selected
    if (joinTable && joinColumn && joinTargetColumn) {
      query += `\nJOIN ${joinTable} ON ${selectedTable}.${joinColumn} = ${joinTable}.${joinTargetColumn}`;
    }
    
    // Add WHERE conditions
    if (conditions.length > 0) {
      query += '\nWHERE ';
      query += conditions.map(cond => `${cond.column} ${cond.operator} ${cond.value}`).join('\nAND ');
    }
    
    // Add ORDER BY
    if (orderByColumn) {
      query += `\nORDER BY ${orderByColumn} ${orderDirection}`;
    }
    
    // Add LIMIT
    if (limit > 0) {
      query += `\nLIMIT ${limit}`;
    }
    
    query += ';';
    setGeneratedSQL(query);
  };
  
  // Add a condition
  const addCondition = () => {
    setConditions([
      ...conditions, 
      { 
        column: sampleTables[selectedTable]?.columns[0] || '',
        operator: '=',
        value: ''
      }
    ]);
  };
  
  // Update a condition
  const updateCondition = (index, field, value) => {
    const newConditions = [...conditions];
    newConditions[index] = {
      ...newConditions[index],
      [field]: value
    };
    setConditions(newConditions);
  };
  
  // Remove a condition
  const removeCondition = (index) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };
  
  // Effect to generate query whenever selections change
  useEffect(() => {
    generateQuery();
  }, [selectedTable, selectedColumns, conditions, joinTable, 
      joinColumn, joinTargetColumn, orderByColumn, orderDirection, limit]);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Select Table
            </label>
            <select 
              className="w-full p-2 border rounded-md"
              value={selectedTable}
              onChange={(e) => {
                setSelectedTable(e.target.value);
                setSelectedColumns([]);
                setConditions([]);
              }}
            >
              <option value="">-- Select Table --</option>
              {Object.keys(sampleTables).map(table => (
                <option key={table} value={table}>{table}</option>
              ))}
            </select>
          </div>
          
          {selectedTable && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Select Columns
              </label>
              <div className="space-y-1 max-h-[200px] overflow-y-auto p-2 border rounded-md">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="col-all" 
                    checked={selectedColumns.includes('*')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedColumns(['*']);
                      } else {
                        setSelectedColumns([]);
                      }
                    }}
                    className="mr-2"
                  />
                  <label htmlFor="col-all">* (All Columns)</label>
                </div>
                
                {sampleTables[selectedTable]?.columns.map(column => (
                  <div key={column} className="flex items-center">
                    <input 
                      type="checkbox" 
                      id={`col-${column}`} 
                      checked={selectedColumns.includes(column) || selectedColumns.includes('*')}
                      disabled={selectedColumns.includes('*')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedColumns([...selectedColumns, column]);
                        } else {
                          setSelectedColumns(selectedColumns.filter(col => col !== column));
                        }
                      }}
                      className="mr-2"
                    />
                    <label htmlFor={`col-${column}`}>{column}</label>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {selectedTable && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium">
                  WHERE Conditions
                </label>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={addCondition}
                >
                  Add Condition
                </Button>
              </div>
              
              {conditions.length === 0 ? (
                <div className="text-sm text-muted-foreground p-2 border rounded-md">
                  No conditions added. All rows will be selected.
                </div>
              ) : (
                <div className="space-y-2">
                  {conditions.map((condition, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                      <select 
                        value={condition.column}
                        onChange={(e) => updateCondition(index, 'column', e.target.value)}
                        className="p-1 border rounded"
                      >
                        {sampleTables[selectedTable]?.columns.map(column => (
                          <option key={column} value={column}>{column}</option>
                        ))}
                      </select>
                      
                      <select 
                        value={condition.operator}
                        onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                        className="p-1 border rounded"
                      >
                        <option value="=">=</option>
                        <option value="<>">≠</option>
                        <option value=">">></option>
                        <option value="<"><</option>
                        <option value=">=">≥</option>
                        <option value="<=">≤</option>
                        <option value="LIKE">LIKE</option>
                        <option value="IN">IN</option>
                        <option value="IS NULL">IS NULL</option>
                        <option value="IS NOT NULL">IS NOT NULL</option>
                      </select>
                      
                      {!['IS NULL', 'IS NOT NULL'].includes(condition.operator) && (
                        <Input
                          value={condition.value}
                          onChange={(e) => updateCondition(index, 'value', e.target.value)}
                          placeholder="Value"
                          className="flex-1"
                        />
                      )}
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeCondition(index)}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          {selectedTable && (
            <div>
              <label className="block text-sm font-medium mb-1">
                JOIN Settings
              </label>
              <div className="p-3 border rounded-md space-y-3">
                <select 
                  className="w-full p-2 border rounded-md"
                  value={joinTable}
                  onChange={(e) => {
                    setJoinTable(e.target.value);
                    setJoinColumn('');
                    setJoinTargetColumn('');
                  }}
                >
                  <option value="">-- No Join --</option>
                  {Object.keys(sampleTables)
                    .filter(table => table !== selectedTable)
                    .map(table => (
                      <option key={table} value={table}>{table}</option>
                    ))
                  }
                </select>
                
                {joinTable && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs mb-1">
                        {selectedTable} Column
                      </label>
                      <select 
                        className="w-full p-1 border rounded-md text-sm"
                        value={joinColumn}
                        onChange={(e) => setJoinColumn(e.target.value)}
                      >
                        <option value="">-- Select Column --</option>
                        {sampleTables[selectedTable]?.columns.map(column => (
                          <option key={column} value={column}>{column}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs mb-1">
                        {joinTable} Column
                      </label>
                      <select 
                        className="w-full p-1 border rounded-md text-sm"
                        value={joinTargetColumn}
                        onChange={(e) => setJoinTargetColumn(e.target.value)}
                      >
                        <option value="">-- Select Column --</option>
                        {sampleTables[joinTable]?.columns.map(column => (
                          <option key={column} value={column}>{column}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {selectedTable && (
            <div>
              <label className="block text-sm font-medium mb-1">
                ORDER BY & LIMIT
              </label>
              <div className="p-3 border rounded-md space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <select 
                    className="p-2 border rounded-md"
                    value={orderByColumn}
                    onChange={(e) => setOrderByColumn(e.target.value)}
                  >
                    <option value="">-- No Sorting --</option>
                    {sampleTables[selectedTable]?.columns.map(column => (
                      <option key={column} value={column}>{column}</option>
                    ))}
                  </select>
                  
                  <select 
                    className="p-2 border rounded-md"
                    value={orderDirection}
                    onChange={(e) => setOrderDirection(e.target.value)}
                    disabled={!orderByColumn}
                  >
                    <option value="ASC">Ascending</option>
                    <option value="DESC">Descending</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm">Limit results:</label>
                  <Input
                    type="number"
                    min="0"
                    max="1000"
                    value={limit}
                    onChange={(e) => setLimit(parseInt(e.target.value) || 0)}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">
                    (0 = no limit)
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Generated SQL Query
            </label>
            <pre className="p-3 bg-muted rounded-md overflow-x-auto text-sm whitespace-pre">
              {generatedSQL || 'Select a table and columns to generate a query.'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SQLQueryBuilder;