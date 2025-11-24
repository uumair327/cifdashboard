/**
 * ExportService
 * Handles exporting collection data to various formats
 */
import { BaseCollection } from '../entities/Collection';

export type ExportFormat = 'csv' | 'json';

export class ExportService {
  /**
   * Export data to CSV format
   */
  static exportToCSV<T extends BaseCollection>(
    data: T[],
    fields?: string[]
  ): string {
    if (data.length === 0) {
      return '';
    }

    // Determine fields to export
    const exportFields = fields || Object.keys(data[0]);

    // Create CSV header
    const header = exportFields.join(',');

    // Create CSV rows
    const rows = data.map(item => {
      return exportFields
        .map(field => {
          const value = (item as any)[field];
          
          // Handle different value types
          if (value === null || value === undefined) {
            return '';
          }
          
          if (value instanceof Date) {
            return `"${value.toISOString()}"`;
          }
          
          if (typeof value === 'object') {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          
          // Escape quotes and wrap in quotes if contains comma or quote
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          
          return stringValue;
        })
        .join(',');
    });

    return [header, ...rows].join('\n');
  }

  /**
   * Export data to JSON format
   */
  static exportToJSON<T extends BaseCollection>(
    data: T[],
    fields?: string[]
  ): string {
    if (fields) {
      // Filter to only include specified fields
      const filteredData = data.map(item => {
        const filtered: any = {};
        fields.forEach(field => {
          if (field in item) {
            filtered[field] = (item as any)[field];
          }
        });
        return filtered;
      });
      return JSON.stringify(filteredData, null, 2);
    }
    
    return JSON.stringify(data, null, 2);
  }

  /**
   * Trigger download of exported data
   */
  static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Export and download data in specified format
   */
  static export<T extends BaseCollection>(
    data: T[],
    format: ExportFormat,
    filename: string,
    fields?: string[]
  ): void {
    let content: string;
    let mimeType: string;
    let extension: string;

    switch (format) {
      case 'csv':
        content = this.exportToCSV(data, fields);
        mimeType = 'text/csv;charset=utf-8;';
        extension = 'csv';
        break;
      case 'json':
        content = this.exportToJSON(data, fields);
        mimeType = 'application/json;charset=utf-8;';
        extension = 'json';
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }

    // Add extension if not present
    const finalFilename = filename.endsWith(`.${extension}`)
      ? filename
      : `${filename}.${extension}`;

    this.downloadFile(content, finalFilename, mimeType);
  }
}
