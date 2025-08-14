import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useLocation } from 'wouter';
import useMobile from '@/hooks/use-mobile';
import { useState } from 'react';
import { 
  BarChart3, 
  Package, 
  Zap, 
  FlaskRound, 
  Settings,
  Download,
  FileText,
  Share2,
  Calendar,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  labelRu: string;
  active?: boolean;
  onClick?: () => void;
  description?: string;
  descriptionRu?: string;
  isReport?: boolean;
  format?: string;
}

interface ReportItemProps {
  icon: React.ReactNode;
  label: string;
  labelRu: string;
  description: string;
  descriptionRu: string;
  format: string;
  onClick: () => void;
}

function NavItem({ icon, label, labelRu, active, onClick }: NavItemProps) {
  const { language } = useSelector((state: RootState) => state);
  const isMobile = useMobile();
  
  return (
    <button 
      type="button"
      className={cn(
        "w-full flex items-center gap-2 py-2 px-3 rounded-md transition text-left",
        isMobile && "flex-col items-center px-1",
        active 
          ? "text-cone-red bg-red-50 border-l-2 border-cone-red" 
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      )}
      onClick={(e) => {
        e.preventDefault();
        console.log(`🔗 Navigation: Clicking ${label}`, onClick ? 'with handler' : 'no handler');
        try {
          if (onClick) {
            onClick();
            console.log(`✅ Navigation: Successfully executed ${label} handler`);
          } else {
            console.error(`❌ Navigation: No handler for ${label}`);
          }
        } catch (error) {
          console.error(`❌ Navigation: Error executing ${label} handler:`, error);
        }
      }}
    >
      {icon}
      <span className={cn(isMobile && "text-xs")}>
        {language === 'en' ? label : labelRu}
      </span>
    </button>
  );
}

function ReportItem({ icon, label, labelRu, description, descriptionRu, format, onClick }: ReportItemProps) {
  const { language } = useSelector((state: RootState) => state);
  const isMobile = useMobile();
  
  if (isMobile) {
    return (
      <button
        onClick={onClick}
        className="flex flex-col items-center px-1 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition"
      >
        {icon}
        <span className="text-xs text-center">{format.toUpperCase()}</span>
      </button>
    );
  }
  
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-2 rounded-md hover:bg-gray-100 transition group"
    >
      <div className="flex items-start gap-2">
        <div className="text-cone-red mt-0.5 group-hover:text-cone-red/80">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {language === 'en' ? label : labelRu}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {language === 'en' ? description : descriptionRu}
          </div>
          <div className="text-xs text-cone-red font-medium mt-1">
            {format.toUpperCase()}
          </div>
        </div>
      </div>
    </button>
  );
}

