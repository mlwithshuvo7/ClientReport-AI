/**
 * ClientReport AI - Data Cleaning Studio Engine
 * Provides pure, non-destructive cleaning transformations with before/after diffing.
 */

import { Dataset, ColumnMeta, CleaningOperation, DataType } from '../types';
import { getValidNumbers } from './analytics';

/**
 * Calculate dataset overall quality score (0 - 100)
 */
export function calculateQualityScore(rows: Record<string, any>[], columns: ColumnMeta[]): number {
  if (rows.length === 0 || columns.length === 0) return 0;

  const totalCells = rows.length * columns.length;
  let missingCells = 0;

  for (const row of rows) {
    for (const col of columns) {
      const val = row[col.name];
      if (val === null || val === undefined || String(val).trim() === '') {
        missingCells++;
      }
    }
  }

  // Completeness score (0 - 40 points)
  const completenessRate = 1 - missingCells / totalCells;
  const completenessScore = Math.max(0, completenessRate * 40);

  // Duplication penalty (0 - 20 points)
  const rowStrings = new Set();
  let duplicateCount = 0;
  for (const row of rows) {
    const serialized = JSON.stringify(row);
    if (rowStrings.has(serialized)) {
      duplicateCount++;
    } else {
      rowStrings.add(serialized);
    }
  }
  const uniquenessRate = 1 - duplicateCount / rows.length;
  const uniquenessScore = Math.max(0, uniquenessRate * 20);

  // Type consistency (0 - 25 points)
  let consistentColumns = 0;
  for (const col of columns) {
    let matches = 0;
    for (const row of rows) {
      const v = row[col.name];
      if (v === null || v === undefined || v === '') continue;
      if (col.type === 'number' && Number.isFinite(Number(String(v).replace(/[$,%]/g, '')))) matches++;
      else if (col.type === 'date' && !isNaN(Date.parse(String(v)))) matches++;
      else matches++;
    }
    const nonMissing = rows.length - col.missingCount;
    if (nonMissing > 0 && matches / nonMissing > 0.9) {
      consistentColumns++;
    }
  }
  const typeScore = columns.length > 0 ? (consistentColumns / columns.length) * 25 : 25;

  // Empty Column / Row penalty (0 - 15 points)
  const emptyCols = columns.filter((c) => c.missingCount === rows.length).length;
  const colPenalty = emptyCols > 0 ? 0 : 15;

  return Math.min(100, Math.max(10, Math.round(completenessScore + uniquenessScore + typeScore + colPenalty)));
}

/**
 * Remove exact duplicate rows
 */
export function removeDuplicates(rows: Record<string, any>[]): {
  cleanedRows: Record<string, any>[];
  removedCount: number;
} {
  const seen = new Set<string>();
  const cleaned: Record<string, any>[] = [];

  for (const row of rows) {
    const key = JSON.stringify(row);
    if (!seen.has(key)) {
      seen.add(key);
      cleaned.push({ ...row });
    }
  }

  return {
    cleanedRows: cleaned,
    removedCount: rows.length - cleaned.length,
  };
}

/**
 * Drop completely empty columns
 */
export function dropEmptyColumns(
  rows: Record<string, any>[],
  columns: ColumnMeta[]
): {
  cleanedRows: Record<string, any>[];
  cleanedColumns: ColumnMeta[];
  droppedColumns: string[];
} {
  const dropped: string[] = [];

  const validCols = columns.filter((col) => {
    const hasData = rows.some((row) => {
      const val = row[col.name];
      return val !== null && val !== undefined && String(val).trim() !== '';
    });

    if (!hasData) {
      dropped.push(col.name);
      return false;
    }
    return true;
  });

  const cleanedRows = rows.map((row) => {
    const copy = { ...row };
    for (const d of dropped) {
      delete copy[d];
    }
    return copy;
  });

  return {
    cleanedRows,
    cleanedColumns: validCols,
    droppedColumns: dropped,
  };
}

/**
 * Trim whitespace across all string fields or specific column
 */
export function trimWhitespace(
  rows: Record<string, any>[],
  targetColumn?: string
): {
  cleanedRows: Record<string, any>[];
  modifiedCells: number;
} {
  let modifiedCells = 0;

  const cleanedRows = rows.map((row) => {
    const updated = { ...row };
    for (const key of Object.keys(updated)) {
      if (targetColumn && key !== targetColumn) continue;
      if (typeof updated[key] === 'string') {
        const trimmed = updated[key].trim();
        if (trimmed !== updated[key]) {
          modifiedCells++;
          updated[key] = trimmed;
        }
      }
    }
    return updated;
  });

  return { cleanedRows, modifiedCells };
}

/**
 * Normalize casing (lowercase, uppercase, title case)
 */
export function normalizeCasing(
  rows: Record<string, any>[],
  column: string,
  mode: 'titlecase' | 'uppercase' | 'lowercase'
): {
  cleanedRows: Record<string, any>[];
  modifiedCount: number;
} {
  let modifiedCount = 0;

  const cleanedRows = rows.map((row) => {
    const updated = { ...row };
    const val = updated[column];
    if (typeof val === 'string') {
      let transformed = val;
      if (mode === 'uppercase') transformed = val.toUpperCase();
      else if (mode === 'lowercase') transformed = val.toLowerCase();
      else if (mode === 'titlecase') {
        transformed = val
          .toLowerCase()
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
      }

      if (transformed !== val) {
        modifiedCount++;
        updated[column] = transformed;
      }
    }
    return updated;
  });

  return { cleanedRows, modifiedCount };
}

