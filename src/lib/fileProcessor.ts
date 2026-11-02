/**
 * ClientReport AI - File Processing & CSV/Excel Parser Engine
 * Processes datasets strictly locally in-browser for complete client data privacy.
 */

import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Dataset, ColumnMeta } from '../types';
import { refreshColumnMeta, calculateQualityScore } from './dataCleaning';

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
export const MAX_ALLOWED_ROWS = 100_000;

export interface ParseResult {
  dataset: Dataset;
  warnings: string[];
}

/**
 * Sanitize cell values against CSV injection attacks (=, +, -, @)
 */
export function sanitizeForCsvExport(val: any): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  // If value begins with dangerous formula triggers in spreadsheet programs
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

/**
 * Generate secure CSV string with formula injection protection
 */
export function exportToSafeCsv(rows: Record<string, any>[], columns: ColumnMeta[]): string {
  const colNames = columns.map((c) => c.name);
  const sanitizedRows = rows.map((row) => {
    const safeRow: Record<string, any> = {};
    for (const name of colNames) {
      safeRow[name] = sanitizeForCsvExport(row[name]);
    }
    return safeRow;
  });

  return Papa.unparse(sanitizedRows, {
    quotes: true,
    header: true,
  });
}

/**
 * Parse CSV file using PapaParse with streaming support
 */
export function parseCsvFile(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      reject(new Error(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds limit of 50MB.`));
      return;
    }

    const warnings: string[] = [];

    Papa.parse<Record<string, any>>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          const firstErr = results.errors[0];
          if (firstErr.type === 'Delimiter') {
            warnings.push('Delimiters were automatically inferred; please verify columns.');
          }
        }

        const rawRows = results.data;
        if (!rawRows || rawRows.length === 0) {
          reject(new Error('The uploaded CSV file is empty or contains no parseable data rows.'));
          return;
        }

        if (rawRows.length > MAX_ALLOWED_ROWS) {
          warnings.push(`Dataset contains ${rawRows.length} rows; truncated to ${MAX_ALLOWED_ROWS} rows for optimal browser responsiveness.`);
        }

        const rows = rawRows.slice(0, MAX_ALLOWED_ROWS);
        const columns = refreshColumnMeta(rows);
        const qualityScore = calculateQualityScore(rows, columns);

        const dataset: Dataset = {
          id: `dataset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          fileName: file.name,
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
          rowCount: rows.length,
          columnCount: columns.length,
          columns,
          rows,
          qualityScore,
        };

        resolve({ dataset, warnings });
      },
      error: (err) => {
        reject(new Error(`CSV parsing error: ${err.message}`));
      },
    });
  });
}

/**
 * Parse Excel file (.xlsx / .xls) using SheetJS
 */
export async function parseExcelFile(file: File): Promise<ParseResult> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds limit of 50MB.`);
  }

  const warnings: string[] = [];
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('Excel workbook contains no valid sheets.');
  }

  const sheetName = workbook.SheetNames[0];
  if (workbook.SheetNames.length > 1) {
    warnings.push(`Workbook contains multiple sheets (${workbook.SheetNames.join(', ')}). Imported primary sheet: "${sheetName}".`);
  }

  const worksheet = workbook.Sheets[sheetName];
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, {
    defval: null,
    blankrows: false,
  });

  if (!rawRows || rawRows.length === 0) {
    throw new Error(`The sheet "${sheetName}" is empty or has no header row.`);
  }

  if (rawRows.length > MAX_ALLOWED_ROWS) {
    warnings.push(`Dataset contains ${rawRows.length} rows; truncated to ${MAX_ALLOWED_ROWS} rows.`);
  }

  const rows = rawRows.slice(0, MAX_ALLOWED_ROWS);
  const columns = refreshColumnMeta(rows);
  const qualityScore = calculateQualityScore(rows, columns);

  const dataset: Dataset = {
    id: `dataset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: file.name.replace(/\.[^/.]+$/, ''),
    fileName: file.name,
    fileSize: file.size,
    uploadedAt: new Date().toISOString(),
    rowCount: rows.length,
    columnCount: columns.length,
    columns,
    rows,
    qualityScore,
  };

  return { dataset, warnings };
}

/**
 * Auto-detect and parse any supported format
 */
export async function processUploadedFile(file: File): Promise<ParseResult> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'csv' || file.type === 'text/csv') {
    return parseCsvFile(file);
  } else if (
    extension === 'xlsx' ||
    extension === 'xls' ||
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.type === 'application/vnd.ms-excel'
  ) {
    return parseExcelFile(file);
  }

  throw new Error(`Unsupported file type: .${extension || 'unknown'}. Please upload a .csv or .xlsx spreadsheet.`);
}