export default function SideNav() {
  const [location, setLocation] = useLocation();
  const { heat } = useSelector((state: RootState) => state);
  const isMobile = useMobile();
  const [reportsExpanded, setReportsExpanded] = useState(false);
  
  const isActive = (path: string) => {
    return location === path;
  };

  // Report generation functions (moved from OneClickReport)
  const generateReportContent = (reportType: string, data: any) => {
    const timestamp = new Date().toLocaleString('de-DE');
    const heatNumber = data?.heat || 'N/A';
    
    switch (reportType) {
      case 'production-summary':
        return `I-MELT Production Summary Report
Heat: ${heatNumber}
Generated: ${timestamp}

=== HEAT STATUS ===
Grade: ${data?.grade || 'N/A'}
Operator: ${data?.operator || 'N/A'}
Confidence: ${data?.confidence || 'N/A'}%

=== CHEMISTRY (Steel) ===
Carbon: ${data?.chemSteel?.C?.toFixed(3) || 'N/A'}%
Silicon: ${data?.chemSteel?.Si?.toFixed(3) || 'N/A'}%
Manganese: ${data?.chemSteel?.Mn?.toFixed(3) || 'N/A'}%
Phosphorus: ${data?.chemSteel?.P?.toFixed(3) || 'N/A'}%
Sulfur: ${data?.chemSteel?.S?.toFixed(3) || 'N/A'}%

=== ENERGY ===
Power Level: ${data?.confidence || 85}%
Efficiency: 94%

Report generated automatically by I-MELT system.`;

      case 'chemistry-data':
        return `Heat,Carbon,Silicon,Manganese,Phosphorus,Sulfur,Chromium,Nickel,Molybdenum,Aluminum
${heatNumber},${data?.chemSteel?.C || 0},${data?.chemSteel?.Si || 0},${data?.chemSteel?.Mn || 0},${data?.chemSteel?.P || 0},${data?.chemSteel?.S || 0},${data?.chemSteel?.Cr || 0},${data?.chemSteel?.Ni || 0},${data?.chemSteel?.Mo || 0},${data?.chemSteel?.Al || 0}`;

      case 'shift-handover':
        return `I-MELT Shift Handover Report
Heat: ${heatNumber}
Generated: ${timestamp}

=== CRITICAL ALERTS ===
• Carbon content below specification (-30.8% deviation)
• Sulfur level elevated (+45% deviation)

=== RECOMMENDATIONS ===
• Increase carbon addition by 0.42t
• Add desulfurizing agents
• Monitor gas flow rates

=== NEXT ACTIONS ===
• Continue melting process
• Check chemistry in 15 minutes
• Prepare for tapping

Operator: ${data?.operator || 'System'}`;

      default:
        return `I-MELT Complete Heat Report
Heat: ${heatNumber}
Generated: ${timestamp}

=== FULL HEAT DATA ===
${JSON.stringify(data, null, 2)}

End of Report`;
    }
  };

  const downloadReport = (content: string, reportType: string, format: string) => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, '-');
    const filename = `${reportType}-${timestamp}.${format === 'excel' ? 'csv' : 'txt'}`;
    
    const blob = new Blob([content], { 
      type: format === 'excel' ? 'text/csv' : 'text/plain' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    window.URL.revokeObjectURL(url);
    
    console.log(`✅ ${reportType} report downloaded as ${filename}`);
  };

  const generateQuickReport = (reportType: string, format: string) => {
    console.log(`🔄 Generating ${reportType} report...`);
    
    const reportData = generateReportContent(reportType, heat);
    downloadReport(reportData, reportType, format);
  };
  
  return (
    <nav className={cn(
      "border-r border-gray-200 p-4 flex flex-col gap-4 bg-gray-50 overflow-y-auto",
      isMobile ? "w-16 p-2" : "w-52"
    )}>
      {/* Navigation Items */}
      <div className="space-y-1">
        <NavItem 
          icon={<BarChart3 className="h-5 w-5" />} 
          label="Heat Log" 
          labelRu="Журнал плавок"
          active={isActive('/')}
          onClick={() => setLocation('/')}
        />
        <NavItem 
          icon={<Package className="h-5 w-5" />} 
          label="Materials" 
          labelRu="Материалы"
          active={isActive('/materials')}
          onClick={() => setLocation('/materials')}
        />
        <NavItem 
          icon={<Zap className="h-5 w-5" />} 
          label="AI Insight" 
          labelRu="AI анализ"
          active={isActive('/ai')}
          onClick={() => setLocation('/ai')}
        />
        <NavItem 
          icon={<FlaskRound className="h-5 w-5" />} 
          label="Chemistry" 
          labelRu="Химический состав"
          active={isActive('/chemistry')}
          onClick={() => setLocation('/chemistry')}
        />
        <NavItem 
          icon={<Settings className="h-5 w-5" />} 
          label="Settings" 
          labelRu="Настройки"
          active={isActive('/settings')}
          onClick={() => setLocation('/settings')}
        />
      </div>

      {/* Separator */}
      {!isMobile && <div className="border-t border-gray-300 my-2" />}

      {/* Quick Reports Section */}
      <div className="space-y-1">
        <button
          onClick={() => setReportsExpanded(!reportsExpanded)}
          className={cn(
            "w-full flex items-center gap-2 py-2 px-3 rounded-md transition text-left",
            isMobile && "flex-col items-center px-1",
            "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          )}
        >
          <Download className={cn("h-5 w-5", isMobile && "h-4 w-4")} />
          {!isMobile && (
            <>
              <span className="flex-1">Quick Reports</span>
              {reportsExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </>
          )}
          {isMobile && <span className="text-xs">Reports</span>}
        </button>
        
        {reportsExpanded && !isMobile && (
          <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-3">
            <ReportItem
              icon={<FileText className="h-4 w-4" />}
              label="Production Summary"
              labelRu="Сводка производства"
              description="Key metrics and status overview"
              descriptionRu="Ключевые показатели и обзор статуса"
              format="pdf"
              onClick={() => generateQuickReport('production-summary', 'pdf')}
            />
            
            <ReportItem
              icon={<Download className="h-4 w-4" />}
              label="Complete Heat Report"
              labelRu="Полный отчет по плавке"
              description="All data including timeline and materials"
              descriptionRu="Все данные включая хронологию и материалы"
              format="pdf"
              onClick={() => generateQuickReport('full-report', 'pdf')}
            />
            
            <ReportItem
              icon={<Share2 className="h-4 w-4" />}
              label="Chemistry Export"
              labelRu="Экспорт химии"
              description="Steel and slag composition data"
              descriptionRu="Данные состава стали и шлака"
              format="excel"
              onClick={() => generateQuickReport('chemistry-data', 'excel')}
            />
            
            <ReportItem
              icon={<Calendar className="h-4 w-4" />}
              label="Shift Handover"
              labelRu="Передача смены"
              description="Critical information for next operator"
              descriptionRu="Критическая информация для следующего оператора"
              format="pdf"
              onClick={() => generateQuickReport('shift-handover', 'pdf')}
            />
          </div>
        )}
        
        {/* Mobile expanded view */}
        {reportsExpanded && isMobile && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => generateQuickReport('production-summary', 'pdf')}
              className="flex flex-col items-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition"
            >
              <FileText className="h-4 w-4" />
              <span className="text-xs">PDF</span>
            </button>
            <button
              onClick={() => generateQuickReport('full-report', 'pdf')}
              className="flex flex-col items-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition"
            >
              <Download className="h-4 w-4" />
              <span className="text-xs">PDF</span>
            </button>
            <button
              onClick={() => generateQuickReport('chemistry-data', 'excel')}
              className="flex flex-col items-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition"
            >
              <Share2 className="h-4 w-4" />
              <span className="text-xs">XLS</span>
            </button>
            <button
              onClick={() => generateQuickReport('shift-handover', 'pdf')}
              className="flex flex-col items-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition"
            >
              <Calendar className="h-4 w-4" />
              <span className="text-xs">PDF</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
