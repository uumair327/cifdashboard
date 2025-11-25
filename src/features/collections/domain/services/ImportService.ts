/**
 * Import Service
 * Handles CSV and JSON file imports with validation
 */

import { BaseCollection } from '../entities/Collection';

export interface ImportResult<T> {
  data: Partial<T>[];
  errors: ImportError[];
  warnings: ImportWarning[];
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
}

export interface ImportWarning {
  row: number;
  field?: string;
  message: string;
}

export class ImportService {
  /**
   * Parse CSV file content
   */
  static parseCSV(content: string): Record<string, any>[] {
    const lines = content.trim().split('\n');
    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    // Parse rows
    const data: Record<string, any>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = this.parseCSVLine(line);
      const row: Record<string, any> = {};
      
      headers.forEach((header, index) => {
        if (values[index] !== undefined) {
          row[header] = values[index];
        }
      });
      
      data.push(row);
    }

    return data;
  }

  /**
   * Parse a single CSV line handling quoted values
   */
  private static parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current.trim());
    return values;
  }

  /**
   * Parse JSON file content
   */
  static parseJSON(content: string): Record<string, any>[] {
    try {
      const parsed = JSON.parse(content);
      
      if (Array.isArray(parsed)) {
        return parsed;
      } else if (typeof parsed === 'object' && parsed !== null) {
        // If it's a single object, wrap it in an array
        return [parsed];
      } else {
        throw new Error('JSON must be an array or object');
      }
    } catch (error) {
      throw new Error(`Invalid JSON: ${(error as Error).message}`);
    }
  }

  /**
   * Validate imported data
   */
  static validate<T extends BaseCollection>(
    data: Record<string, any>[],
    requiredFields: string[],
    optionalFields: string[] = []
  ): ImportResult<T> {
    const validData: Partial<T>[] = [];
    const errors: ImportError[] = [];
    const warnings: ImportWarning[] = [];

    data.forEach((row, index) => {
      const rowNumber = index + 1;
      let hasErrors = false;

      // Check required fields
      requiredFields.forEach(field => {
        if (!row[field] || row[field] === '') {
          errors.push({
            row: rowNumber,
            field,
            message: `Required field "${field}" is missing or empty`,
          });
          hasErrors = true;
        }
      });

      // Check for unknown fields
      const allKnownFields = [...requiredFields, ...optionalFields];
      Object.keys(row).forEach(field => {
        if (!allKnownFields.includes(field) && field !== 'id') {
          warnings.push({
            row: rowNumber,
            field,
            message: `Unknown field "${field}" will be ignored`,
          });
        }
      });

      // Add to valid data if no errors
      if (!hasErrors) {
        validData.push(row as Partial<T>);
      }
    });

    return { data: validData, errors, warnings };
  }

  /**
   * Read file content
   */
  static readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }

  /**
   * Process import file
   */
  static async processImport<T extends BaseCollection>(
    file: File,
    requiredFields: string[],
    optionalFields: string[] = []
  ): Promise<ImportResult<T>> {
    const content = await this.readFile(file);
    const fileType = file.name.toLowerCase().endsWith('.json') ? 'json' : 'csv';

    let parsedData: Record<string, any>[];
    
    try {
      if (fileType === 'json') {
        parsedData = this.parseJSON(content);
      } else {
        parsedData = this.parseCSV(content);
      }
    } catch (error) {
      return {
        data: [],
        errors: [{ row: 0, message: (error as Error).message }],
        warnings: [],
      };
    }

    return this.validate<T>(parsedData, requiredFields, optionalFields);
  }
}
