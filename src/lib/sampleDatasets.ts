/**
 * ClientReport AI - Curated Sample Datasets for Instant Prototyping & Demos
 */

import { Dataset } from '../types';
import { refreshColumnMeta, calculateQualityScore } from './dataCleaning';

const SAAS_ROWS: Record<string, any>[] = [
  { CustomerID: 'CUST-1001', Tier: 'Enterprise', MRR: 1250, Churn: 'No', SupportTickets: 2, NPS: 9, UsageScore: 88, Region: 'North America' },
  { CustomerID: 'CUST-1002', Tier: 'Professional', MRR: 450, Churn: 'No', SupportTickets: 1, NPS: 8, UsageScore: 74, Region: 'Europe' },
  { CustomerID: 'CUST-1003', Tier: 'Starter', MRR: 99, Churn: 'Yes', SupportTickets: 5, NPS: 4, UsageScore: 32, Region: 'North America' },
  { CustomerID: 'CUST-1004', Tier: 'Professional', MRR: 450, Churn: 'No', SupportTickets: 0, NPS: 10, UsageScore: 92, Region: 'Asia-Pacific' },
  { CustomerID: 'CUST-1005', Tier: 'Enterprise', MRR: 2400, Churn: 'No', SupportTickets: 3, NPS: 9, UsageScore: 95, Region: 'North America' },
  { CustomerID: 'CUST-1006', Tier: 'Starter', MRR: 99, Churn: 'Yes', SupportTickets: 4, NPS: 3, UsageScore: 21, Region: 'Europe' },
  { CustomerID: 'CUST-1007', Tier: 'Enterprise', MRR: 1800, Churn: 'No', SupportTickets: 1, NPS: 9, UsageScore: 89, Region: 'North America' },
  { CustomerID: 'CUST-1008', Tier: 'Professional', MRR: 450, Churn: 'No', SupportTickets: 2, NPS: 8, UsageScore: 78, Region: 'Latin America' },
  { CustomerID: 'CUST-1009', Tier: 'Starter', MRR: 99, Churn: 'No', SupportTickets: 0, NPS: 7, UsageScore: 65, Region: 'Asia-Pacific' },
  { CustomerID: 'CUST-1010', Tier: 'Enterprise', MRR: 3200, Churn: 'No', SupportTickets: 2, NPS: 10, UsageScore: 98, Region: 'North America' },
  { CustomerID: 'CUST-1011', Tier: 'Professional', MRR: 450, Churn: 'Yes', SupportTickets: 6, NPS: 2, UsageScore: 40, Region: 'Europe' },
  { CustomerID: 'CUST-1012', Tier: 'Starter', MRR: 99, Churn: 'No', SupportTickets: 1, NPS: 8, UsageScore: 59, Region: 'North America' },
  { CustomerID: 'CUST-1013', Tier: 'Enterprise', MRR: 1650, Churn: 'No', SupportTickets: 0, NPS: 9, UsageScore: 84, Region: 'Europe' },
  { CustomerID: 'CUST-1014', Tier: 'Professional', MRR: 450, Churn: 'No', SupportTickets: 3, NPS: 7, UsageScore: 71, Region: 'North America' },
  { CustomerID: 'CUST-1015', Tier: 'Starter', MRR: 99, Churn: 'Yes', SupportTickets: 7, NPS: 1, UsageScore: 18, Region: 'Asia-Pacific' },
  { CustomerID: 'CUST-1016', Tier: 'Enterprise', MRR: 2100, Churn: 'No', SupportTickets: 1, NPS: 9, UsageScore: 91, Region: 'North America' },
  { CustomerID: 'CUST-1017', Tier: 'Professional', MRR: 450, Churn: 'No', SupportTickets: 2, NPS: 8, UsageScore: 76, Region: 'Europe' },
  { CustomerID: 'CUST-1018', Tier: 'Enterprise', MRR: 2900, Churn: 'No', SupportTickets: 2, NPS: 9, UsageScore: 94, Region: 'North America' },
  { CustomerID: 'CUST-1019', Tier: 'Starter', MRR: 99, Churn: 'No', SupportTickets: 1, NPS: 8, UsageScore: 63, Region: 'North America' },
  { CustomerID: 'CUST-1020', Tier: 'Professional', MRR: 450, Churn: 'No', SupportTickets: 1, NPS: 8, UsageScore: 80, Region: 'Asia-Pacific' },
];

