/**
 * ClientReport AI - Core Data Models and Types
 */

export type DataType = 'number' | 'string' | 'date' | 'boolean';

export interface ColumnMeta {
  name: string;
  type: DataType;
  missingCount: number;
  uniqueCount: number;
  sampleValues: (string | number | boolean)[];
  min?: number;
  max?: number;
  mean?: number;
}

export interface Dataset {
  id: string;
  name: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  rowCount: number;
  columnCount: number;
  columns: ColumnMeta[];
  rows: Record<string, any>[];
  qualityScore: number; // 0 - 100
}

export type CleaningActionType =
  | 'remove_duplicates'
  | 'drop_empty_columns'
  | 'drop_empty_rows'
  | 'trim_whitespace'
  | 'normalize_casing'
  | 'fill_missing'
  | 'filter_outliers'
  | 'convert_type';

export interface CleaningOperation {
  id: string;
  type: CleaningActionType;
  column?: string;
  description: string;
  parameters?: Record<string, any>;
  timestamp: string;
  affectedRowCount?: number;
}

export interface CleaningHistoryStep {
  id: string;
  operation: CleaningOperation;
  rowsBeforeCount: number;
  rowsAfterCount: number;
  columnsBeforeCount: number;
  columnsAfterCount: number;
  snapshot: Record<string, any>[];
}

export interface NumericalStats {
  column: string;
  count: number;
  validCount: number;
  missingCount: number;
  mean: number;
  median: number;
  mode: number | null;
  min: number;
  max: number;
  range: number;
  stdDev: number;
  variance: number;
  sum: number;
  p25: number;
  p75: number;
  p90: number;
  iqr: number;
  skewness?: 'positive' | 'negative' | 'symmetrical';
}

export interface CategoricalStats {
  column: string;
  uniqueCount: number;
  missingCount: number;
  topCategories: { label: string; count: number; percentage: number }[];
}

export interface CorrelationPair {
  col1: string;
  col2: string;
  correlation: number; // -1 to 1
  strength: 'very_strong' | 'strong' | 'moderate' | 'weak';
}

export interface CalculatedKPI {
  id: string;
  label: string;
  value: number | string;
  formattedValue: string;
  type: 'currency' | 'percentage' | 'number' | 'ratio';
  changePercentage?: number;
  trend?: 'up' | 'down' | 'neutral';
  sourceColumn: string;
  formula: string;
  description: string;
}

export type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'scatter';
export type AggregationType = 'sum' | 'avg' | 'count' | 'min' | 'max';

export interface ChartConfig {
  id: string;
  title: string;
  type: ChartType;
  xAxisKey: string;
  yAxisKey: string;
  categoryKey?: string;
  aggregation: AggregationType;
  colorScheme: string;
  showGrid: boolean;
  showLegend: boolean;
  notes?: string;
}

export interface AiInsight {
  id: string;
  category: 'kpi_summary' | 'risk_anomaly' | 'growth_opportunity' | 'correlation' | 'executive_brief';
  title: string;
  narrative: string;
  confidence: number;
  recommendations: string[];
  generatedWith: 'gemini' | 'rule_engine';
  timestamp: string;
}

export interface ReportConfig {
  id: string;
  title: string;
  subtitle: string;
  companyName: string;
  clientName: string;
  authorName: string;
  logoUrl?: string;
  primaryColor: string;
  template: 'executive' | 'quarterly_business_review' | 'marketing_roi' | 'ecommerce_deepdive' | 'custom';
  executiveSummary: string;
  selectedKpiIds: string[];
  selectedChartIds: string[];
  includeDataQuality: boolean;
  includeStatisticalSummary: boolean;
  includeAiInsights: boolean;
  includeRecommendations: boolean;
  customNotes?: string;
  actionItems: string[];
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  originalDataset: Dataset;
  workingDataset: Dataset;
  cleaningHistory: CleaningHistoryStep[];
  historyIndex: number; // For undo/redo
  charts: ChartConfig[];
  insights: AiInsight[];
  reportConfig: ReportConfig;
}

export type LicenseTier = 'starter' | 'professional' | 'agency';

export interface LicenseInfo {
  key: string;
  tier: LicenseTier;
  status: 'active' | 'revoked' | 'expired';
  activatedDevices: number;
  maxDevices: number;
  customerEmail: string;
  issuedAt: string;
  expiresAt: string | null; // null = lifetime
  deviceId: string;
  features: {
    maxRows: number;
    excelSupport: boolean;
    customBranding: boolean;
    aiNarrativeGen: boolean;
    commercialRights: boolean;
    multiClientExport: boolean;
    unlimitedPdfExports: boolean;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  company: string;
  role: string;
  createdAt: string;
  license?: LicenseInfo;
}
