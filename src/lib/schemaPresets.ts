/**
 * ClientReport AI - Analytics Schema Presets and Smart Column Mapping
 * Provides standard business intelligence data models, fuzzy auto-mapping, and data type transformation.
 */

import { DataType, ColumnMeta } from '../types';
import { refreshColumnMeta } from './dataCleaning';

export interface SchemaField {
  id: string;
  name: string;
  type: DataType;
  required: boolean;
  description: string;
  matchKeywords: string[];
}

export interface SchemaPreset {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  fields: SchemaField[];
}

export interface ColumnMappingItem {
  sourceColumn: string;
  targetFieldId: string; // schema field id, '__exclude__', or '__custom__'
  customTargetName: string;
  targetType: DataType;
  confidence: number; // 0 - 100
  isAutoMatched: boolean;
}

export const SCHEMA_PRESETS: SchemaPreset[] = [
  {
    id: 'general_bi',
    title: 'General Business Intelligence',
    subtitle: 'Universal tabular schema for sales, finances, and operational metrics',
    badge: 'Universal',
    description: 'Best for standard business dashboards, executive summaries, and multi-dimensional analysis.',
    fields: [
      {
        id: 'date',
        name: 'Date / Period',
        type: 'date',
        required: true,
        description: 'Primary transaction, creation, or reporting timestamp',
        matchKeywords: ['date', 'time', 'timestamp', 'created_at', 'order_date', 'trans_date', 'period', 'month', 'year', 'day'],
      },
      {
        id: 'primary_metric',
        name: 'Primary Metric (Revenue / Amount)',
        type: 'number',
        required: true,
        description: 'Main financial or quantitative KPI (e.g. Sales, Gross Revenue, MRR)',
        matchKeywords: ['revenue', 'sales', 'amount', 'mrr', 'total', 'turnover', 'gross', 'income', 'value', 'price', 'subtotal'],
      },
      {
        id: 'dimension_primary',
        name: 'Primary Category / Dimension',
        type: 'string',
        required: true,
        description: 'Main grouping dimension (e.g. Product Line, Category, Business Unit)',
        matchKeywords: ['category', 'product', 'type', 'segment', 'department', 'line', 'group', 'service', 'class'],
      },
      {
        id: 'secondary_metric',
        name: 'Secondary Metric (Cost / Profit)',
        type: 'number',
        required: false,
        description: 'Cost, margin, discounts, or secondary operational metric',
        matchKeywords: ['cost', 'cogs', 'profit', 'margin', 'discount', 'expense', 'fee', 'net', 'spend'],
      },
      {
        id: 'entity_id',
        name: 'Identifier / ID',
        type: 'string',
        required: false,
        description: 'Unique record key, transaction number, order ID, or customer ID',
        matchKeywords: ['id', 'uuid', 'code', 'order_id', 'account_id', 'trans_id', 'invoice_no', 'cust_id'],
      },
      {
        id: 'quantity',
        name: 'Quantity / Units',
        type: 'number',
        required: false,
        description: 'Volume count, number of items, or units sold',
        matchKeywords: ['quantity', 'qty', 'units', 'count', 'items', 'volume', 'headcount'],
      },
      {
        id: 'status',
        name: 'Status / Stage',
        type: 'string',
        required: false,
        description: 'Fulfillment status, lifecycle stage, or operational condition',
        matchKeywords: ['status', 'state', 'stage', 'condition', 'fulfillment', 'phase', 'flag'],
      },
      {
        id: 'region',
        name: 'Region / Geography',
        type: 'string',
        required: false,
        description: 'Geographic region, country, state, or sales territory',
        matchKeywords: ['region', 'country', 'city', 'state', 'territory', 'location', 'zone', 'market'],
      },
    ],
  },
  {
    id: 'saas_subscriptions',
    title: 'SaaS & Subscriptions',
    subtitle: 'Recurring revenue, customer retention, churn, and NPS',
    badge: 'SaaS & Tech',
    description: 'Tailored for software-as-a-service companies tracking MRR, plan tiers, ARR, and customer retention.',
    fields: [
      {
        id: 'customer_name',
        name: 'Customer / Account Name',
        type: 'string',
        required: true,
        description: 'Company or user account name',
        matchKeywords: ['customer', 'company', 'client', 'account', 'org', 'subscriber', 'name'],
      },
      {
        id: 'mrr',
        name: 'Monthly Recurring Revenue (MRR)',
        type: 'number',
        required: true,
        description: 'Subscription recurring revenue or billing amount',
        matchKeywords: ['mrr', 'recurring', 'revenue', 'monthly_fee', 'plan_price', 'billing_amount', 'arr', 'subtotal'],
      },
      {
        id: 'plan_tier',
        name: 'Subscription Plan / Tier',
        type: 'string',
        required: true,
        description: 'Service package (e.g. Starter, Pro, Enterprise, Scale)',
        matchKeywords: ['plan', 'tier', 'package', 'edition', 'sku', 'product', 'level'],
      },
      {
        id: 'status',
        name: 'Subscription Status / Churn Flag',
        type: 'string',
        required: true,
        description: 'Active, Churned, Trialling, Past Due, or Paused',
        matchKeywords: ['status', 'churn', 'is_churned', 'active', 'state', 'renewal_status'],
      },
      {
        id: 'signup_date',
        name: 'Signup / Activation Date',
        type: 'date',
        required: false,
        description: 'Initial registration, subscription start, or renewal date',
        matchKeywords: ['signup', 'start_date', 'created_at', 'activated', 'renewal_date', 'joined_date', 'date'],
      },
      {
        id: 'nps_score',
        name: 'NPS / Health Score',
        type: 'number',
        required: false,
        description: 'Net Promoter Score (0-10) or account satisfaction indicator',
        matchKeywords: ['nps', 'score', 'health', 'satisfaction', 'csat', 'rating'],
      },
      {
        id: 'expansion_rev',
        name: 'Addon / Expansion Revenue',
        type: 'number',
        required: false,
        description: 'Additional seats, credits, or expansion spend',
        matchKeywords: ['expansion', 'addon', 'upsell', 'overage', 'seats', 'additional'],
      },
      {
        id: 'industry',
        name: 'Industry / Vertical',
        type: 'string',
        required: false,
        description: 'Customer market vertical or segment',
        matchKeywords: ['industry', 'vertical', 'segment', 'sector', 'domain'],
      },
    ],
  },
  {
    id: 'ecommerce_orders',
    title: 'Ecommerce & Retail',
    subtitle: 'Order checkout logs, margins, shipping, and product lines',
    badge: 'Ecommerce',
    description: 'Optimized for online stores (Shopify, Amazon, WooCommerce) to calculate gross margin, AOV, and basket size.',
    fields: [
      {
        id: 'order_id',
        name: 'Order Number / ID',
        type: 'string',
        required: true,
        description: 'Unique transaction or receipt number',
        matchKeywords: ['order_id', 'order_number', 'order_no', 'invoice_no', 'transaction_id', 'receipt_id'],
      },
      {
        id: 'order_date',
        name: 'Order Date & Time',
        type: 'date',
        required: true,
        description: 'Checkout timestamp or fulfillment date',
        matchKeywords: ['order_date', 'checkout_date', 'date', 'created_at', 'timestamp', 'placed_at'],
      },
      {
        id: 'order_revenue',
        name: 'Total Order Revenue',
        type: 'number',
        required: true,
        description: 'Gross checkout amount collected from customer',
        matchKeywords: ['total', 'revenue', 'order_total', 'gross_sales', 'subtotal', 'line_total', 'amount'],
      },
      {
        id: 'product_title',
        name: 'Product Name / Title',
        type: 'string',
        required: true,
        description: 'Item name, SKU title, or product description',
        matchKeywords: ['product', 'item', 'title', 'sku_name', 'variant', 'description'],
      },
      {
        id: 'quantity_sold',
        name: 'Quantity / Units',
        type: 'number',
        required: true,
        description: 'Number of units ordered in this line item',
        matchKeywords: ['quantity', 'qty', 'units', 'pieces', 'count'],
      },
      {
        id: 'unit_cost',
        name: 'Unit Cost / COGS',
        type: 'number',
        required: false,
        description: 'Cost of goods sold or manufacturing cost per unit',
        matchKeywords: ['cogs', 'cost', 'unit_cost', 'wholesale_price', 'expense'],
      },
      {
        id: 'order_category',
        name: 'Collection / Category',
        type: 'string',
        required: false,
        description: 'Product collection, department, or catalog group',
        matchKeywords: ['category', 'collection', 'department', 'type', 'tag'],
      },
      {
        id: 'shipping_city',
        name: 'Shipping City / State',
        type: 'string',
        required: false,
        description: 'Destination city, province, or postal code',
        matchKeywords: ['city', 'state', 'shipping_address', 'region', 'country', 'zip'],
      },
      {
        id: 'fulfillment_status',
        name: 'Fulfillment Status',
        type: 'string',
        required: false,
        description: 'Delivered, Shipped, Processing, Refunded, or Cancelled',
        matchKeywords: ['fulfillment_status', 'shipping_status', 'status', 'delivery_status'],
      },
    ],
  },
  {
    id: 'marketing_attribution',
    title: 'Marketing & Ad Campaigns',
    subtitle: 'Paid acquisition channels, ad spend, clicks, and ROAS',
    badge: 'Marketing',
    description: 'Designed for digital marketers analyzing Facebook Ads, Google Ads, LinkedIn, and TikTok ROI.',
    fields: [
      {
        id: 'campaign_name',
        name: 'Campaign Name',
        type: 'string',
        required: true,
        description: 'Marketing campaign identifier or ad set name',
        matchKeywords: ['campaign', 'campaign_name', 'adset', 'utm_campaign', 'ad_name', 'initiative'],
      },
      {
        id: 'channel',
        name: 'Channel / Platform',
        type: 'string',
        required: true,
        description: 'Traffic source (e.g. Google Search, Meta Ads, LinkedIn, TikTok)',
        matchKeywords: ['channel', 'source', 'platform', 'utm_source', 'medium', 'network'],
      },
      {
        id: 'ad_spend',
        name: 'Ad Spend / Cost',
        type: 'number',
        required: true,
        description: 'Total advertising expenditure in reporting currency',
        matchKeywords: ['spend', 'cost', 'ad_spend', 'budget_spent', 'investment', 'amount_spent'],
      },
      {
        id: 'impressions',
        name: 'Impressions / Reach',
        type: 'number',
        required: false,
        description: 'Total views, exposures, or reach count',
        matchKeywords: ['impressions', 'views', 'reach', 'impr', 'frequency'],
      },
      {
        id: 'clicks',
        name: 'Clicks / Traffic',
        type: 'number',
        required: false,
        description: 'Link clicks, landing page visits, or traffic volume',
        matchKeywords: ['clicks', 'link_clicks', 'sessions', 'visits'],
      },
      {
        id: 'conversions',
        name: 'Conversions / Leads',
        type: 'number',
        required: false,
        description: 'Signups, leads, purchases, or goals achieved',
        matchKeywords: ['conversions', 'leads', 'purchases', 'signups', 'goals', 'results'],
      },
      {
        id: 'attributed_revenue',
        name: 'Attributed Revenue',
        type: 'number',
        required: false,
        description: 'Sales volume directly attributed to this campaign',
        matchKeywords: ['revenue', 'sales', 'conversion_value', 'attributed_revenue', 'purchase_value'],
      },
      {
        id: 'campaign_date',
        name: 'Reporting Date',
        type: 'date',
        required: false,
        description: 'Ad run date or reporting period',
        matchKeywords: ['date', 'day', 'reporting_date', 'period', 'week'],
      },
    ],
  },
  {
    id: 'custom_schema',
    title: 'Custom Flexible Schema',
    subtitle: 'Direct column-by-column header mapping and type assignment',
    badge: 'Custom',
    description: 'Keep your source structure while renaming specific fields, adjusting data types, or omitting columns.',
    fields: [],
  },
];

