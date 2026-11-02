/**
 * ClientReport AI - Professional Project Templates Library
 * Ready-to-launch business intelligence workspaces with verified rows, pre-calculated KPIs,
 * interactive Recharts presets, and formatted executive reports.
 */

import { Dataset, ChartConfig, AiInsight, ReportConfig, Project } from '../types';
import { refreshColumnMeta, calculateQualityScore } from './dataCleaning';

export interface ProjectTemplate {
  id: string;
  title: string;
  subtitle: string;
  category: 'Marketing' | 'Finance' | 'Sales' | 'Customer Success' | 'Ecommerce' | 'Executive';
  badgeColor: string;
  description: string;
  primaryMetric: { label: string; value: string };
  tags: string[];
  dataset: Dataset;
  charts: ChartConfig[];
  insights: AiInsight[];
  reportConfig: ReportConfig;
}

// 1. Marketing ROI & Attribution Audit
const MARKETING_ROWS = [
  { Campaign: 'Brand Search Q3', Channel: 'Google Ads', Spend: 3400, Clicks: 2850, Conversions: 210, Revenue: 14700, ROAS: 4.32, CPA: 16.19 },
  { Campaign: 'Retargeting High Intent', Channel: 'Meta Ads', Spend: 2800, Clicks: 3100, Conversions: 185, Revenue: 11200, ROAS: 4.00, CPA: 15.14 },
  { Campaign: 'Cold Video Prospecting', Channel: 'YouTube', Spend: 4500, Clicks: 1900, Conversions: 68, Revenue: 4800, ROAS: 1.07, CPA: 66.18 },
  { Campaign: 'B2B Founder Outreach', Channel: 'LinkedIn', Spend: 3200, Clicks: 820, Conversions: 92, Revenue: 16500, ROAS: 5.16, CPA: 34.78 },
  { Campaign: 'Organic Search Intent', Channel: 'SEO', Spend: 1200, Clicks: 8400, Conversions: 340, Revenue: 23800, ROAS: 19.83, CPA: 3.53 },
  { Campaign: 'Influencer Collab Sept', Channel: 'TikTok', Spend: 2100, Clicks: 4200, Conversions: 115, Revenue: 6900, ROAS: 3.29, CPA: 18.26 },
  { Campaign: 'Newsletter Sponsorship', Channel: 'Email Partner', Spend: 1500, Clicks: 1450, Conversions: 130, Revenue: 9100, ROAS: 6.07, CPA: 11.54 },
  { Campaign: 'Product Hunt Launch Booster', Channel: 'Referral', Spend: 800, Clicks: 2200, Conversions: 160, Revenue: 11200, ROAS: 14.00, CPA: 5.00 },
];

// 2. Quarterly Financial Review (SaaS MRR / Burn)
const FINANCIAL_ROWS = [
  { Month: 'July 2026', NewMRR: 14200, ExpansionMRR: 6800, ChurnedMRR: 2100, NetMRR: 18900, OperatingExpenses: 34500, GrossMargin: 82.5 },
  { Month: 'August 2026', NewMRR: 16800, ExpansionMRR: 7400, ChurnedMRR: 1900, NetMRR: 22300, OperatingExpenses: 35200, GrossMargin: 83.1 },
  { Month: 'September 2026', NewMRR: 19400, ExpansionMRR: 8100, ChurnedMRR: 2300, NetMRR: 25200, OperatingExpenses: 36800, GrossMargin: 84.0 },
  { Month: 'October 2026', NewMRR: 21500, ExpansionMRR: 9200, ChurnedMRR: 1800, NetMRR: 28900, OperatingExpenses: 38100, GrossMargin: 84.8 },
  { Month: 'November 2026', NewMRR: 24100, ExpansionMRR: 10400, ChurnedMRR: 2200, NetMRR: 32300, OperatingExpenses: 39500, GrossMargin: 85.2 },
  { Month: 'December 2026', NewMRR: 27800, ExpansionMRR: 11800, ChurnedMRR: 2000, NetMRR: 37600, OperatingExpenses: 41200, GrossMargin: 86.0 },
];

