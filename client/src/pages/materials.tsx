import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import TopBar from '@/components/layout/TopBar';
import SideNav from '@/components/layout/SideNav';
import { Package, Plus, Truck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import useMobile from '@/hooks/use-mobile';

export default function Materials() {
  const { language, heat } = useSelector((state: RootState) => state);
  const isMobile = useMobile();
  
  const labels = {
    en: {
      title: 'Materials Management',
      inventory: 'Current Inventory',
      buckets: 'Charge Buckets',
      additives: 'Additives',
      requests: 'Material Requests',
      addMaterial: 'Add Material',
      level: 'Level',
      requested: 'Requested',
      inTransit: 'In Transit',
      available: 'Available'
    },
    ru: {
      title: 'Управление материалами',
      inventory: 'Текущий запас',
      buckets: 'Корзины загрузки',
      additives: 'Добавки',
      requests: 'Запросы материалов',
      addMaterial: 'Добавить материал',
      level: 'Уровень',
      requested: 'Запрошено',
      inTransit: 'В пути',
      available: 'Доступно'
    }
  };
  
  const lang = language === 'en' ? 'en' : 'ru';
  
  // Mock materials data based on heat data
  const materials = [
    {
      name: 'Steel Scrap',
      nameRu: 'Стальной лом',
      current: 45.2,
      target: 50.0,
      unit: 't',
      status: 'low',
      location: 'Yard A-3'
    },
    {
      name: 'Pig Iron',
      nameRu: 'Чугун',
      current: 12.8,
      target: 15.0,
      unit: 't',
      status: 'normal',
      location: 'Bay 2'
    },
    {
      name: 'Limestone',
      nameRu: 'Известняк',
      current: 8.4,
      target: 10.0,
      unit: 't',
      status: 'normal',
      location: 'Silo B'
    },
    {
      name: 'Ferro Chrome',
      nameRu: 'Феррохром',
      current: 2.1,
      target: 5.0,
      unit: 't',
      status: 'critical',
      location: 'Storage C-1'
    }
  ];
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'low': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-green-600 bg-green-50';
    }
  };
  
  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage < 50) return 'bg-red-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-green-500';
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
                <Package className="w-6 h-6 text-cone-red" />
                {labels[lang].title}
              </h1>
              
              <Button
                onClick={() => alert('Add Material functionality - would open material entry form')}
                className="bg-cone-red hover:bg-cone-red/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                {labels[lang].addMaterial}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Current Inventory */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    {labels[lang].inventory}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {materials.map((material, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">
                              {lang === 'en' ? material.name : material.nameRu}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(material.status)}`}>
                              {material.current?.toFixed(1) || '0.0'}{material.unit} / {material.target?.toFixed(1) || '0.0'}{material.unit}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <Progress
                                value={(material.current / material.target) * 100}
                                className="h-2"
                              />
                            </div>
                            <span className="text-sm text-gray-500">{material.location}</span>
                          </div>
                        </div>
                        {material.status === 'critical' && (
                          <AlertTriangle className="w-5 h-5 text-red-500 ml-3" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Material Requests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    {labels[lang].requests}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="font-medium text-gray-900">Ferro Chrome</div>
                      <div className="text-sm text-gray-600">2.9t {labels[lang].requested}</div>
                      <div className="text-xs text-yellow-600 mt-1">ETA: 45 min</div>
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="font-medium text-gray-900">Steel Scrap</div>
                      <div className="text-sm text-gray-600">8.5t {labels[lang].inTransit}</div>
                      <div className="text-xs text-blue-600 mt-1">ETA: 15 min</div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => alert('Material request functionality - would open request form')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Request Material
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Charge Buckets from Heat Data */}
            {heat?.buckets && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    {labels[lang].buckets} - Heat #{heat.heat}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {heat.buckets.map((bucket: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg bg-gray-50">
                        <div className="text-center">
                          <div className="font-bold text-lg text-gray-900">#{bucket.bucket}</div>
                          <div className="text-sm text-gray-600 mt-1">{bucket.material}</div>
                          <div className="text-lg font-medium text-cone-red mt-2">
                            {bucket.weight.toFixed(1)}t
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {bucket.composition}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}