/**
 * Impute / fill missing values
 */
export function fillMissingValues(
  rows: Record<string, any>[],
  column: string,
  strategy: 'mean' | 'median' | 'mode' | 'custom' | 'drop_row',
  customValue?: any
): {
  cleanedRows: Record<string, any>[];
  imputedCount: number;
} {
  let imputedCount = 0;

  if (strategy === 'drop_row') {
    const cleaned = rows.filter((r) => {
      const v = r[column];
      return v !== null && v !== undefined && String(v).trim() !== '';
    });
    return {
      cleanedRows: cleaned,
      imputedCount: rows.length - cleaned.length,
    };
  }

  let fillTarget: any = customValue ?? 'N/A';

  if (strategy === 'mean' || strategy === 'median') {
    const nums = getValidNumbers(rows, column);
    if (nums.length > 0) {
      if (strategy === 'mean') {
        const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
        fillTarget = Number(avg.toFixed(2));
      } else {
        const sorted = [...nums].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        fillTarget = sorted.length % 2 !== 0 ? sorted[mid] : Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2));
      }
    }
  } else if (strategy === 'mode') {
    const freq = new Map<any, number>();
    for (const r of rows) {
      const v = r[column];
      if (v !== null && v !== undefined && String(v).trim() !== '') {
        freq.set(v, (freq.get(v) || 0) + 1);
      }
    }
    let topVal: any = null;
    let maxF = 0;
    for (const [val, count] of freq.entries()) {
      if (count > maxF) {
        maxF = count;
        topVal = val;
      }
    }
    if (topVal !== null) fillTarget = topVal;
  }

  const cleanedRows = rows.map((row) => {
    const updated = { ...row };
    const val = updated[column];
    if (val === null || val === undefined || String(val).trim() === '') {
      updated[column] = fillTarget;
      imputedCount++;
    }
    return updated;
  });

  return { cleanedRows, imputedCount };
}

/**
 * Filter numerical outliers via Interquartile Range (IQR) method
 */
export function filterOutliers(
  rows: Record<string, any>[],
  column: string
): {
  cleanedRows: Record<string, any>[];
  removedCount: number;
  lowerBound: number;
  upperBound: number;
} {
  const nums = getValidNumbers(rows, column).sort((a, b) => a - b);
  if (nums.length < 4) {
    return { cleanedRows: rows, removedCount: 0, lowerBound: 0, upperBound: 0 };
  }

  const q1 = nums[Math.floor(nums.length * 0.25)];
  const q3 = nums[Math.floor(nums.length * 0.75)];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  const cleanedRows = rows.filter((row) => {
    const v = row[column];
    if (v === null || v === undefined || v === '') return true;
    const num = typeof v === 'number' ? v : Number(String(v).replace(/[$,%]/g, ''));
    if (!Number.isFinite(num)) return true;
    return num >= lowerBound && num <= upperBound;
  });

  return {
    cleanedRows,
    removedCount: rows.length - cleanedRows.length,
    lowerBound: Number(lowerBound.toFixed(2)),
    upperBound: Number(upperBound.toFixed(2)),
  };
}

/**
 * Re-infer column metadata from rows
 */
export function refreshColumnMeta(rows: Record<string, any>[], prevColumns?: ColumnMeta[]): ColumnMeta[] {
  if (rows.length === 0) return prevColumns || [];

  const colNames = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));

  return colNames.map((name) => {
    let missingCount = 0;
    const sampleValues: any[] = [];
    const values: any[] = [];

    for (const r of rows) {
      const v = r[name];
      if (v === null || v === undefined || String(v).trim() === '') {
        missingCount++;
      } else {
        values.push(v);
        if (sampleValues.length < 5 && !sampleValues.includes(v)) {
          sampleValues.push(v);
        }
      }
    }

    const uniqueCount = new Set(values).size;

    // Detect type
    let numMatches = 0;
    let dateMatches = 0;
    let boolMatches = 0;

    for (const val of values.slice(0, 100)) {
      const strVal = String(val).trim();
      if (['true', 'false', '0', '1', 'yes', 'no'].includes(strVal.toLowerCase())) boolMatches++;
      const cleanedNum = strVal.replace(/[$,%]/g, '');
      if (cleanedNum !== '' && !isNaN(Number(cleanedNum))) numMatches++;
      if (strVal.length >= 8 && !isNaN(Date.parse(strVal)) && isNaN(Number(strVal))) dateMatches++;
    }

    const checkCount = Math.min(values.length, 100);
    let type: DataType = 'string';
    if (checkCount > 0) {
      if (numMatches / checkCount >= 0.75) type = 'number';
      else if (dateMatches / checkCount >= 0.75) type = 'date';
      else if (boolMatches / checkCount >= 0.9) type = 'boolean';
    }

    return {
      name,
      type,
      missingCount,
      uniqueCount,
      sampleValues,
    };
  });
}
