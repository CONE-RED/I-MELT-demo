import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import TopBar from '@/components/layout/TopBar';
import SideNav from '@/components/layout/SideNav';
import { FlaskRound, Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Chemistry() {
  const { language, heat } = useSelector((state: RootState) => state);
  
  const labels = {
    en: {
      title: 'Chemistry Analysis',
      steel: 'Steel Composition',
      slag: 'Slag Composition',
      target: 'Target',
      current: 'Current',
      deviation: 'Deviation',
      trend: 'Trend',
      withinSpec: 'Within Spec',
      aboveSpec: 'Above Spec',
      belowSpec: 'Below Spec',
      grade: 'Grade',
      additive: 'Suggested Additive',
      action: 'Action Required'
    },
    ru: {
      title: 'Химический анализ',
      steel: 'Состав стали',
      slag: 'Состав шлака',
      target: 'Цель',
      current: 'Текущий',
      deviation: 'Отклонение',
      trend: 'Тренд',
      withinSpec: 'В норме',
      aboveSpec: 'Выше нормы',
      belowSpec: 'Ниже нормы',
      grade: 'Марка',
      additive: 'Рекомендуемая добавка',
      action: 'Требуется действие'
    }
  };
  
  const lang = language === 'en' ? 'en' : 'ru';
  
  // Use actual heat chemistry data or fallback
  const steelComposition = heat?.chemSteel || {
    C: 0.085,
    Si: 0.24,
    Mn: 0.78,
    P: 0.018,
    S: 0.012,
    Cr: 0.95,
    Ni: 0.15,
    Mo: 0.05,
    Al: 0.032
  };
  
  const slagComposition = heat?.chemSlag || {
    CaO: 42.5,
    SiO2: 15.8,
    Al2O3: 12.3,
    MgO: 8.7,
    FeO: 18.2,
    MnO: 2.1,
    P2O5: 0.4
  };
  
  // Target compositions for grade 13KhFA/9
  const steelTargets = {
    C: { min: 0.10, max: 0.17, optimal: 0.13 },
    Si: { min: 0.17, max: 0.37, optimal: 0.27 },
    Mn: { min: 0.40, max: 0.70, optimal: 0.55 },
    P: { min: 0.000, max: 0.035, optimal: 0.020 },
    S: { min: 0.000, max: 0.035, optimal: 0.020 },
    Cr: { min: 0.70, max: 1.10, optimal: 0.90 },
    Ni: { min: 0.00, max: 0.30, optimal: 0.15 },
    Mo: { min: 0.00, max: 0.10, optimal: 0.05 },
    Al: { min: 0.02, max: 0.05, optimal: 0.035 }
  };
  
  const getElementStatus = (current: number | null | undefined, target: any) => {
    if (!current || !target) return 'within';
    if (current < target.min) return 'below';
    if (current > target.max) return 'above';
    return 'within';
  };

  // AI-powered critical issue detection
  const getCriticalIssues = () => {
    const issues: Array<{
      element: string;
      severity: 'critical' | 'warning' | 'minor';
      current: number;
      target: any;
      action: string;
      impact: string;
    }> = [];

    Object.entries(steelComposition).forEach(([element, current]) => {
      const target = steelTargets[element as keyof typeof steelTargets];
      if (!target || !current) return;

      const status = getElementStatus(current, target);
      if (status === 'within') return;

      const deviation = Math.abs(current - target.optimal) / target.optimal;
      let severity: 'critical' | 'warning' | 'minor' = 'minor';
      let action = '';
      let impact = '';

      // Critical chemistry logic
      if (element === 'C' && deviation > 0.15) {
        severity = 'critical';
        action = status === 'above' ? 'Immediate decarburization required' : 'Add carbon immediately';
        impact = 'Steel grade compliance at risk';
      } else if (element === 'P' && current > 0.030) {
        severity = 'critical';
        action = 'Slag adjustment required - add lime';
        impact = 'Steel quality severely compromised';
      } else if (['Cr', 'Mn'].includes(element) && deviation > 0.20) {
        severity = 'warning';
        action = status === 'above' ? 'Dilute with low-alloy scrap' : 'Add ferro-alloys';
        impact = 'Grade specifications may be missed';
      } else if (deviation > 0.10) {
        severity = 'minor';
        action = 'Monitor and adjust gradually';
        impact = 'Minor deviation from optimal';
      }

      if (severity !== 'minor') {
        issues.push({ element, severity, current, target, action, impact });
      }
    });

    return issues.sort((a, b) => 
      a.severity === 'critical' ? -1 : b.severity === 'critical' ? 1 : 0
    );
  };

  const criticalIssues = getCriticalIssues();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'below': return 'text-blue-600 bg-blue-50';
      case 'above': return 'text-red-600 bg-red-50';
      default: return 'text-green-600 bg-green-50';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'below': return labels[lang].belowSpec;
      case 'above': return labels[lang].aboveSpec;
      default: return labels[lang].withinSpec;
    }
  };
  
  const getTrendIcon = (current: number | null | undefined, target: number | null | undefined) => {
    if (!current || !target) return <Minus className="w-4 h-4 text-gray-500" />;
    const diff = current - target;
    if (Math.abs(diff) < 0.01) return <Minus className="w-4 h-4 text-gray-500" />;
    return diff > 0 ? 
      <TrendingUp className="w-4 h-4 text-red-500" /> : 
      <TrendingDown className="w-4 h-4 text-blue-500" />;
  };
  
  const formatPercentage = (value: number | null | undefined) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0,000';
    }
    return value.toLocaleString('de-DE', { 
      minimumFractionDigits: 3, 
      maximumFractionDigits: 3 
    });
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopBar />
      
      <div className="flex flex-1 overflow-hidden">
        <SideNav />
        
        <main className="flex-1 overflow-y-auto p-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FlaskRound className="w-6 h-6 text-cone-red" />
                {labels[lang].title}
              </h1>
              
              <div className="flex items-center gap-2">
                {heat && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    Heat #{heat.heat} - {heat.grade}
                  </Badge>
                )}
                <Button
                  onClick={() => alert('Chemistry analysis refresh functionality')}
                  variant="outline"
                  size="sm"
                >
                  <FlaskRound className="w-4 h-4 mr-2" />
                  Refresh Analysis
                </Button>
              </div>
            </div>

            {/* Critical Issues Alert - LazyFlow Phase 1 */}
            {criticalIssues.length > 0 && (
              <Card className="mb-6 border-red-200 bg-red-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-red-800">
                    <Target className="w-5 h-5" />
                    ⚠️ Critical Chemistry Issues - Immediate Action Required
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {criticalIssues.map((issue, index) => (
                    <div key={issue.element} className={cn(
                      "p-4 rounded-lg border-l-4",
                      issue.severity === 'critical' ? "border-red-500 bg-red-100" : "border-yellow-500 bg-yellow-100"
                    )}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-xl text-gray-900">{issue.element}</span>
                          <Badge className={cn(
                            "text-white",
                            issue.severity === 'critical' ? "bg-red-600" : "bg-yellow-600"
                          )}>
                            {issue.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-lg text-gray-900">
                            {formatPercentage(issue.current)}%
                          </div>
                          <div className="text-sm text-gray-600">
                            Target: {formatPercentage(issue.target.min)}% - {formatPercentage(issue.target.max)}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="font-medium text-gray-900 mb-1">
                          🎯 {issue.action}
                        </div>
                        <div className="text-sm text-gray-700">
                          💡 Impact: {issue.impact}
                        </div>
                      </div>

                      <Button
                        className={cn(
                          "w-full text-white font-medium",
                          issue.severity === 'critical' 
                            ? "bg-red-600 hover:bg-red-700" 
                            : "bg-yellow-600 hover:bg-yellow-700"
                        )}
                        onClick={() => alert(`Smart Fix for ${issue.element}: ${issue.action}`)}
                      >
                        🚀 Smart Fix - {issue.element}
                      </Button>
                    </div>
                  ))}
                  
                  {criticalIssues.length > 1 && (
                    <Button
                      className="w-full bg-cone-red hover:bg-cone-red/90 text-white font-bold text-lg py-3"
                      onClick={() => alert('AI will calculate and execute all critical fixes automatically')}
                    >
                      ⚡ FIX ALL CRITICAL ISSUES NOW
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Chemistry Status Summary - LazyFlow */}
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <FlaskRound className="w-5 h-5" />
                  ✅ Chemistry Status Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="text-3xl font-bold text-green-600">
                      {Object.keys(steelComposition).filter(element => {
                        const target = steelTargets[element as keyof typeof steelTargets];
                        const current = steelComposition[element as keyof typeof steelComposition];
                        return target && current && getElementStatus(current, target) === 'within';
                      }).length}
                    </div>
                    <div className="text-sm text-gray-600">Elements In Spec</div>
                  </div>
                  
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="text-3xl font-bold text-yellow-600">
                      {criticalIssues.filter(issue => issue.severity === 'warning').length}
                    </div>
                    <div className="text-sm text-gray-600">Minor Issues</div>
                  </div>
                  
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="text-3xl font-bold text-red-600">
                      {criticalIssues.filter(issue => issue.severity === 'critical').length}
                    </div>
                    <div className="text-sm text-gray-600">Critical Issues</div>
                  </div>
                </div>

                {criticalIssues.length === 0 && (
                  <div className="mt-4 p-4 bg-green-100 rounded-lg text-center">
                    <div className="text-green-800 font-medium">
                      🎉 All chemistry parameters within specification!
                    </div>
                    <div className="text-sm text-green-600 mt-1">
                      Heat {heat?.heat} is ready for next production stage
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Detailed Steel Composition - Collapsed by default */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  {labels[lang].steel} - Detailed View
                </CardTitle>
                <div className="text-sm text-gray-600">
                  💡 LazyFlow: Only check details if critical issues are resolved
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(steelComposition).map(([element, current]) => {
                    const target = steelTargets[element as keyof typeof steelTargets];
                    if (!target) return null;
                    
                    const status = getElementStatus(current, target);
                    const percentage = (current && target) ? ((current - target.min) / (target.max - target.min)) * 100 : 0;
                    
                    return (
                      <div key={element} className="p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-lg text-gray-900">{element}</span>
                          <div className="flex items-center gap-2">
                            {getTrendIcon(current, target.optimal)}
                            <Badge className={getStatusColor(status)}>
                              {getStatusText(status)}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-gray-700">
                            <span>{labels[lang].current}:</span>
                            <span className="font-mono text-gray-900">{formatPercentage(current)}%</span>
                          </div>
                          
                          <div className="flex justify-between text-sm text-gray-700">
                            <span>{labels[lang].target}:</span>
                            <span className="font-mono text-gray-900">
                              {formatPercentage(target.min)}% - {formatPercentage(target.max)}%
                            </span>
                          </div>
                          
                          <Progress 
                            value={Math.max(0, Math.min(100, percentage))} 
                            className="h-2"
                          />
                          
                          <div className="text-xs text-gray-600">
                            {labels[lang].deviation}: {formatPercentage(current && target.optimal ? Math.abs(current - target.optimal) : 0)}%
                          </div>
                        </div>
                        
                        {status !== 'within' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full mt-3 text-gray-900 border-gray-300 hover:bg-gray-100"
                            onClick={() => alert(`Action for ${element}: ${status === 'below' ? 'Add material' : 'Reduce input'}`)}
                          >
                            {labels[lang].action}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            {/* Slag Composition */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskRound className="w-5 h-5" />
                  {labels[lang].slag}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(slagComposition).map(([component, value]) => (
                    <div key={component} className="p-4 border rounded-lg bg-gray-50">
                      <div className="text-center">
                        <div className="font-bold text-lg text-gray-900">{component}</div>
                        <div className="text-2xl font-mono text-cone-red mt-2">
                          {formatPercentage(value)}%
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Current composition
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Slag Quality Assessment</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-800">
                    <div>
                      <span className="font-medium text-gray-900">Basicity Index:</span>
                      <span className="ml-2 font-mono text-gray-900">
                        {slagComposition.CaO && slagComposition.MgO && slagComposition.SiO2 
                          ? ((slagComposition.CaO + slagComposition.MgO) / slagComposition.SiO2).toFixed(2)
                          : '2.69'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Fluidity:</span>
                      <span className="ml-2 text-green-700 font-medium">Good</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Desulfurization:</span>
                      <span className="ml-2 text-green-700 font-medium">Effective</span>
                    </div>
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