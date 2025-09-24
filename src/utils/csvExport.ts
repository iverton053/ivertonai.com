// Secure CSV/Excel export utility without vulnerable xlsx dependency

import * as Papa from 'papaparse';

export interface ExportData {
  [key: string]: any;
}

export interface ExportOptions {
  filename?: string;
  sheetName?: string;
  includeHeaders?: boolean;
  dateFormat?: 'iso' | 'localestring' | 'timestamp';
}

/**
 * Secure CSV export function using Papa Parse
 * Replaces the vulnerable xlsx dependency for basic spreadsheet functionality
 */
export const exportToCSV = (
  data: ExportData[],
  options: ExportOptions = {}
): void => {
  const {
    filename = 'export',
    includeHeaders = true,
    dateFormat = 'localestring'
  } = options;

  if (!data || data.length === 0) {
    console.warn('No data provided for CSV export');
    return;
  }

  // Process data to ensure consistent formatting
  const processedData = data.map(row => {
    const processedRow: { [key: string]: any } = {};
    
    Object.entries(row).forEach(([key, value]) => {
      if (value instanceof Date) {
        switch (dateFormat) {
          case 'iso':
            processedRow[key] = value.toISOString();
            break;
          case 'timestamp':
            processedRow[key] = value.getTime();
            break;
          case 'localestring':
          default:
            processedRow[key] = value.toLocaleString();
            break;
        }
      } else if (value === null || value === undefined) {
        processedRow[key] = '';
      } else if (typeof value === 'object') {
        processedRow[key] = JSON.stringify(value);
      } else {
        processedRow[key] = String(value);
      }
    });
    
    return processedRow;
  });

  // Convert to CSV
  const csv = Papa.unparse(processedData, {
    header: includeHeaders,
    skipEmptyLines: true,
    quotes: true // Always quote fields to prevent injection attacks
  });

  // Create and download file
  downloadCSV(csv, `${filename}.csv`);
};

/**
 * Export data as JSON (secure alternative to Excel for complex data)
 */
export const exportToJSON = (
  data: ExportData[],
  options: ExportOptions = {}
): void => {
  const { filename = 'export' } = options;

  if (!data || data.length === 0) {
    console.warn('No data provided for JSON export');
    return;
  }

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  
  downloadBlob(blob, `${filename}.json`);
};

/**
 * Import CSV data (secure alternative to xlsx parsing)
 */
export const importFromCSV = (file: File): Promise<ExportData[]> => {
  return new Promise((resolve, reject) => {
    if (!file || file.type !== 'text/csv') {
      reject(new Error('Invalid file type. Please provide a CSV file.'));
      return;
    }

    // Limit file size to prevent DoS attacks (10MB max)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      reject(new Error('File too large. Maximum size is 10MB.'));
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => {
        // Sanitize headers to prevent injection
        return header.trim().replace(/[<>\"'&]/g, '');
      },
      transform: (value: string) => {
        // Basic XSS prevention for cell values
        return value.replace(/[<>\"'&]/g, '');
      },
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`));
          return;
        }
        resolve(results.data as ExportData[]);
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      }
    });
  });
};

/**
 * Create a table-like structure for display (HTML table alternative)
 */
export const createTableStructure = (
  data: ExportData[],
  maxRows: number = 1000
): {
  headers: string[];
  rows: string[][];
  totalRows: number;
} => {
  if (!data || data.length === 0) {
    return { headers: [], rows: [], totalRows: 0 };
  }

  // Limit data to prevent UI freezing
  const limitedData = data.slice(0, maxRows);
  
  // Get all unique headers
  const headerSet = new Set<string>();
  limitedData.forEach(row => {
    Object.keys(row).forEach(key => headerSet.add(key));
  });
  const headers = Array.from(headerSet);

  // Convert to rows
  const rows = limitedData.map(item => {
    return headers.map(header => {
      const value = item[header];
      if (value === null || value === undefined) {
        return '';
      }
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      return String(value);
    });
  });

  return {
    headers,
    rows,
    totalRows: data.length
  };
};

/**
 * Utility function to download CSV content
 */
const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
};

/**
 * Utility function to download any blob
 */
const downloadBlob = (blob: Blob, filename: string): void => {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

/**
 * Convert data to different formats based on user preference
 */
export const exportData = (
  data: ExportData[],
  format: 'csv' | 'json',
  options: ExportOptions = {}
): void => {
  switch (format) {
    case 'csv':
      exportToCSV(data, options);
      break;
    case 'json':
      exportToJSON(data, options);
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};

// Export type for external use
export type { ExportData, ExportOptions };