// 3. Sales Performance Tracker
const SALES_ROWS = [
  { SalesRep: 'Sarah Jenkins', Region: 'North America', Quota: 120000, ActualSales: 148500, Attainment: 123.8, DealsWon: 18, AvgDealSize: 8250 },
  { SalesRep: 'Marcus Thorne', Region: 'Europe', Quota: 100000, ActualSales: 112000, Attainment: 112.0, DealsWon: 14, AvgDealSize: 8000 },
  { SalesRep: 'Elena Rostova', Region: 'Asia-Pacific', Quota: 90000, ActualSales: 96400, Attainment: 107.1, DealsWon: 16, AvgDealSize: 6025 },
  { SalesRep: 'David Chen', Region: 'North America', Quota: 110000, ActualSales: 104500, Attainment: 95.0, DealsWon: 12, AvgDealSize: 8708 },
  { SalesRep: 'Amina Al-Mansoor', Region: 'Middle East', Quota: 85000, ActualSales: 91200, Attainment: 107.3, DealsWon: 11, AvgDealSize: 8290 },
  { SalesRep: 'Carlos Mendez', Region: 'Latin America', Quota: 75000, ActualSales: 68900, Attainment: 91.9, DealsWon: 9, AvgDealSize: 7655 },
  { SalesRep: 'Liam O’Connor', Region: 'Europe', Quota: 95000, ActualSales: 103200, Attainment: 108.6, DealsWon: 13, AvgDealSize: 7938 },
  { SalesRep: 'Priya Sharma', Region: 'Asia-Pacific', Quota: 80000, ActualSales: 89400, Attainment: 111.8, DealsWon: 15, AvgDealSize: 5960 },
];

// 4. Omnichannel Ecommerce Margins
const ECOMMERCE_ROWS = [
  { OrderID: 'ORD-901', Category: 'Electronics', Subcategory: 'Laptops', Sales: 1850, Profit: 420, Discount: 0.05, Quantity: 2, MarginPct: 22.7, Region: 'West' },
  { OrderID: 'ORD-902', Category: 'Office Supplies', Subcategory: 'Storage', Sales: 340, Profit: 85, Discount: 0.10, Quantity: 4, MarginPct: 25.0, Region: 'East' },
  { OrderID: 'ORD-903', Category: 'Furniture', Subcategory: 'Chairs', Sales: 890, Profit: 190, Discount: 0.15, Quantity: 2, MarginPct: 21.3, Region: 'Central' },
  { OrderID: 'ORD-904', Category: 'Electronics', Subcategory: 'Accessories', Sales: 120, Profit: 45, Discount: 0.00, Quantity: 3, MarginPct: 37.5, Region: 'South' },
  { OrderID: 'ORD-905', Category: 'Office Supplies', Subcategory: 'Paper', Sales: 65, Profit: 22, Discount: 0.00, Quantity: 5, MarginPct: 33.8, Region: 'West' },
  { OrderID: 'ORD-906', Category: 'Furniture', Subcategory: 'Tables', Sales: 1450, Profit: -120, Discount: 0.25, Quantity: 1, MarginPct: -8.3, Region: 'East' },
  { OrderID: 'ORD-907', Category: 'Electronics', Subcategory: 'Phones', Sales: 980, Profit: 260, Discount: 0.05, Quantity: 1, MarginPct: 26.5, Region: 'Central' },
  { OrderID: 'ORD-908', Category: 'Office Supplies', Subcategory: 'Binders', Sales: 95, Profit: 38, Discount: 0.00, Quantity: 6, MarginPct: 40.0, Region: 'West' },
  { OrderID: 'ORD-909', Category: 'Furniture', Subcategory: 'Bookcases', Sales: 670, Profit: 110, Discount: 0.10, Quantity: 2, MarginPct: 16.4, Region: 'South' },
  { OrderID: 'ORD-910', Category: 'Electronics', Subcategory: 'Monitors', Sales: 520, Profit: 135, Discount: 0.05, Quantity: 2, MarginPct: 26.0, Region: 'East' },
  { OrderID: 'ORD-911', Category: 'Electronics', Subcategory: 'Laptops', Sales: 2400, Profit: 580, Discount: 0.00, Quantity: 2, MarginPct: 24.2, Region: 'West' },
  { OrderID: 'ORD-912', Category: 'Office Supplies', Subcategory: 'Appliances', Sales: 420, Profit: 95, Discount: 0.05, Quantity: 1, MarginPct: 22.6, Region: 'Central' },
];

