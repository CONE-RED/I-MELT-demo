/**
 * PDF Service for I-MELT ROI Reports
 * Phase 4: Server-generated PDF with line items and payback calculations
 */

import PDFDocument from 'pdfkit';
import type { ROIResult, Baseline, Current, Prices } from './roi';

export interface PDFReportData {
  roi: ROIResult;
  baseline: Baseline;
  current: Current;
  prices: Prices;
  metadata: {
    heatId: number;
    operator: string;
    timestamp: Date;
    reportId: string;
  };
}

export class PDFROIService {
  /**
   * Generate a professional ROI report PDF
   */
  generateROIPDF(data: PDFReportData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          size: 'A4',
          margins: { top: 50, left: 50, right: 50, bottom: 50 }
        });
        
        const buffers: Buffer[] = [];
        
        // Collect PDF data
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // Header
        this.addHeader(doc, data.metadata);
        
        // Executive Summary
        this.addExecutiveSummary(doc, data.roi, data.metadata);
        
        // Performance Improvements Table
        this.addPerformanceTable(doc, data.baseline, data.current, data.roi);
        
        // Savings Breakdown
        this.addSavingsBreakdown(doc, data.roi);
        
        // Payback Analysis
        this.addPaybackAnalysis(doc, data.roi);
        
        // Assumptions & Methodology
        this.addAssumptions(doc, data.baseline, data.prices);
        
        // Footer
        this.addFooter(doc, data.metadata);
        
        // Finalize PDF
        doc.end();
        
      } catch (error) {
        reject(error);
      }
    });
  }

  private addHeader(doc: PDFKit.PDFDocument, metadata: PDFReportData['metadata']) {
    // I-MELT Logo area (text-based for demo)
    doc.fontSize(24)
       .fillColor('#1f2937')
       .text('I-MELT', 50, 50, { align: 'left' })
       .fontSize(12)
       .fillColor('#6b7280')
       .text('Interactive Electric Arc Furnace AI Optimization', 50, 80);

    // Title
    doc.fontSize(20)
       .fillColor('#1f2937')
       .text('ROI Analysis Report', 50, 120, { align: 'center' })
       .fontSize(12)
       .fillColor('#6b7280')
       .text(`Heat #${metadata.heatId} • Generated ${metadata.timestamp.toLocaleDateString('en-EU')}`, 50, 150, { align: 'center' });

    // Horizontal line
    doc.moveTo(50, 180)
       .lineTo(545, 180)
       .strokeColor('#e5e7eb')
       .stroke();

    doc.y = 200; // Reset Y position
  }

  private addExecutiveSummary(doc: PDFKit.PDFDocument, roi: ROIResult, metadata: PDFReportData['metadata']) {
    const y = doc.y + 20;
    
    // Section title
    doc.fontSize(16)
       .fillColor('#1f2937')
       .text('Executive Summary', 50, y);

    // Summary box with background
    const boxY = y + 30;
    doc.rect(50, boxY, 495, 100)
       .fillAndStroke('#f3f4f6', '#e5e7eb');

    // Summary content
    doc.fontSize(14)
       .fillColor('#1f2937')
       .text(`Monthly Savings: €${roi.perMonth.toLocaleString('en-EU', { maximumFractionDigits: 0 })}`, 70, boxY + 15)
       .text(`Annual Projection: €${roi.perYear.toLocaleString('en-EU', { maximumFractionDigits: 0 })}`, 70, boxY + 35)
       .fontSize(12)
       .fillColor('#059669')
       .text(`Payback Period: ${roi.payback.months} months (${roi.payback.description})`, 70, boxY + 55)
       .fillColor('#6b7280')
       .text(`Based on analysis of Heat #${metadata.heatId} operated by ${metadata.operator}`, 70, boxY + 75);

    doc.y = boxY + 120;
  }

  private addPerformanceTable(doc: PDFKit.PDFDocument, baseline: Baseline, current: Current, roi: ROIResult) {
    const y = doc.y + 20;
    
    // Section title
    doc.fontSize(16)
       .fillColor('#1f2937')
       .text('Performance Improvements', 50, y);

    const tableY = y + 30;
    const colWidths = [150, 100, 100, 120];
    const rowHeight = 25;

    // Table header
    doc.rect(50, tableY, 470, rowHeight)
       .fillAndStroke('#374151', '#374151');
    
    doc.fontSize(10)
       .fillColor('white')
       .text('Metric', 55, tableY + 8)
       .text('Baseline', 205, tableY + 8)
       .text('Optimized', 305, tableY + 8)
       .text('Improvement', 405, tableY + 8);

    // Table rows
    const rows = [
      {
        metric: 'Energy Consumption',
        baseline: `${baseline.kwhPerT} kWh/t`,
        optimized: `${current.kwhPerT} kWh/t`,
        improvement: `${roi.details.energyDelta.toFixed(1)} kWh/t`,
        improved: roi.details.energyDelta > 0
      },
      {
        metric: 'Heat Duration',
        baseline: `${baseline.minPerHeat} min`,
        optimized: `${current.minPerHeat} min`,
        improvement: `${roi.details.timeDelta.toFixed(1)} min`,
        improved: roi.details.timeDelta > 0
      },
      {
        metric: 'Electrode Consumption',
        baseline: `${baseline.electrodeKgPerHeat} kg/heat`,
        optimized: `${current.electrodeKgPerHeat} kg/heat`,
        improvement: `${roi.details.electrodeDelta.toFixed(1)} kg/heat`,
        improved: roi.details.electrodeDelta > 0
      }
    ];

    rows.forEach((row, index) => {
      const rowY = tableY + (index + 1) * rowHeight;
      const fillColor = index % 2 === 0 ? '#f9fafb' : 'white';
      
      doc.rect(50, rowY, 470, rowHeight)
         .fillAndStroke(fillColor, '#e5e7eb');
      
      doc.fontSize(10)
         .fillColor('#1f2937')
         .text(row.metric, 55, rowY + 8)
         .text(row.baseline, 205, rowY + 8)
         .text(row.optimized, 305, rowY + 8)
         .fillColor(row.improved ? '#059669' : '#dc2626')
         .text(row.improvement, 405, rowY + 8);
    });

    doc.y = tableY + (rows.length + 1) * rowHeight + 20;
  }

  private addSavingsBreakdown(doc: PDFKit.PDFDocument, roi: ROIResult) {
    const y = doc.y + 20;
    
    // Section title
    doc.fontSize(16)
       .fillColor('#1f2937')
       .text('Savings Breakdown (Monthly)', 50, y);

    const chartY = y + 30;
    const chartHeight = 120;
    const maxSaving = Math.max(roi.breakdown.energySaving, roi.breakdown.timeSaving, roi.breakdown.electrodeSaving);
    
    // Energy savings bar
    const energyWidth = maxSaving > 0 ? (roi.breakdown.energySaving / maxSaving) * 300 : 0;
    doc.rect(50, chartY, energyWidth, 20)
       .fillAndStroke('#3b82f6', '#3b82f6');
    doc.fontSize(10)
       .fillColor('#1f2937')
       .text(`Energy: €${Math.round(roi.breakdown.energySaving * 30).toLocaleString('en-EU')}`, 360, chartY + 5);

    // Time savings bar
    const timeWidth = maxSaving > 0 ? (roi.breakdown.timeSaving / maxSaving) * 300 : 0;
    doc.rect(50, chartY + 30, timeWidth, 20)
       .fillAndStroke('#10b981', '#10b981');
    doc.text(`Time: €${Math.round(roi.breakdown.timeSaving * 30).toLocaleString('en-EU')}`, 360, chartY + 35);

    // Electrode savings bar
    const electrodeWidth = maxSaving > 0 ? (roi.breakdown.electrodeSaving / maxSaving) * 300 : 0;
    doc.rect(50, chartY + 60, electrodeWidth, 20)
       .fillAndStroke('#f59e0b', '#f59e0b');
    doc.text(`Electrodes: €${Math.round(roi.breakdown.electrodeSaving * 30).toLocaleString('en-EU')}`, 360, chartY + 65);

    // Total
    doc.fontSize(12)
       .fillColor('#1f2937')
       .text(`Total Monthly Savings: €${roi.perMonth.toLocaleString('en-EU', { maximumFractionDigits: 0 })}`, 50, chartY + 95);

    doc.y = chartY + chartHeight;
  }

  private addPaybackAnalysis(doc: PDFKit.PDFDocument, roi: ROIResult) {
    const y = doc.y + 20;
    
    // Section title
    doc.fontSize(16)
       .fillColor('#1f2937')
       .text('Investment & Payback Analysis', 50, y);

    const contentY = y + 30;
    
    // Investment box
    doc.rect(50, contentY, 230, 80)
       .fillAndStroke('#fef3c7', '#f59e0b');
    
    doc.fontSize(12)
       .fillColor('#92400e')
       .text('System Investment', 60, contentY + 10)
       .fontSize(18)
       .fillColor('#1f2937')
       .text(`€${roi.payback.investmentEstimate.toLocaleString('en-EU')}`, 60, contentY + 30)
       .fontSize(10)
       .fillColor('#92400e')
       .text('AI optimization system', 60, contentY + 55);

    // Payback box
    doc.rect(300, contentY, 230, 80)
       .fillAndStroke('#dcfce7', '#10b981');
    
    doc.fontSize(12)
       .fillColor('#166534')
       .text('Payback Period', 310, contentY + 10)
       .fontSize(18)
       .fillColor('#1f2937')
       .text(`${roi.payback.months} months`, 310, contentY + 30)
       .fontSize(10)
       .fillColor('#166534')
       .text(roi.payback.description, 310, contentY + 55);

    doc.y = contentY + 100;
  }

  private addAssumptions(doc: PDFKit.PDFDocument, baseline: Baseline, prices: Prices) {
    const y = doc.y + 20;
    
    // Section title
    doc.fontSize(16)
       .fillColor('#1f2937')
       .text('Assumptions & Methodology', 50, y);

    const contentY = y + 30;
    
    doc.fontSize(10)
       .fillColor('#4b5563')
       .text('Baseline Performance:', 50, contentY)
       .text(`• ${baseline.heatsPerDay} heats per day, ${baseline.massT}t per heat`, 70, contentY + 15)
       .text(`• Standard EAF operation parameters`, 70, contentY + 30)
       .text('', 50, contentY + 50)
       .text('Economic Assumptions:', 50, contentY + 50)
       .text(`• Electricity: €${prices.kwh}/kWh`, 70, contentY + 65)
       .text(`• Electrode cost: €${prices.electrode}/kg`, 70, contentY + 80)
       .text(`• Production value: €${prices.prodValuePerMin}/min`, 70, contentY + 95)
       .text('', 50, contentY + 115)
       .text('Methodology:', 50, contentY + 115)
       .text('• Savings calculated based on actual performance improvements', 70, contentY + 130)
       .text('• Monthly projections based on current operational tempo', 70, contentY + 145)
       .text('• Conservative estimates used for financial projections', 70, contentY + 160);

    doc.y = contentY + 180;
  }

  private addFooter(doc: PDFKit.PDFDocument, metadata: PDFReportData['metadata']) {
    const pageHeight = 792; // A4 height in points
    const footerY = pageHeight - 50;
    
    // Horizontal line
    doc.moveTo(50, footerY - 10)
       .lineTo(545, footerY - 10)
       .strokeColor('#e5e7eb')
       .stroke();

    doc.fontSize(8)
       .fillColor('#6b7280')
       .text(`Report ID: ${metadata.reportId}`, 50, footerY, { align: 'left' })
       .text(`Generated by I-MELT AI Optimization System`, 50, footerY, { align: 'center' })
       .text(`Page 1 of 1`, 50, footerY, { align: 'right' });
  }
}

// Export singleton instance
export const pdfService = new PDFROIService();