const ECOMMERCE_ROWS: Record<string, any>[] = [
  { OrderID: 'ORD-901', Category: 'Electronics', Subcategory: 'Laptops', Sales: 1850, Profit: 420, Discount: 0.05, Quantity: 2, Region: 'West' },
  { OrderID: 'ORD-902', Category: 'Office Supplies', Subcategory: 'Storage', Sales: 340, Profit: 85, Discount: 0.10, Quantity: 4, Region: 'East' },
  { OrderID: 'ORD-903', Category: 'Furniture', Subcategory: 'Chairs', Sales: 890, Profit: 190, Discount: 0.15, Quantity: 2, Region: 'Central' },
  { OrderID: 'ORD-904', Category: 'Electronics', Subcategory: 'Accessories', Sales: 120, Profit: 45, Discount: 0.00, Quantity: 3, Region: 'South' },
  { OrderID: 'ORD-905', Category: 'Office Supplies', Subcategory: 'Paper', Sales: 65, Profit: 22, Discount: 0.00, Quantity: 5, Region: 'West' },
  { OrderID: 'ORD-906', Category: 'Furniture', Subcategory: 'Tables', Sales: 1450, Profit: -120, Discount: 0.25, Quantity: 1, Region: 'East' },
  { OrderID: 'ORD-907', Category: 'Electronics', Subcategory: 'Phones', Sales: 980, Profit: 260, Discount: 0.05, Quantity: 1, Region: 'Central' },
  { OrderID: 'ORD-908', Category: 'Office Supplies', Subcategory: 'Binders', Sales: 95, Profit: 38, Discount: 0.00, Quantity: 6, Region: 'West' },
  { OrderID: 'ORD-909', Category: 'Furniture', Subcategory: 'Bookcases', Sales: 670, Profit: 110, Discount: 0.10, Quantity: 2, Region: 'South' },
  { OrderID: 'ORD-910', Category: 'Electronics', Subcategory: 'Monitors', Sales: 520, Profit: 135, Discount: 0.05, Quantity: 2, Region: 'East' },
  { OrderID: 'ORD-911', Category: 'Electronics', Subcategory: 'Laptops', Sales: 2400, Profit: 580, Discount: 0.00, Quantity: 2, Region: 'West' },
  { OrderID: 'ORD-912', Category: 'Office Supplies', Subcategory: 'Appliances', Sales: 420, Profit: 95, Discount: 0.05, Quantity: 1, Region: 'Central' },
  { OrderID: 'ORD-913', Category: 'Furniture', Subcategory: 'Furnishings', Sales: 280, Profit: 72, Discount: 0.00, Quantity: 4, Region: 'West' },
  { OrderID: 'ORD-914', Category: 'Electronics', Subcategory: 'Phones', Sales: 1250, Profit: 310, Discount: 0.05, Quantity: 1, Region: 'East' },
  { OrderID: 'ORD-915', Category: 'Office Supplies', Subcategory: 'Envelopes', Sales: 45, Profit: 18, Discount: 0.00, Quantity: 8, Region: 'South' },
];

const MARKETING_ROWS: Record<string, any>[] = [
  { Campaign: 'Brand Search Q3', Channel: 'Google Ads', Spend: 3400, Clicks: 2850, Conversions: 210, Revenue: 14700, ROAS: 4.32 },
  { Campaign: 'Retargeting High Intent', Channel: 'Meta Ads', Spend: 2800, Clicks: 3100, Conversions: 185, Revenue: 11200, ROAS: 4.00 },
  { Campaign: 'Cold Video Prospecting', Channel: 'YouTube', Spend: 4500, Clicks: 1900, Conversions: 68, Revenue: 4800, ROAS: 1.07 },
  { Campaign: 'B2B Founder Outreach', Channel: 'LinkedIn', Spend: 3200, Clicks: 820, Conversions: 92, Revenue: 16500, ROAS: 5.16 },
  { Campaign: 'Organic Search Intent', Channel: 'SEO', Spend: 1200, Clicks: 8400, Conversions: 340, Revenue: 23800, ROAS: 19.83 },
  { Campaign: 'Influencer Collab Sept', Channel: 'TikTok', Spend: 2100, Clicks: 4200, Conversions: 115, Revenue: 6900, ROAS: 3.29 },
  { Campaign: 'Newsletter Sponsorship', Channel: 'Email Partner', Spend: 1500, Clicks: 1450, Conversions: 130, Revenue: 9100, ROAS: 6.07 },
  { Campaign: 'Product Hunt Launch Booster', Channel: 'Referral', Spend: 800, Clicks: 2200, Conversions: 160, Revenue: 11200, ROAS: 14.00 },
];

export function getSampleDataset(type: 'saas' | 'ecommerce' | 'marketing'): Dataset {
  let name = '';
  let fileName = '';
  let rows: Record<string, any>[] = [];

  if (type === 'saas') {
    name = 'SaaS Subscription & Churn Metrics';
    fileName = 'saas_mrr_churn_q3.csv';
    rows = SAAS_ROWS;
  } else if (type === 'ecommerce') {
    name = 'Omnichannel Sales & Profitability';
    fileName = 'ecommerce_orders_profit.xlsx';
    rows = ECOMMERCE_ROWS;
  } else {
    name = 'Marketing Campaign ROI & Attribution';
    fileName = 'digital_marketing_performance.csv';
    rows = MARKETING_ROWS;
  }

  const columns = refreshColumnMeta(rows);
  const qualityScore = calculateQualityScore(rows, columns);

  return {
    id: `sample-${type}-${Date.now()}`,
    name,
    fileName,
    fileSize: rows.length * 128,
    uploadedAt: new Date().toISOString(),
    rowCount: rows.length,
    columnCount: columns.length,
    columns,
    rows,
    qualityScore,
  };
}
