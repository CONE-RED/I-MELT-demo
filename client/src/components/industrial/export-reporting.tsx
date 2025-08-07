import { useState } from 'react';
import { Download, FileText, Share2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  sections: string[];
  timeRange: string;
  includeCharts: boolean;
}

interface OneClickReportProps {
  heatData: any;
  onExport: (options: ExportOptions) => void;
}

export function OneClickReport({ heatData, onExport }: OneClickReportProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    sections: ['all'],
    timeRange: 'current',
    includeCharts: true
  });

  const quickExports = [
    {
      id: 'production-summary',
      title: 'Production Summary',
      description: 'Key metrics and status overview',
      icon: FileText,
      format: 'pdf' as const,
      sections: ['heat-header', 'chemistry', 'energy'],
      action: () => generateQuickReport('production-summary')
    },
    {
      id: 'full-report',
      title: 'Complete Heat Report',
      description: 'All data including timeline and materials',
      icon: Download,
      format: 'pdf' as const,
      sections: ['all'],
      action: () => generateQuickReport('full-report')
    },
    {
      id: 'chemistry-data',
      title: 'Chemistry Export',
      description: 'Steel and slag composition data',
      icon: Share2,
      format: 'excel' as const,
      sections: ['chemistry'],
      action: () => generateQuickReport('chemistry-data')
    },
    {
      id: 'shift-handover',
      title: 'Shift Handover',
      description: 'Critical information for next operator',
      icon: Calendar,
      format: 'pdf' as const,
      sections: ['status', 'alerts', 'recommendations'],
      action: () => generateQuickReport('shift-handover')
    }
  ];

  const generateQuickReport = (reportType: string) => {
    const report = quickExports.find(r => r.id === reportType);
    if (!report) return;

    const options: ExportOptions = {
      format: report.format,
      sections: report.sections,
      timeRange: 'current',
      includeCharts: true
    };

    onExport(options);
    
    // Simulate report generation
    console.log(`Generating ${reportType} report...`);
    setTimeout(() => {
      console.log(`${reportType} report ready for download`);
    }, 2000);
  };

  if (!heatData) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <div className="bg-cone-black/90 backdrop-blur-sm border border-cone-gray/30 rounded-lg p-4 min-w-80">
        <h3 className="font-semibold text-cone-white mb-3 flex items-center gap-2">
          <Download className="w-5 h-5 text-cone-red" />
          Quick Reports
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {quickExports.map((export_item) => {
            const Icon = export_item.icon;
            return (
              <button
                key={export_item.id}
                onClick={export_item.action}
                className="p-3 bg-cone-gray/10 hover:bg-cone-gray/20 rounded-lg text-left transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 text-cone-red group-hover:text-cone-white flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm text-cone-white">
                      {export_item.title}
                    </div>
                    <div className="text-xs text-cone-gray mt-1">
                      {export_item.description}
                    </div>
                    <div className="text-xs text-cone-red mt-1 uppercase">
                      {export_item.format}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-3 pt-3 border-t border-cone-gray/20 text-xs text-cone-gray">
          Press <kbd className="bg-cone-gray/20 px-1 rounded">Ctrl+E</kbd> for quick export
        </div>
      </div>
    </div>
  );
}

interface SharedInsightsProps {
  insights: any[];
  onShare: (insight: any) => void;
}

export function SharedInsights({ insights, onShare }: SharedInsightsProps) {
  const shareableInsights = insights.filter(insight => 
    insight.type === 'critical' && insight.actionable && !insight.acknowledged
  );

  if (shareableInsights.length === 0) return null;

  return (
    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 mb-4">
      <h4 className="font-medium text-blue-400 mb-2 flex items-center gap-2">
        <Share2 className="w-4 h-4" />
        Share Critical Insights
      </h4>
      
      <div className="space-y-2">
        {shareableInsights.slice(0, 2).map((insight, index) => (
          <div key={insight.id} className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white truncate">{insight.title}</div>
              <div className="text-xs text-blue-300">{insight.message}</div>
            </div>
            <button
              onClick={() => onShare(insight)}
              className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
            >
              Share
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}