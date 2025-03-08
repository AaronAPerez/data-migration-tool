import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { 
  Map, 
  Database, 
  Code, 
  Layers, 
  LineChart, 
  GitBranch, 
  Workflow,
  FileWarning,
  Settings2,
  AlertTriangle,
  FileCheck,
  CheckSquare,
  BarChart3,
  PanelRight
} from 'lucide-react';
import * as d3 from 'd3';

// Advanced GIS Visualization Component
//   This component helps visualize and validate geographic data during migration.
//  It supports coordinate validation, projection transformation, and clustering analysis

const GISVisualization = ({ data }) => {
  const [mapMode, setMapMode] = useState('points');
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [coordSystem, setCoordSystem] = useState('wgs84');
  const [clusterRadius, setClusterRadius] = useState(50);
  const [showBounds, setShowBounds] = useState(true);
  const [showLabels, setShowLabels] = useState(false);
  const svgRef = useRef(null);
  
  // Sample GIS data for demonstration
  const sampleData = data || [
    { id: 1, lat: 39.2904, lon: -76.6122, name: "Station 1", type: "Fire Station" },
    { id: 2, lat: 39.2809, lon: -76.5883, name: "Station 2", type: "Fire Station" },
    { id: 3, lat: 39.3142, lon: -76.6150, name: "Station 3", type: "EMS" },
    { id: 4, lat: 39.2932, lon: -76.5868, name: "Hospital A", type: "Hospital" },
    { id: 5, lat: 39.2732, lon: -76.6031, name: "Incident #1243", type: "Incident" },
    { id: 6, lat: 39.2954, lon: -76.6022, name: "Incident #2157", type: "Incident" },
    { id: 7, lat: 39.2834, lon: -76.6241, name: "Incident #1892", type: "Incident" },
    { id: 8, lat: 39.3001, lon: -76.5931, name: "Shelter Zone", type: "SpecialZone" },
    { id: 9, lat: 39.3099, lon: -76.5999, name: "Command Center", type: "Command" },
    { id: 10, lat: 39.2889, lon: -76.5777, name: "Staging Area", type: "Logistics" },
  ];
  
  // Calculate bounding box
  const minLat = Math.min(...sampleData.map(d => d.lat)) - 0.01;
  const maxLat = Math.max(...sampleData.map(d => d.lat)) + 0.01;
  const minLon = Math.min(...sampleData.map(d => d.lon)) - 0.01;
  const maxLon = Math.max(...sampleData.map(d => d.lon)) + 0.01;
  
  // Projection function (simplified)
  const project = (lat, lon) => {
    const width = 600;
    const height = 400;
    
    // Simple linear mapping from geo coordinates to pixels
    const x = ((lon - minLon) / (maxLon - minLon)) * width;
    const y = height - ((lat - minLat) / (maxLat - minLat)) * height;
    
    return [x, y];
  };
  
  // Create clusters
  const createClusters = () => {
    // Simple clustering for demo purposes
    const clusters = [];
    const assigned = new Set();
    
    sampleData.forEach((point, i) => {
      if (assigned.has(i)) return;
      
      const cluster = [i];
      assigned.add(i);
      
      // Find nearby points
      for (let j = 0; j < sampleData.length; j++) {
        if (i === j || assigned.has(j)) continue;
        
        const [x1, y1] = project(sampleData[i].lat, sampleData[i].lon);
        const [x2, y2] = project(sampleData[j].lat, sampleData[j].lon);
        
        // Calculate distance
        const dist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        
        if (dist < clusterRadius) {
          cluster.push(j);
          assigned.add(j);
        }
      }
      
      if (cluster.length > 1) {
        // Calculate center
        const clusterPoints = cluster.map(idx => sampleData[idx]);
        const centerLat = clusterPoints.reduce((sum, p) => sum + p.lat, 0) / clusterPoints.length;
        const centerLon = clusterPoints.reduce((sum, p) => sum + p.lon, 0) / clusterPoints.length;
        
        clusters.push({
          points: cluster,
          center: [centerLat, centerLon],
          size: cluster.length
        });
      }
    });
    
    return clusters;
  };
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    // Clear SVG
    d3.select(svgRef.current).selectAll("*").remove();
    
    const svg = d3.select(svgRef.current);
    const width = 600;
    const height = 400;
    
    // Add background
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#f8f9fa');
    
    // Draw grid
    const gridSize = 50;
    for (let x = 0; x < width; x += gridSize) {
      svg.append('line')
        .attr('x1', x)
        .attr('y1', 0)
        .attr('x2', x)
        .attr('y2', height)
        .attr('stroke', '#e9ecef')
        .attr('stroke-width', 1);
    }
    
    for (let y = 0; y < height; y += gridSize) {
      svg.append('line')
        .attr('x1', 0)
        .attr('y1', y)
        .attr('x2', width)
        .attr('y2', y)
        .attr('stroke', '#e9ecef')
        .attr('stroke-width', 1);
    }
    
    // Draw bounding box if enabled
    if (showBounds) {
      const [x1, y1] = project(minLat, minLon);
      const [x2, y2] = project(maxLat, maxLon);
      
      svg.append('rect')
        .attr('x', x1)
        .attr('y', y2)
        .attr('width', x2 - x1)
        .attr('height', y1 - y2)
        .attr('fill', 'none')
        .attr('stroke', '#6c757d')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '5,5');
    }
    
    if (mapMode === 'clusters') {
      // Draw clusters
      const clusters = createClusters();
      
      clusters.forEach(cluster => {
        const [centerLat, centerLon] = cluster.center;
        const [cx, cy] = project(centerLat, centerLon);
        
        // Draw cluster circle
        svg.append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', Math.max(15, Math.min(30, cluster.size * 5)))
          .attr('fill', 'rgba(108, 117, 125, 0.2)')
          .attr('stroke', '#6c757d')
          .attr('stroke-width', 1);
        
        // Draw points in cluster
        cluster.points.forEach(idx => {
          const point = sampleData[idx];
          const [px, py] = project(point.lat, point.lon);
          
          svg.append('circle')
            .attr('cx', px)
            .attr('cy', py)
            .attr('r', 4)
            .attr('fill', getColorByType(point.type))
            .attr('stroke', '#343a40')
            .attr('stroke-width', 1)
            .attr('cursor', 'pointer')
            .on('click', () => setSelectedPoint(point));
        });
        
        // Add count label
        svg.append('text')
          .attr('x', cx)
          .attr('y', cy)
          .attr('text-anchor', 'middle')
          .attr('dy', '0.3em')
          .attr('font-size', '10px')
          .attr('fill', '#343a40')
          .text(cluster.size);
      });
      
      // Draw standalone points
      sampleData.forEach((point, i) => {
        if (clusters.some(c => c.points.includes(i))) return;
        
        const [px, py] = project(point.lat, point.lon);
        
        svg.append('circle')
          .attr('cx', px)
          .attr('cy', py)
          .attr('r', 5)
          .attr('fill', getColorByType(point.type))
          .attr('stroke', '#343a40')
          .attr('stroke-width', 1)
          .attr('cursor', 'pointer')
          .on('click', () => setSelectedPoint(point));
      });
    } else {
      // Draw individual points
      sampleData.forEach(point => {
        const [x, y] = project(point.lat, point.lon);
        
        svg.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', 6)
          .attr('fill', getColorByType(point.type))
          .attr('stroke', '#343a40')
          .attr('stroke-width', 1)
          .attr('cursor', 'pointer')
          .on('click', () => setSelectedPoint(point));
        
        if (showLabels) {
          svg.append('text')
            .attr('x', x)
            .attr('y', y - 10)
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .attr('fill', '#343a40')
            .text(point.name);
        }
      });
    }
    
    // Draw connections if heatmap mode
    if (mapMode === 'heatmap') {
      // Draw connections between close points
      for (let i = 0; i < sampleData.length; i++) {
        for (let j = i + 1; j < sampleData.length; j++) {
          const [x1, y1] = project(sampleData[i].lat, sampleData[i].lon);
          const [x2, y2] = project(sampleData[j].lat, sampleData[j].lon);
          
          // Calculate distance
          const dist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
          
          if (dist < 100) {
            // Draw connection line with opacity based on distance
            const opacity = 1 - (dist / 100);
            
            svg.append('line')
              .attr('x1', x1)
              .attr('y1', y1)
              .attr('x2', x2)
              .attr('y2', y2)
              .attr('stroke', '#6c757d')
              .attr('stroke-width', 1)
              .attr('stroke-opacity', opacity);
          }
        }
      }
    }
    
  }, [sampleData, mapMode, clusterRadius, showBounds, showLabels]);
  
  // Get color by point type
  const getColorByType = (type) => {
    switch (type) {
      case 'Fire Station': return '#dc3545';
      case 'EMS': return '#28a745';
      case 'Hospital': return '#17a2b8';
      case 'Incident': return '#ffc107';
      case 'SpecialZone': return '#6f42c1';
      case 'Command': return '#0d6efd';
      case 'Logistics': return '#fd7e14';
      default: return '#6c757d';
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-x-2">
          <Button 
            variant={mapMode === 'points' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setMapMode('points')}
          >
            Points
          </Button>
          <Button 
            variant={mapMode === 'clusters' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setMapMode('clusters')}
          >
            Clusters
          </Button>
          <Button 
            variant={mapMode === 'heatmap' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setMapMode('heatmap')}
          >
            Connections
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch 
              checked={showLabels} 
              onCheckedChange={setShowLabels} 
              id="show-labels"
            />
            <label htmlFor="show-labels" className="text-sm">Labels</label>
          </div>
          <div className="flex items-center gap-2">
            <Switch 
              checked={showBounds} 
              onCheckedChange={setShowBounds} 
              id="show-bounds"
            />
            <label htmlFor="show-bounds" className="text-sm">Bounds</label>
          </div>
        </div>
      </div>
      
      {mapMode === 'clusters' && (
        <div className="flex items-center gap-4">
          <span className="text-sm">Cluster Radius:</span>
          <Slider
            value={[clusterRadius]}
            onValueChange={(value) => setClusterRadius(value[0])}
            min={10}
            max={150}
            step={5}
            className="w-64"
          />
          <span className="text-sm">{clusterRadius}px</span>
        </div>
      )}
      
      <div className="border rounded-lg overflow-hidden bg-white">
        <svg ref={svgRef} width="600" height="400"></svg>
      </div>
      
      {selectedPoint && (
        <div className="p-4 border rounded-lg bg-muted">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{selectedPoint.name}</h3>
              <div className="text-sm text-muted-foreground">
                Type: <Badge>{selectedPoint.type}</Badge>
              </div>
              <div className="text-sm mt-2">
                <div>Latitude: {selectedPoint.lat}</div>
                <div>Longitude: {selectedPoint.lon}</div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSelectedPoint(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
      
      <div className="flex justify-between text-sm text-muted-foreground pt-2">
        <div>
          Coordinate System: <Badge variant="outline">{coordSystem}</Badge>
        </div>
        <div>
          Points: {sampleData.length}
        </div>
      </div>
    </div>
  );
};


export default GISVisualization;