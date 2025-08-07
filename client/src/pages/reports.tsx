import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import TopBar from '@/components/layout/TopBar';
import SideNav from '@/components/layout/SideNav';
import { FileText, Download, Calendar, TrendingUp, BarChart3, FileSpreadsheet, Settings, Clock, AlertTriangle, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
// import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { useToast } from '@/hooks/use-toast';
import { addDays } from 'date-fns';
import { DateRange } from 'react-day-picker';

export default function ReportsPage() {
  const { language, heat } = useSelector((state: RootState) => state);
  const { toast } = useToast();
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });
  const [selectedFormat, setSelectedFormat] = useState('xlsx');
  const [selectedHeatRange, setSelectedHeatRange] = useState('current');

  const labels = {
    en: {
      title: 'Production Reports',
      subtitle: 'Generate comprehensive reports for steel production analysis and compliance',
      dateRange: 'Date Range',
      format: 'Export Format',
      heatRange: 'Heat Range',
      generating: 'Generating Report...',
      downloadReady: 'Report generated successfully!',
      currentHeat: 'Current Heat Only',
      last10Heats: 'Last 10 Heats',
      last30Days: 'Last 30 Days',
      customRange: 'Custom Range'
    },
    ru: {
      title: 'Производственные отчеты',
      subtitle: 'Создание комплексных отчетов для анализа производства стали и соответствия требованиям',
      dateRange: 'Диапазон дат',
      format: 'Формат экспорта',
      heatRange: 'Диапазон плавок',
      generating: 'Создание отчета...',
      downloadReady: 'Отчет успешно создан!',
      currentHeat: 'Только текущая плавка',
      last10Heats: 'Последние 10 плавок',
      last30Days: 'Последние 30 дней',
      customRange: 'Пользовательский диапазон'
    }
  };

  const lang = language === 'en' ? 'en' : 'ru';

  const reportTypes = [
    {
      id: 'production-summary',
      title: {
        en: 'Production Summary Report',
        ru: 'Сводный отчет производства'
      },
      description: {
        en: 'Comprehensive overview of production metrics, energy consumption, and yield performance',
        ru: 'Комплексный обзор производственных показателей, энергопотребления и выхода продукции'
      },
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'bg-blue-500',
      sections: {
        en: [
          'Heat-by-heat production data',
          'Energy consumption analysis',
          'Material yield calculations',
          'Target vs. actual comparisons',
          'Efficiency metrics and KPIs'
        ],
        ru: [
          'Данные производства по плавкам',
          'Анализ энергопотребления',
          'Расчеты выхода материалов',
          'Сравнение цель/факт',
          'Показатели эффективности и KPI'
        ]
      },
      usage: {
        en: 'Essential for shift managers and production planners to monitor overall facility performance, identify trends, and make data-driven decisions for process optimization.',
        ru: 'Необходим начальникам смен и планировщикам производства для мониторинга общей производительности, выявления тенденций и принятия решений на основе данных.'
      },
      frequency: {
        en: 'Generated daily, weekly, or monthly',
        ru: 'Создается ежедневно, еженедельно или ежемесячно'
      }
    },
    {
      id: 'chemistry-analysis',
      title: {
        en: 'Chemistry Analysis Report',
        ru: 'Отчет химического анализа'
      },
      description: {
        en: 'Detailed chemical composition tracking, grade compliance, and quality control metrics',
        ru: 'Детальное отслеживание химического состава, соответствие маркам и метрики контроля качества'
      },
      icon: <Target className="w-6 h-6" />,
      color: 'bg-purple-500',
      sections: {
        en: [
          'Steel chemistry by heat and stage',
          'Slag composition analysis',
          'Grade specification compliance',
          'Additive consumption tracking',
          'Quality control deviations'
        ],
        ru: [
          'Химия стали по плавкам и стадиям',
          'Анализ состава шлака',
          'Соответствие спецификациям марок',
          'Отслеживание расхода присадок',
          'Отклонения контроля качества'
        ]
      },
      usage: {
        en: 'Critical for metallurgists and quality engineers to ensure product specifications are met, analyze chemical trends, and optimize alloy additions for consistent steel grades.',
        ru: 'Критически важен для металлургов и инженеров по качеству для обеспечения соответствия спецификациям продукции, анализа химических тенденций и оптимизации легирующих добавок.'
      },
      frequency: {
        en: 'Generated per heat or batch analysis',
        ru: 'Создается по плавкам или анализу партий'
      }
    },
    {
      id: 'energy-efficiency',
      title: {
        en: 'Energy Efficiency Report',
        ru: 'Отчет энергоэффективности'
      },
      description: {
        en: 'Power consumption patterns, electrode usage, and energy optimization opportunities',
        ru: 'Схемы энергопотребления, использование электродов и возможности энергооптимизации'
      },
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-green-500',
      sections: {
        en: [
          'Power consumption by stage',
          'Electrode consumption tracking',
          'Energy efficiency ratios',
          'Peak demand analysis',
          'Cost optimization recommendations'
        ],
        ru: [
          'Энергопотребление по стадиям',
          'Отслеживание расхода электродов',
          'Коэффициенты энергоэффективности',
          'Анализ пикового спроса',
          'Рекомендации по оптимизации затрат'
        ]
      },
      usage: {
        en: 'Used by energy managers and plant engineers to identify energy waste, optimize power profiles, and reduce operational costs while maintaining production quality.',
        ru: 'Используется энергоменеджерами и инженерами завода для выявления энергопотерь, оптимизации профилей мощности и снижения эксплуатационных расходов.'
      },
      frequency: {
        en: 'Generated weekly or monthly',
        ru: 'Создается еженедельно или ежемесячно'
      }
    },
    {
      id: 'compliance-audit',
      title: {
        en: 'Compliance & Audit Report',
        ru: 'Отчет соответствия и аудита'
      },
      description: {
        en: 'Regulatory compliance tracking, audit trails, and environmental impact documentation',
        ru: 'Отслеживание нормативного соответствия, аудиторские следы и документация воздействия на окружающую среду'
      },
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-orange-500',
      sections: {
        en: [
          'Regulatory compliance status',
          'Environmental emissions tracking',
          'Safety incident documentation',
          'Process deviation records',
          'Audit trail and timestamps'
        ],
        ru: [
          'Статус нормативного соответствия',
          'Отслеживание выбросов в окружающую среду',
          'Документация инцидентов безопасности',
          'Записи отклонений процесса',
          'Аудиторский след и временные метки'
        ]
      },
      usage: {
        en: 'Essential for compliance officers and auditors to demonstrate regulatory adherence, track environmental performance, and maintain comprehensive documentation for inspections.',
        ru: 'Необходим офицерам по соответствию и аудиторам для демонстрации соблюдения требований, отслеживания экологических показателей и ведения документации для проверок.'
      },
      frequency: {
        en: 'Generated monthly or quarterly',
        ru: 'Создается ежемесячно или ежеквартально'
      }
    }
  ];

  const handleGenerateReport = (reportId: string) => {
    toast({
      title: labels[lang].generating,
      description: `Preparing ${reportTypes.find(r => r.id === reportId)?.title[lang]} for download...`,
      variant: "default"
    });

    // Simulate report generation
    setTimeout(() => {
      toast({
        title: labels[lang].downloadReady,
        description: `Your ${reportTypes.find(r => r.id === reportId)?.title[lang]} is ready to download.`,
        variant: "default"
      });
    }, 2000);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopBar />
      
      <div className="flex flex-1 overflow-hidden">
        <SideNav />
        
        <main className="flex-1 overflow-y-auto p-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-cone-red" />
                  {labels[lang].title}
                </h1>
                <p className="text-gray-700 mt-1">{labels[lang].subtitle}</p>
              </div>
              
              {heat && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  Current Heat: #{heat.heat}
                </Badge>
              )}
            </div>

            {/* Report Configuration */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Report Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-800 font-medium">{labels[lang].heatRange}</Label>
                    <Select value={selectedHeatRange} onValueChange={setSelectedHeatRange}>
                      <SelectTrigger className="bg-white border-gray-300 text-gray-800">
                        <SelectValue placeholder="Select heat range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current">{labels[lang].currentHeat}</SelectItem>
                        <SelectItem value="last10">{labels[lang].last10Heats}</SelectItem>
                        <SelectItem value="last30days">{labels[lang].last30Days}</SelectItem>
                        <SelectItem value="custom">{labels[lang].customRange}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-800 font-medium">{labels[lang].format}</Label>
                    <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                      <SelectTrigger className="bg-white border-gray-300 text-gray-800">
                        <SelectValue placeholder="Select export format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                        <SelectItem value="pdf">PDF Report (.pdf)</SelectItem>
                        <SelectItem value="csv">CSV Data (.csv)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedHeatRange === 'custom' && (
                    <div className="space-y-2">
                      <Label className="text-gray-800 font-medium">{labels[lang].dateRange}</Label>
                      <div className="text-sm text-gray-600 p-2 border rounded">
                        Date range picker (custom component integration needed)
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Report Types */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {reportTypes.map((report) => (
                <Card key={report.id} className="relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1 h-full ${report.color}`} />
                  
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg text-white ${report.color}`}>
                        {report.icon}
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          {report.title[lang]}
                        </div>
                        <div className="text-sm text-gray-600 font-normal">
                          {report.description[lang]}
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* What's Included */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        What's Included:
                      </h4>
                      <ul className="space-y-1">
                        {report.sections[lang].map((section, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                            {section}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Why It's Needed */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Why It's Needed & How to Use:
                      </h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {report.usage[lang]}
                      </p>
                    </div>

                    {/* Frequency */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        {report.frequency[lang]}
                      </div>
                      
                      <Button
                        onClick={() => handleGenerateReport(report.id)}
                        className="bg-cone-red hover:bg-cone-red/90 text-white"
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Generate Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5" />
                  Recent Report Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">247</div>
                    <div className="text-sm text-gray-700">Reports Generated This Month</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">12</div>
                    <div className="text-sm text-gray-700">Automated Reports</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">98.5%</div>
                    <div className="text-sm text-gray-700">Data Accuracy</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">1.2s</div>
                    <div className="text-sm text-gray-700">Avg Generation Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}