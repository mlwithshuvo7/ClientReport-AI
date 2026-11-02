/**
 * ClientReport AI - Mathematically Sound Analytics & Statistical Engine
 * All calculations are strictly derived from real data rows.
 */

import { NumericalStats, CategoricalStats, CorrelationPair, CalculatedKPI, ColumnMeta } from '../types';

/**
 * Filter valid finite numbers from a dataset column
 */
export function getValidNumbers(rows: Record<string, any>[], column: string): number[] {
  const result: number[] = [];
  for (const row of rows) {
    const val = row[column];
    if (val !== null && val !== undefined && val !== '') {
      const num = typeof val === 'number' ? val : Number(String(val).replace(/[$,%]/g, '').trim());
      if (Number.isFinite(num)) {
        result.push(num);
      }
    }
  }
  return result;
}

/**
 * Calculate full descriptive numerical statistics for a column
 */
export function calculateNumericalStats(rows: Record<string, any>[], column: string): NumericalStats | null {
  const values = getValidNumbers(rows, column);
  const totalRows = rows.length;
  const validCount = values.length;
  const missingCount = totalRows - validCount;

  if (validCount === 0) {
    return null;
  }

  // Sort ascending for median and percentile calculations
  const sorted = [...values].sort((a, b) => a - b);

  // Sum & Mean
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const mean = sum / validCount;

  // Min, Max, Range
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const range = max - min;

  // Median
  const mid = Math.floor(validCount / 2);
  const median = validCount % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

  // Mode
  const freqMap = new Map<number, number>();
  let maxFreq = 0;
  let mode: number | null = null;
  for (const num of sorted) {
    const f = (freqMap.get(num) || 0) + 1;
    freqMap.set(num, f);
    if (f > maxFreq) {
      maxFreq = f;
      mode = num;
    }
  }
  if (maxFreq === 1 && validCount > 1) {
    mode = null; // No repeated mode
  }

  // Variance & Standard Deviation (Sample standard deviation using n-1 if n > 1)
  let varianceSum = 0;
  for (const num of sorted) {
    varianceSum += Math.pow(num - mean, 2);
  }
  const variance = validCount > 1 ? varianceSum / (validCount - 1) : 0;
  const stdDev = Math.sqrt(variance);

  // Percentiles (linear interpolation)
  const getPercentile = (p: number): number => {
    if (validCount === 1) return sorted[0];
    const index = (p / 100) * (validCount - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  };

  const p25 = getPercentile(25);
  const p75 = getPercentile(75);
  const p90 = getPercentile(90);
  const iqr = p75 - p25;

  // Skewness indication
  let skewness: 'positive' | 'negative' | 'symmetrical' = 'symmetrical';
  const diff = mean - median;
  const tolerance = stdDev * 0.1;
  if (diff > tolerance) {
    skewness = 'positive';
  } else if (diff < -tolerance) {
    skewness = 'negative';
  }

  return {
    column,
    count: totalRows,
    validCount,
    missingCount,
    mean: Number(mean.toFixed(4)),
    median: Number(median.toFixed(4)),
    mode: mode !== null ? Number(mode.toFixed(4)) : null,
    min: Number(min.toFixed(4)),
    max: Number(max.toFixed(4)),
    range: Number(range.toFixed(4)),
    stdDev: Number(stdDev.toFixed(4)),
    variance: Number(variance.toFixed(4)),
    sum: Number(sum.toFixed(4)),
    p25: Number(p25.toFixed(4)),
    p75: Number(p75.toFixed(4)),
    p90: Number(p90.toFixed(4)),
    iqr: Number(iqr.toFixed(4)),
    skewness,
  };
}

/**
 * Calculate frequency statistics for categorical column
 */
export function calculateCategoricalStats(rows: Record<string, any>[], column: string): CategoricalStats {
  const counts = new Map<string, number>();
  let missing = 0;

  for (const row of rows) {
    const rawVal = row[column];
    if (rawVal === null || rawVal === undefined || String(rawVal).trim() === '') {
      missing++;
    } else {
      const key = String(rawVal).trim();
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }

  const total = rows.length;
  const sorted = Array.from(counts.entries())
    .map(([label, count]) => ({
      label,
      count,
      percentage: total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    column,
    uniqueCount: counts.size,
    missingCount: missing,
    topCategories: sorted.slice(0, 10),
  };
}

/**
 * Calculate Pearson correlation between two numerical columns
 */
export function calculatePearsonCorrelation(
  rows: Record<string, any>[],
  col1: string,
  col2: string
): CorrelationPair | null {
  const pairs: [number, number][] = [];

  for (const row of rows) {
    const v1 = row[col1];
    const v2 = row[col2];
    if (
      v1 !== null &&
      v1 !== undefined &&
      v1 !== '' &&
      v2 !== null &&
      v2 !== undefined &&
      v2 !== ''
    ) {
      const n1 = typeof v1 === 'number' ? v1 : Number(String(v1).replace(/[$,%]/g, '').trim());
      const n2 = typeof v2 === 'number' ? v2 : Number(String(v2).replace(/[$,%]/g, '').trim());
      if (Number.isFinite(n1) && Number.isFinite(n2)) {
        pairs.push([n1, n2]);
      }
    }
  }

  if (pairs.length < 3) return null;

  const n = pairs.length;
  let sum1 = 0,
    sum2 = 0,
    sum1Sq = 0,
    sum2Sq = 0,
    pSum = 0;

  for (const [x, y] of pairs) {
    sum1 += x;
    sum2 += y;
    sum1Sq += x * x;
    sum2Sq += y * y;
    pSum += x * y;
  }

  const num = pSum - (sum1 * sum2) / n;
  const den = Math.sqrt((sum1Sq - (sum1 * sum1) / n) * (sum2Sq - (sum2 * sum2) / n));

  if (den === 0 || !Number.isFinite(den)) return null;

  const correlation = Number((num / den).toFixed(3));
  const abs = Math.abs(correlation);

  let strength: CorrelationPair['strength'] = 'weak';
  if (abs >= 0.7) strength = 'very_strong';
  else if (abs >= 0.5) strength = 'strong';
  else if (abs >= 0.3) strength = 'moderate';

  return {
    col1,
    col2,
    correlation,
    strength,
  };
}

/**
 * Format currency or number
 */
export function formatMetric(val: number, type: 'currency' | 'percentage' | 'number' | 'ratio'): string {
  if (!Number.isFinite(val)) return 'N/A';
  if (type === 'currency') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: val >= 1000 ? 0 : 2,
    }).format(val);
  }
  if (type === 'percentage') {
    return `${val.toFixed(1)}%`;
  }
  if (type === 'ratio') {
    return `${val.toFixed(2)}x`;
  }
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(val);
}

/**
 * Automatically discover business KPIs based on authentic columns
 */
export function generateSmartKPIs(rows: Record<string, any>[], columns: ColumnMeta[]): CalculatedKPI[] {
  const kpis: CalculatedKPI[] = [];
  if (rows.length === 0) return kpis;

  // Always generate Dataset Overview KPI
  kpis.push({
    id: 'kpi-total-records',
    label: 'Total Processed Records',
    value: rows.length,
    formattedValue: new Intl.NumberFormat('en-US').format(rows.length),
    type: 'number',
    sourceColumn: 'All Columns',
    formula: 'COUNT(rows)',
    description: 'Total number of active cleaned rows in dataset.',
  });

  const numCols = columns.filter((c) => c.type === 'number');

  for (const col of numCols) {
    const lower = col.name.toLowerCase();
    const stats = calculateNumericalStats(rows, col.name);
    if (!stats) continue;

    // Revenue / Sales / Billing
    if (
      lower.includes('revenue') ||
      lower.includes('sales') ||
      lower.includes('turnover') ||
      lower.includes('amount') ||
      lower.includes('price') ||
      lower.includes('spend') ||
      lower.includes('budget')
    ) {
      kpis.push({
        id: `kpi-sum-${col.name}`,
        label: `Total ${col.name}`,
        value: stats.sum,
        formattedValue: formatMetric(stats.sum, 'currency'),
        type: 'currency',
        sourceColumn: col.name,
        formula: `SUM(${col.name})`,
        description: `Aggregate total across all ${stats.validCount} valid entries.`,
      });

      kpis.push({
        id: `kpi-avg-${col.name}`,
        label: `Average ${col.name}`,
        value: stats.mean,
        formattedValue: formatMetric(stats.mean, 'currency'),
        type: 'currency',
        sourceColumn: col.name,
        formula: `MEAN(${col.name})`,
        description: `Typical baseline value per transaction or record.`,
      });
    }

    // Profit / Margin
    else if (lower.includes('profit') || lower.includes('margin') || lower.includes('net')) {
      kpis.push({
        id: `kpi-profit-${col.name}`,
        label: `Total ${col.name}`,
        value: stats.sum,
        formattedValue: formatMetric(stats.sum, 'currency'),
        type: 'currency',
        sourceColumn: col.name,
        formula: `SUM(${col.name})`,
        description: `Cumulative bottom-line performance.`,
      });
    }

    // Percentage rates / Conversion / Churn
    else if (lower.includes('rate') || lower.includes('percentage') || lower.includes('ratio')) {
      kpis.push({
        id: `kpi-rate-${col.name}`,
        label: `Mean ${col.name}`,
        value: stats.mean,
        formattedValue: formatMetric(stats.mean, 'percentage'),
        type: 'percentage',
        sourceColumn: col.name,
        formula: `AVG(${col.name})`,
        description: `Average performance rate across records.`,
      });
    }

    // Units / Quantity / Volume / Clicks / Visitors
    else if (
      lower.includes('quantity') ||
      lower.includes('units') ||
      lower.includes('count') ||
      lower.includes('clicks') ||
      lower.includes('impressions') ||
      lower.includes('orders')
    ) {
      kpis.push({
        id: `kpi-units-${col.name}`,
        label: `Total ${col.name}`,
        value: stats.sum,
        formattedValue: formatMetric(stats.sum, 'number'),
        type: 'number',
        sourceColumn: col.name,
        formula: `SUM(${col.name})`,
        description: `Total cumulative volume recorded.`,
      });
    }
  }

  // If no business-specific columns were detected, add standard column stats
  if (kpis.length <= 1 && numCols.length > 0) {
    const firstCol = numCols[0];
    const stats = calculateNumericalStats(rows, firstCol.name);
    if (stats) {
      kpis.push({
        id: `kpi-general-mean-${firstCol.name}`,
        label: `Mean ${firstCol.name}`,
        value: stats.mean,
        formattedValue: formatMetric(stats.mean, 'number'),
        type: 'number',
        sourceColumn: firstCol.name,
        formula: `AVG(${firstCol.name})`,
        description: `Average distribution metric for ${firstCol.name}`,
      });
    }
  }

  return kpis;
}
