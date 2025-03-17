// utils/gis-data-processing.ts
import { GISPoint } from '@/components/data-migration/gis-visualization';

/**
 * Extract GIS points from parsed data records
 * Properly filters invalid points and handles different column naming formats
 * 
 * @param data Parsed data records from file upload
 * @returns Array of valid GIS points
 */
export function extractGISPoints(data: any[]): GISPoint[] {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return [];
  }

  // Find likely latitude and longitude fields
  const findFieldByPattern = (
    obj: Record<string, any>,
    patterns: string[]
  ): string | null => {
    if (!obj) return null;
    
    const keys = Object.keys(obj);
    
    for (const pattern of patterns) {
      const field = keys.find(key => 
        key.toLowerCase().includes(pattern.toLowerCase())
      );
      
      if (field) return field;
    }
    
    return null;
  };

  return data
    .map(record => {
      if (!record) return null;
      
      // Try to intelligently find the fields
      const latField = findFieldByPattern(record, ['lat', 'latitude', 'y', 'y_coord']);
      const lonField = findFieldByPattern(record, ['lon', 'longitude', 'lng', 'x', 'x_coord']);
      const nameField = findFieldByPattern(record, ['name', 'title', 'address', 'location', 'id', 'incident_id']);
      const typeField = findFieldByPattern(record, ['type', 'category', 'incident_type', 'class']);
      
      // Return null if we can't find or parse latitude/longitude
      if (!latField || !lonField) return null;
      
      const lat = parseFloat(record[latField]);
      const lon = parseFloat(record[lonField]);
      
      // Validate coordinates
      if (isNaN(lat) || isNaN(lon)) return null;
      if (lat < -90 || lat > 90) return null;
      if (lon < -180 || lon > 180) return null;
      
      const id = record.id || record.incident_id || crypto.randomUUID?.() || Math.random().toString(36).substring(2, 9);
      const name = nameField ? record[nameField] || 'Location' : 'Location';
      const type = typeField ? record[typeField] || 'Unknown' : 'Unknown';
      
      return {
        id,
        lat,
        lon,
        name: String(name),
        type: String(type)
      };
    })
    .filter((point): point is GISPoint => 
      point !== null && 
      typeof point.lat === 'number' && 
      typeof point.lon === 'number'
    );
}

/**
 * Checks if data is likely to contain geographic information
 */
export function hasGISData(data: any[]): boolean {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return false;
  }
  
  // Check first record for common geographic fields
  const firstRecord = data[0];
  const keys = Object.keys(firstRecord || {}).map(k => k.toLowerCase());
  
  const geoFields = [
    'lat', 'latitude', 
    'lon', 'longitude', 'lng',
    'coordinates', 'location', 
    'geom', 'geometry',
    'x_coord', 'y_coord',
    'x', 'y'
  ];
  
  return geoFields.some(field => 
    keys.some(key => key.includes(field))
  );
}