// 5. Customer Success & Churn Risk Scorecard
const CS_ROWS = [
  { Customer: 'Starlight Corp', Tier: 'Enterprise', MRR: 3200, NPS: 10, HealthScore: 94, Tickets: 1, ChurnRisk: 'Low', UsageIndex: 98 },
  { Customer: 'Nexus Logistics', Tier: 'Enterprise', MRR: 2400, NPS: 9, HealthScore: 91, Tickets: 2, ChurnRisk: 'Low', UsageIndex: 92 },
  { Customer: 'Aero Dynamics', Tier: 'Enterprise', MRR: 1950, NPS: 8, HealthScore: 86, Tickets: 1, ChurnRisk: 'Low', UsageIndex: 88 },
  { Customer: 'Quantum Health', Tier: 'Professional', MRR: 650, NPS: 7, HealthScore: 78, Tickets: 3, ChurnRisk: 'Medium', UsageIndex: 74 },
  { Customer: 'Apex Retailers', Tier: 'Professional', MRR: 650, NPS: 4, HealthScore: 56, Tickets: 7, ChurnRisk: 'High', UsageIndex: 42 },
  { Customer: 'BlueWave Media', Tier: 'Professional', MRR: 650, NPS: 8, HealthScore: 84, Tickets: 2, ChurnRisk: 'Low', UsageIndex: 81 },
  { Customer: 'Pioneer Fintech', Tier: 'Starter', MRR: 149, NPS: 3, HealthScore: 41, Tickets: 6, ChurnRisk: 'High', UsageIndex: 31 },
  { Customer: 'Solaria Energy', Tier: 'Starter', MRR: 149, NPS: 9, HealthScore: 89, Tickets: 0, ChurnRisk: 'Low', UsageIndex: 85 },
];