/**
 * Calculate similarity between source column name and a list of target keywords.
 * Returns a score between 0 and 100.
 */
export function calculateHeaderSimilarity(
  sourceCol: string,
  targetField: SchemaField,
  detectedType?: DataType
): number {
  const normSource = sourceCol.toLowerCase().replace(/[^a-z0-9]/g, '');
  const targetNormId = targetField.id.toLowerCase().replace(/[^a-z0-9]/g, '');
  const targetNormName = targetField.name.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Exact ID match
  if (normSource === targetNormId) return 100;
  if (normSource === targetNormName) return 98;

  let bestKeywordScore = 0;

  for (const kw of targetField.matchKeywords) {
    const normKw = kw.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normSource === normKw) {
      bestKeywordScore = Math.max(bestKeywordScore, 95);
    } else if (normSource.includes(normKw) || normKw.includes(normSource)) {
      // Partial match
      const ratio = Math.min(normSource.length, normKw.length) / Math.max(normSource.length, normKw.length);
      const score = Math.round(70 + ratio * 20);
      bestKeywordScore = Math.max(bestKeywordScore, score);
    }
  }

  // Bonus/penalty for matching data type
  if (detectedType) {
    if (detectedType === targetField.type) {
      bestKeywordScore = Math.min(100, bestKeywordScore + 5);
    } else if (
      (targetField.type === 'number' && detectedType === 'string') ||
      (targetField.type === 'date' && detectedType === 'number')
    ) {
      bestKeywordScore = Math.max(0, bestKeywordScore - 15);
    }
  }

  return bestKeywordScore;
}

