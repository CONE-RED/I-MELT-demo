import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import TopBar from '@/components/layout/TopBar';
import SideNav from '@/components/layout/SideNav';
import { Zap, Brain, TrendingUp, AlertTriangle, CheckCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import useMobile from '@/hooks/use-mobile';

export default function AIInsight() {
  const { language, heat } = useSelector((state: RootState) => state);
  const isMobile = useMobile();
  
  const labels = {
    en: {
      title: 'AI Insights & Analytics',
      performance: 'Model Performance',
      insights: 'Current Insights',
      predictions: 'Predictions',
      recommendations: 'Recommendations',
      confidence: 'Confidence',
      accuracy: 'Accuracy',
      processing: 'Processing',
      acknowledge: 'Acknowledge',
      apply: 'Apply'
    },
    ru: {
      title: 'AI аналитика и прогнозы',
      performance: 'Производительность модели',
      insights: 'Текущие инсайты',
      predictions: 'Прогнозы',
      recommendations: 'Рекомендации',
      confidence: 'Достоверность',
      accuracy: 'Точность',
      processing: 'Обработка',
      acknowledge: 'Подтвердить',
      apply: 'Применить'
    }
  };
  
  const lang = language === 'en' ? 'en' : 'ru';
  
  const aiInsights = heat?.insights || [
    {
      id: 'carbon-optimization',
      type: 'recommendation',
      title: 'Carbon Content Optimization',
      titleRu: 'Оптимизация содержания углерода',
      description: 'Add 0.42t carbon to reach target composition for grade 13KhFA/9',
      descriptionRu: 'Добавить 0,42т углерода для достижения целевого состава марки 13KhFA/9',
      confidence: 94,
      priority: 'high',
      category: 'chemistry'
    },
    {
      id: 'energy-efficiency',
      type: 'optimization',
      title: 'Energy Profile Adjustment',
      titleRu: 'Настройка энергетического профиля',
      description: 'Switch to profile 4 to reduce energy consumption by 8.7%',
      descriptionRu: 'Переключиться на профиль 4 для снижения энергопотребления на 8,7%',
      confidence: 89,
      priority: 'medium',
      category: 'energy'
    },
    {
      id: 'temperature-warning',
      type: 'alert',
      title: 'Temperature Deviation',
      titleRu: 'Отклонение температуры',
      description: 'Furnace temperature 45°C above target. Consider adjusting power settings.',
      descriptionRu: 'Температура печи на 45°C выше целевой. Рассмотрите настройку мощности.',
      confidence: 96,
      priority: 'critical',
      category: 'process'
    }
  ];
  
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="w-5 h-5" />;
      case 'recommendation': return <TrendingUp className="w-5 h-5" />;
      case 'optimization': return <Zap className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };
  
  const getCategoryBadge = (category: string) => {
    const colors = {
      chemistry: 'bg-purple-100 text-purple-800',
      energy: 'bg-green-100 text-green-800',
      process: 'bg-blue-100 text-blue-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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
                <Brain className="w-6 h-6 text-cone-red" />
                {labels[lang].title}
              </h1>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  AI Model: Active
                </Badge>
                <Button
                  onClick={() => alert('AI model refresh functionality')}
                  variant="outline"
                  size="sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Refresh Model
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              {/* Model Performance */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4" />
                    {labels[lang].performance}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{labels[lang].confidence}</span>
                      <span>{heat?.confidence || 94}%</span>
                    </div>
                    <Progress value={heat?.confidence || 94} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{labels[lang].accuracy}</span>
                      <span>97%</span>
                    </div>
                    <Progress value={97} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{labels[lang].processing}</span>
                      <span>12ms</span>
                    </div>
                    <div className="text-xs text-gray-500">Avg response time</div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Current Insights */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    {labels[lang].insights}
                    {heat && <span className="text-sm font-normal text-gray-500">- Heat #{heat.heat}</span>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {aiInsights.map((insight, index) => (
                      <div key={insight.id || index} className="flex items-start gap-4 p-4 border rounded-lg bg-gray-50">
                        <div className={`p-2 rounded-lg text-white ${getPriorityColor(insight.priority)}`}>
                          {getInsightIcon(insight.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">
                              {lang === 'en' ? insight.title : insight.titleRu}
                            </span>
                            <Badge 
                              variant="secondary" 
                              className={getCategoryBadge(insight.category)}
                            >
                              {insight.category}
                            </Badge>
                            <Badge variant="outline">
                              {insight.confidence}% confidence
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {lang === 'en' ? insight.description : insight.descriptionRu}
                          </p>
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => alert(`Acknowledged: ${insight.title}`)}
                              variant="outline"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              {labels[lang].acknowledge}
                            </Button>
                            
                            {insight.type === 'recommendation' && (
                              <Button
                                size="sm"
                                onClick={() => alert(`Applied: ${insight.title}`)}
                                className="bg-cone-red hover:bg-cone-red/90"
                              >
                                <TrendingUp className="w-4 h-4 mr-1" />
                                {labels[lang].apply}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Predictions Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  {labels[lang].predictions}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="font-medium text-gray-900">Next Stage Transition</div>
                    <div className="text-sm text-gray-600 mt-1">Predicted in 8.5 minutes</div>
                    <div className="text-xs text-blue-600 mt-2">89% confidence</div>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="font-medium text-gray-900">Energy Optimization</div>
                    <div className="text-sm text-gray-600 mt-1">Potential 12% reduction</div>
                    <div className="text-xs text-green-600 mt-2">94% confidence</div>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="font-medium text-gray-900">Final Chemistry</div>
                    <div className="text-sm text-gray-600 mt-1">Target composition achievable</div>
                    <div className="text-xs text-purple-600 mt-2">97% confidence</div>
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