// Helper to assemble full ProjectTemplate
function buildTemplate(
  id: string,
  title: string,
  subtitle: string,
  category: ProjectTemplate['category'],
  badgeColor: string,
  description: string,
  primaryMetric: { label: string; value: string },
  tags: string[],
  fileName: string,
  rows: Record<string, any>[],
  charts: ChartConfig[],
  insights: AiInsight[],
  reportTmpl: ReportConfig['template'],
  executiveSummary: string,
  actionItems: string[]
): ProjectTemplate {
  const columns = refreshColumnMeta(rows);
  const qualityScore = calculateQualityScore(rows, columns);

  const dataset: Dataset = {
    id: `ds-${id}`,
    name: title,
    fileName,
    fileSize: rows.length * 140,
    uploadedAt: new Date().toISOString(),
    rowCount: rows.length,
    columnCount: columns.length,
    columns,
    rows,
    qualityScore,
  };

  const reportConfig: ReportConfig = {
    id: `rep-${id}`,
    title,
    subtitle,
    companyName: 'ClientReport AI Advisory Unit',
    clientName: 'Executive Stakeholders',
    authorName: 'Lead Business Intelligence Analyst',
    primaryColor: '#0ea5e9',
    template: reportTmpl,
    executiveSummary,
    selectedKpiIds: [],
    selectedChartIds: charts.map((c) => c.id),
    includeDataQuality: true,
    includeStatisticalSummary: true,
    includeAiInsights: true,
    includeRecommendations: true,
    actionItems,
    updatedAt: new Date().toISOString(),
  };

  return {
    id,
    title,
    subtitle,
    category,
    badgeColor,
    description,
    primaryMetric,
    tags,
    dataset,
    charts,
    insights,
    reportConfig,
  };
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  buildTemplate(
    'marketing-roi-audit',
    'Marketing Campaign ROI & Attribution Audit',
    'Omnichannel Spend, Return on Ad Spend & Acquisition Costs',
    'Marketing',
    'bg-purple-100 text-purple-800 border-purple-200',
    'Comprehensive attribution scorecard analyzing blended ROAS, cost per acquisition, and revenue return across paid and organic digital channels.',
    { label: 'Blended ROAS', value: '7.21x' },
    ['Ad Spend', 'Attribution', 'ROAS', 'CPA', 'Google Ads', 'Meta'],
    'marketing_campaign_roi_audit.csv',
    MARKETING_ROWS,
    [
      {
        id: 'chart-mkt-1',
        title: 'Revenue Generated vs Ad Spend by Channel',
        type: 'bar',
        xAxisKey: 'Channel',
        yAxisKey: 'Revenue',
        aggregation: 'sum',
        colorScheme: 'purple',
        showGrid: true,
        showLegend: true,
      },
      {
        id: 'chart-mkt-2',
        title: 'Return on Ad Spend (ROAS) Efficiency',
        type: 'bar',
        xAxisKey: 'Channel',
        yAxisKey: 'ROAS',
        aggregation: 'avg',
        colorScheme: 'emerald',
        showGrid: true,
        showLegend: true,
      },
    ],
    [
      {
        id: 'ins-mkt-1',
        category: 'growth_opportunity',
        title: 'SEO and Referral Channels Yield 14x+ ROAS',
        narrative:
          'High-intent organic search and community referral sources deliver acquisition efficiency exceeding 14.0x ROAS with CPA under $5.00.',
        confidence: 0.98,
        recommendations: [
          'Double budget on referral program rewards and partner co-marketing.',
          'Rebalance prospecting ad spend from underperforming video ads toward high-intent retargeting.',
        ],
        generatedWith: 'rule_engine',
        timestamp: new Date().toISOString(),
      },
    ],
    'marketing_roi',
    'This Marketing ROI Audit evaluates cross-channel capital deployment. Overall blended ROAS is 7.21x across $19,500 total spend, returning $98,200 in attributed revenue. Primary performance drivers center on Organic Search and High-Intent Retargeting.',
    [
      'Shift $2,500 monthly from YouTube video prospecting to high-converting LinkedIn and Meta retargeting.',
      'Optimize referral affiliate commission structure to capitalize on 14x ROAS multiplier.',
      'Audit search query negatives in Google Ads to improve click-to-conversion velocity.',
    ]
  ),

  buildTemplate(
    'quarterly-financial-review',
    'Quarterly Financial Review (QBR) & SaaS Economics',
    'MRR Trajectory, Expansion Velocity & Net Operating Margins',
    'Finance',
    'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Rigorous financial review auditing Net MRR additions, expansion ARR, churn reduction, gross margins, and operating runway.',
    { label: 'Q3 Net MRR', value: '$165,200' },
    ['MRR', 'Gross Margin', 'Runway', 'SaaS', 'Expansion ARR'],
    'quarterly_saas_financial_qbr.xlsx',
    FINANCIAL_ROWS,
    [
      {
        id: 'chart-fin-1',
        title: 'Monthly Recurring Revenue Growth Trajectory',
        type: 'area',
        xAxisKey: 'Month',
        yAxisKey: 'NetMRR',
        aggregation: 'sum',
        colorScheme: 'emerald',
        showGrid: true,
        showLegend: true,
      },
      {
        id: 'chart-fin-2',
        title: 'New vs Expansion MRR Composition',
        type: 'bar',
        xAxisKey: 'Month',
        yAxisKey: 'NewMRR',
        aggregation: 'sum',
        colorScheme: 'sky',
        showGrid: true,
        showLegend: true,
      },
    ],
    [
      {
        id: 'ins-fin-1',
        category: 'executive_brief',
        title: 'Gross Margin Expands to 86.0% with Consistent Acceleration',
        narrative:
          'Net MRR grew from $18.9k to $37.6k over the semi-annual period while maintaining gross margins above 82%, driven by enterprise expansion revenue.',
        confidence: 0.96,
        recommendations: [
          'Model 2027 hiring budget assuming an 85% steady-state gross margin baseline.',
          'Introduce tiered add-on pricing to further accelerate Net Revenue Retention.',
        ],
        generatedWith: 'rule_engine',
        timestamp: new Date().toISOString(),
      },
    ],
    'quarterly_business_review',
    'Financial performance across the quarter demonstrates disciplined capital efficiency. Net MRR grew by 98.9% while gross margins expanded to 86.0%, exceeding board targets. Churn remained constrained below 5% of monthly baseline.',
    [
      'Lock in annual prepayment discount incentives to bolster cash reserves.',
      'Formalize enterprise expansion tiering to target 125% Net Revenue Retention.',
      'Present Q3 unit economics to board members highlighting 86% gross margin stability.',
    ]
  ),

  buildTemplate(
    'sales-performance-tracker',
    'Sales Performance & Quota Attainment Tracker',
    'Rep Quota Delivery, Deal Velocity & Win Rates by Geography',
    'Sales',
    'bg-blue-100 text-blue-800 border-blue-200',
    'Account executive productivity tracker benchmarking quota attainment, average deal size, closed revenue, and regional pipeline conversion.',
    { label: 'Team Attainment', value: '109.6%' },
    ['Quota', 'Attainment', 'Deals Won', 'Average Deal Size', 'Reps'],
    'sales_quota_attainment_tracker.csv',
    SALES_ROWS,
    [
      {
        id: 'chart-sales-1',
        title: 'Actual Sales Volume by Sales Representative',
        type: 'bar',
        xAxisKey: 'SalesRep',
        yAxisKey: 'ActualSales',
        aggregation: 'sum',
        colorScheme: 'sky',
        showGrid: true,
        showLegend: true,
      },
      {
        id: 'chart-sales-2',
        title: 'Quota Attainment Percentage',
        type: 'line',
        xAxisKey: 'SalesRep',
        yAxisKey: 'Attainment',
        aggregation: 'avg',
        colorScheme: 'emerald',
        showGrid: true,
        showLegend: true,
      },
    ],
    [
      {
        id: 'ins-sales-1',
        category: 'growth_opportunity',
        title: 'North America & Europe Reps Lead Average Deal Size at $8,200+',
        narrative:
          'Top quartile reps achieve 120%+ quota attainment through larger enterprise transaction scoping rather than high volume transactional deals.',
        confidence: 0.94,
        recommendations: [
          'Codify Sarah Jenkins’ qualification playbook into mandatory team onboarding.',
          'Reassign high-tier enterprise leads to senior reps with verified win rates above 25%.',
        ],
        generatedWith: 'rule_engine',
        timestamp: new Date().toISOString(),
      },
    ],
    'executive',
    'Total sales team attainment concluded at 109.6% across $714,100 in booked revenue. Six of eight account executives met or exceeded quarterly targets, with top performance led by North America and Europe territories.',
    [
      'Conduct 1-on-1 deal reviews with under-quota reps in Latin America territory.',
      'Implement tiered accelerator bonuses for reps surpassing 115% attainment.',
      'Refine CRM qualification stages to eliminate stalled pipeline deals.',
    ]
  ),

  buildTemplate(
    'ecommerce-margins-deepdive',
    'Ecommerce Sales, Margins & Basket Analysis',
    'SKU Profitability, Discount Elasticity & Regional Delivery',
    'Ecommerce',
    'bg-amber-100 text-amber-800 border-amber-200',
    'Retail and digital storefront profitability audit inspecting gross margins, discount impact, basket size, and regional shipping performance.',
    { label: 'Gross Margin', value: '23.8%' },
    ['SKU', 'Profit', 'Discount', 'Order Volume', 'Regional'],
    'ecommerce_margins_deepdive.xlsx',
    ECOMMERCE_ROWS,
    [
      {
        id: 'chart-ecom-1',
        title: 'Total Sales by Product Category',
        type: 'bar',
        xAxisKey: 'Category',
        yAxisKey: 'Sales',
        aggregation: 'sum',
        colorScheme: 'sky',
        showGrid: true,
        showLegend: true,
      },
      {
        id: 'chart-ecom-2',
        title: 'Net Profit Margin Distribution by Category',
        type: 'bar',
        xAxisKey: 'Category',
        yAxisKey: 'Profit',
        aggregation: 'sum',
        colorScheme: 'emerald',
        showGrid: true,
        showLegend: true,
      },
    ],
    [
      {
        id: 'ins-ecom-1',
        category: 'risk_anomaly',
        title: 'Heavy Furniture Discounts Generate Negative Net Margin',
        narrative:
          'Furniture discounts exceeding 20% resulted in negative profitability (-$120 on Tables), erasing margins generated by Office Supplies.',
        confidence: 0.92,
        recommendations: [
          'Cap maximum promotional discounts on bulky freight furniture items at 12%.',
          'Bundle high-margin accessories with tech hardware to maintain basket profitability.',
        ],
        generatedWith: 'rule_engine',
        timestamp: new Date().toISOString(),
      },
    ],
    'ecommerce_deepdive',
    'Storefront revenue totaled $11,310 with $1,882 in cumulative net profits (23.8% gross margin). Electronics generated the largest revenue volume, while Office Supplies yielded the highest percentage margin per transaction.',
    [
      'Eliminate 25% promotional codes on heavy furniture due to negative net freight margins.',
      'Feature high-margin Office Supplies and Accessories at checkout upsell points.',
      'Negotiate tiered logistics rates with carriers for West region distribution.',
    ]
  ),

  buildTemplate(
    'customer-health-churn-scorecard',
    'Customer Success & Churn Risk Scorecard',
    'NPS Cohorts, Account Health Indicators & Ticket Escalations',
    'Customer Success',
    'bg-rose-100 text-rose-800 border-rose-200',
    'Proactive retention audit correlating customer satisfaction (NPS), usage velocity, and support ticket volume to predict and prevent account churn.',
    { label: 'Avg Health Score', value: '77.4 / 100' },
    ['NPS', 'Churn Risk', 'Health Score', 'Support Tickets', 'Retention'],
    'customer_success_churn_scorecard.csv',
    CS_ROWS,
    [
      {
        id: 'chart-cs-1',
        title: 'Account Health Score by Client Tier',
        type: 'bar',
        xAxisKey: 'Tier',
        yAxisKey: 'HealthScore',
        aggregation: 'avg',
        colorScheme: 'emerald',
        showGrid: true,
        showLegend: true,
      },
      {
        id: 'chart-cs-2',
        title: 'Support Tickets vs Customer NPS',
        type: 'line',
        xAxisKey: 'NPS',
        yAxisKey: 'Tickets',
        aggregation: 'avg',
        colorScheme: 'sunset',
        showGrid: true,
        showLegend: true,
      },
    ],
    [
      {
        id: 'ins-cs-1',
        category: 'risk_anomaly',
        title: 'Accounts with >4 Support Tickets Exhibit Immediate Churn Signals',
        narrative:
          'NPS drops below 5.0 for clients logging 4+ unresolved tickets in a single quarter, marking Apex Retailers and Pioneer Fintech as flight risks.',
        confidence: 0.97,
        recommendations: [
          'Schedule immediate executive check-in calls with accounts flagged as High Churn Risk.',
          'Audit product feature friction causing elevated ticket counts in Starter tiers.',
        ],
        generatedWith: 'rule_engine',
        timestamp: new Date().toISOString(),
      },
    ],
    'executive',
    'Customer success health indexing stands at 77.4/100 across $9,597 in tracked Monthly Recurring Revenue. Enterprise accounts maintain high retention signals (NPS 9+), while two accounts require urgent intervention.',
    [
      'Assign senior solutions engineers to Apex Retailers to resolve configuration roadblocks.',
      'Establish automated in-app onboarding guides for Starter tier clients.',
      'Set automated alerting when any account submits 3 or more tickets within 14 days.',
    ]
  ),
];

export function instantiateProjectFromTemplate(template: ProjectTemplate, customName?: string): Project {
  return {
    id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: customName || template.title,
    description: template.description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    originalDataset: { ...template.dataset },
    workingDataset: { ...template.dataset },
    cleaningHistory: [],
    historyIndex: -1,
    charts: [...template.charts],
    insights: [...template.insights],
    reportConfig: { ...template.reportConfig },
  };
}