/**
 * Automatically determine the best matching preset for a given dataset columns.
 */
export function autoDetectPreset(columns: ColumnMeta[]): string {
  const colNames = columns.map((c) => c.name.toLowerCase());
  const allText = colNames.join(' ');

  if (allText.includes('mrr') || allText.includes('churn') || allText.includes('subscription') || allText.includes('plan')) {
    return 'saas_subscriptions';
  }
  if (allText.includes('sku') || allText.includes('shipping') || allText.includes('cogs') || (allText.includes('order') && allText.includes('product'))) {
    return 'ecommerce_orders';
  }
  if (allText.includes('roas') || allText.includes('campaign') || allText.includes('clicks') || allText.includes('impressions') || allText.includes('ad_spend')) {
    return 'marketing_attribution';
  }

  return 'general_bi';
}

/**
 * Generates initial column mapping based on the selected schema preset and source columns.
 */
export function generateSmartMapping(
  columns: ColumnMeta[],
  presetId: string
): ColumnMappingItem[] {
  const preset = SCHEMA_PRESETS.find((p) => p.id === presetId) || SCHEMA_PRESETS[0];

  if (preset.id === 'custom_schema' || preset.fields.length === 0) {
    // Custom mapping: each column maps to itself as custom name with its detected type
    return columns.map((c) => ({
      sourceColumn: c.name,
      targetFieldId: '__custom__',
      customTargetName: c.name,
      targetType: c.type,
      confidence: 100,
      isAutoMatched: false,
    }));
  }

  const assignedTargetIds = new Set<string>();
  const mappingItems: ColumnMappingItem[] = [];

  // Match columns to target fields by highest similarity
  for (const col of columns) {
    let bestField: SchemaField | null = null;
    let highestScore = 0;

    for (const field of preset.fields) {
      if (assignedTargetIds.has(field.id)) continue; // avoid 2 columns mapping to same required target initially
      const score = calculateHeaderSimilarity(col.name, field, col.type);
      if (score > highestScore && score >= 65) {
        highestScore = score;
        bestField = field;
      }
    }

    if (bestField && highestScore >= 65) {
      assignedTargetIds.add(bestField.id);
      mappingItems.push({
        sourceColumn: col.name,
        targetFieldId: bestField.id,
        customTargetName: bestField.name,
        targetType: bestField.type,
        confidence: highestScore,
        isAutoMatched: true,
      });
    } else {
      // Keep as custom or unmapped
      mappingItems.push({
        sourceColumn: col.name,
        targetFieldId: '__custom__',
        customTargetName: col.name,
        targetType: col.type,
        confidence: 0,
        isAutoMatched: false,
      });
    }
  }

  return mappingItems;
}

