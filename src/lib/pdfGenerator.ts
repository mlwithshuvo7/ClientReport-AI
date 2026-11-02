/**
 * ClientReport AI - Professional PDF Report Generation Engine
 * Uses jsPDF to compile executive business intelligence reports with precise typography.
 */

import { jsPDF } from 'jspdf';
import { Project, CalculatedKPI } from '../types';

export interface GeneratePdfOptions {
  project: Project;
  kpis: CalculatedKPI[];
  includeBranding?: boolean;
}

export function generateReportPdf({ project, kpis }: GeneratePdfOptions): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  const report = project.reportConfig;
  const primaryHex = report.primaryColor || '#0ea5e9';

  // Helper: check page overflow and add page if needed
  const ensureSpace = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - 20) {
      doc.addPage();
      cursorY = margin;
      drawPageBorder();
    }
  };

  const drawPageBorder = () => {
    // Subtle top accent bar
    doc.setFillColor(primaryHex);
    doc.rect(margin, 10, contentWidth, 2, 'F');
  };

  drawPageBorder();
  cursorY = 18;

  // Header Banner
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(17, 24, 39); // Dark navy #111827
  doc.text(report.title || 'Executive Business Intelligence Report', margin, cursorY);
  cursorY += 8;

  if (report.subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text(report.subtitle, margin, cursorY);
    cursorY += 7;
  }

  // Metadata ribbon
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, cursorY, contentWidth, 14, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('Client:', margin + 4, cursorY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(report.clientName || 'General Stakeholders', margin + 18, cursorY + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Prepared By:', margin + 65, cursorY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(report.authorName || report.companyName || 'Lead Analyst', margin + 88, cursorY + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Date:', margin + 130, cursorY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), margin + 142, cursorY + 6);

  cursorY += 20;

  // Executive Summary Section
  if (report.executiveSummary) {
    ensureSpace(35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(17, 24, 39);
    doc.text('1. Executive Business Summary', margin, cursorY);
    cursorY += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    const splitSummary = doc.splitTextToSize(report.executiveSummary, contentWidth);
    doc.text(splitSummary, margin, cursorY);
    cursorY += splitSummary.length * 5 + 8;
  }

  // Data Quality & Scope
  if (report.includeDataQuality) {
    ensureSpace(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(17, 24, 39);
    doc.text('2. Dataset Governance & Health Audit', margin, cursorY);
    cursorY += 6;

    // Table box
    const boxW = (contentWidth - 6) / 3;
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin, cursorY, boxW, 16, 2, 2, 'F');
    doc.roundedRect(margin + boxW + 3, cursorY, boxW, 16, 2, 2, 'F');
    doc.roundedRect(margin + (boxW + 3) * 2, cursorY, boxW, 16, 2, 2, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('VERIFIED ROWS', margin + 4, cursorY + 5);
    doc.text('ATTRIBUTES / COLUMNS', margin + boxW + 7, cursorY + 5);
    doc.text('DATA HEALTH SCORE', margin + (boxW + 3) * 2 + 7, cursorY + 5);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(project.workingDataset.rowCount.toLocaleString(), margin + 4, cursorY + 12);
    doc.text(project.workingDataset.columnCount.toString(), margin + boxW + 7, cursorY + 12);
    doc.text(`${project.workingDataset.qualityScore} / 100`, margin + (boxW + 3) * 2 + 7, cursorY + 12);

    cursorY += 22;
  }

  // Key Performance Indicators Table
  if (kpis.length > 0) {
    ensureSpace(40);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(17, 24, 39);
    doc.text('3. Key Business Performance Indicators (KPIs)', margin, cursorY);
    cursorY += 6;

    // Header row
    doc.setFillColor(224, 242, 254);
    doc.rect(margin, cursorY, contentWidth, 7, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(14, 116, 144);
    doc.text('METRIC', margin + 3, cursorY + 5);
    doc.text('CALCULATED VALUE', margin + 70, cursorY + 5);
    doc.text('FORMULA & BASIS', margin + 115, cursorY + 5);
    cursorY += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);

    const kpiSlice = kpis.slice(0, 8);
    for (let i = 0; i < kpiSlice.length; i++) {
      const k = kpiSlice[i];
      ensureSpace(8);
      if (i % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, cursorY, contentWidth, 7, 'F');
      }
      doc.setFont('helvetica', 'bold');
      doc.text(k.label, margin + 3, cursorY + 5);
      doc.setFont('helvetica', 'normal');
      doc.text(k.formattedValue, margin + 70, cursorY + 5);
      doc.text(k.formula, margin + 115, cursorY + 5);
      cursorY += 7;
    }
    cursorY += 6;
  }

  // Key Findings and Strategic Insights
  if (report.includeAiInsights && project.insights && project.insights.length > 0) {
    ensureSpace(40);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(17, 24, 39);
    doc.text('4. Analytical Observations & Strategic Insights', margin, cursorY);
    cursorY += 6;

    for (const insight of project.insights.slice(0, 4)) {
      ensureSpace(24);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, cursorY, contentWidth, 20, 2, 2, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(14, 165, 233);
      doc.text(insight.title, margin + 4, cursorY + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      const splitText = doc.splitTextToSize(insight.narrative, contentWidth - 8);
      doc.text(splitText, margin + 4, cursorY + 11);

      cursorY += 24;
    }
  }

  // Strategic Action Items
  if (report.includeRecommendations && report.actionItems && report.actionItems.length > 0) {
    ensureSpace(35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(17, 24, 39);
    doc.text('5. High-Impact Recommended Next Steps', margin, cursorY);
    cursorY += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);

    for (let i = 0; i < report.actionItems.length; i++) {
      ensureSpace(8);
      const item = report.actionItems[i];
      doc.text(`[${i + 1}]  ${item}`, margin + 3, cursorY + 4);
      cursorY += 7;
    }
    cursorY += 6;
  }

  // Signoff & Authorization
  ensureSpace(25);
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, cursorY, margin + contentWidth, cursorY);
  cursorY += 6;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Prepared with ClientReport AI • ${report.companyName || 'Enterprise Analytics Unit'}`, margin, cursorY);
  doc.text('CONFIDENTIAL & PROPRIETARY', margin + contentWidth - 50, cursorY);

  // Add page numbers on all pages
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2 - 8, pageHeight - 6);
  }

  return doc;
}