/**
 * Clean & cast a single value based on the assigned target type.
 */
export function castValueToType(val: any, targetType: DataType): any {
  if (val === null || val === undefined) return null;
  const str = String(val).trim();
  if (str === '') return null;

  switch (targetType) {
    case 'number': {
      if (typeof val === 'number') return isFinite(val) ? val : null;
      // Strip currency signs, percentage symbols, and commas
      const cleaned = str.replace(/[$,% ]/g, '');
      const parsed = Number(cleaned);
      return Number.isFinite(parsed) ? parsed : null;
    }
    case 'boolean': {
      if (typeof val === 'boolean') return val;
      const lower = str.toLowerCase();
      if (['true', 'yes', '1', 'y', 'active'].includes(lower)) return true;
      if (['false', 'no', '0', 'n', 'inactive'].includes(lower)) return false;
      return Boolean(val);
    }
    case 'date': {
      if (val instanceof Date) return val.toISOString().split('T')[0];
      const parsedTimestamp = Date.parse(str);
      if (!isNaN(parsedTimestamp)) {
        try {
          return new Date(parsedTimestamp).toISOString().split('T')[0];
        } catch {
          return str;
        }
      }
      return str;
    }
    case 'string':
    default:
      return str;
  }
}

/**
 * Applies the finalized column mapping to raw dataset rows.
 * Excluded columns are dropped; mapped columns are renamed and cast to target types.
 */
export function applyColumnMapping(
  sourceRows: Record<string, any>[],
  mappings: ColumnMappingItem[],
  preset: SchemaPreset
): { rows: Record<string, any>[]; columns: ColumnMeta[] } {
  if (sourceRows.length === 0) {
    return { rows: [], columns: [] };
  }

  // Build field lookup for target names
  const fieldLookup = new Map<string, SchemaField>();
  for (const f of preset.fields) {
    fieldLookup.set(f.id, f);
  }

  // Active mappings (ignoring excluded)
  const activeMappings = mappings.filter((m) => m.targetFieldId !== '__exclude__');

  const transformedRows: Record<string, any>[] = [];

  for (const srcRow of sourceRows) {
    const destRow: Record<string, any> = {};

    for (const m of activeMappings) {
      let finalColName = m.customTargetName.trim();

      if (m.targetFieldId !== '__custom__') {
        const targetField = fieldLookup.get(m.targetFieldId);
        if (targetField) {
          finalColName = targetField.name;
        }
      }

      if (!finalColName) {
        finalColName = m.sourceColumn;
      }

      const rawVal = srcRow[m.sourceColumn];
      destRow[finalColName] = castValueToType(rawVal, m.targetType);
    }

    transformedRows.push(destRow);
  }

  const updatedMeta = refreshColumnMeta(transformedRows);

  return {
    rows: transformedRows,
    columns: updatedMeta,
  };
}
