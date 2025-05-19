import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { Additive } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdditivesLedgerProps {
  additives: Additive[];
}

export default function AdditivesLedger({ additives }: AdditivesLedgerProps) {
  const { language } = useSelector((state: RootState) => state);
  
  const labels = {
    en: {
      title: "Furnace Additives",
      bucket: "Bucket",
      stage: "Stage",
      additive: "Additive",
      weight: "Weight (kg)",
      energy: "Energy (kWh)",
      add: "Add Additive",
      total: "Total Energy:"
    },
    ru: {
      title: "Добавки в печь",
      bucket: "Бадья",
      stage: "Этап",
      additive: "Добавка",
      weight: "Вес (кг)",
      energy: "Энергия (кВт⋅ч)",
      add: "Добавить материал",
      total: "Общая энергия:"
    }
  };
  
  const lang = language === 'en' ? 'en' : 'ru';
  
  // Calculate total energy
  const totalEnergy = additives.reduce((sum, additive) => sum + additive.energy, 0);
  
  // Format number with language-specific separators
  const formatNumber = (num: number) => {
    return num.toLocaleString(lang === 'en' ? 'en-US' : 'ru-RU', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    });
  };
  
  return (
    <div className="dashboard-card h-full overflow-hidden">
      <h2 className="text-lg font-semibold triangle mb-3">
        {labels[lang].title}
      </h2>
      
      <div className="overflow-auto max-h-[280px]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-cone-black z-10">
            <tr className="text-cone-gray border-b border-cone-gray/20">
              <th className="text-left py-2 font-medium px-3">{labels[lang].bucket}</th>
              <th className="text-left py-2 font-medium px-3">{labels[lang].stage}</th>
              <th className="text-left py-2 font-medium px-3">{labels[lang].additive}</th>
              <th className="text-right py-2 font-medium px-3">{labels[lang].weight}</th>
              <th className="text-right py-2 font-medium px-3">{labels[lang].energy}</th>
            </tr>
          </thead>
          <tbody>
            {additives.map((additive, index) => {
              // Calculate intensity for energy column background
              const maxEnergy = Math.max(...additives.map(a => a.energy));
              const intensity = (additive.energy / maxEnergy) * 0.8;
              
              return (
                <tr 
                  key={index} 
                  className="border-b border-cone-gray/10 hover:bg-cone-gray/10"
                >
                  <td className="py-2 px-3">{additive.bucket}</td>
                  <td className="py-2 px-3">{additive.stage}</td>
                  <td className="py-2 px-3">{additive.name}</td>
                  <td className="py-2 px-3 text-right">
                    {additive.weight.toLocaleString(lang === 'en' ? 'en-US' : 'ru-RU')}
                  </td>
                  <td 
                    className="py-2 px-3 text-right"
                    style={{ 
                      background: `linear-gradient(to right, rgba(227, 6, 19, ${intensity * 0.2}) 0%, rgba(227, 6, 19, ${intensity}) 100%)` 
                    }}
                  >
                    {formatNumber(additive.energy)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-between items-center mt-3">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs bg-cone-gray/20 hover:bg-cone-gray/30 border-cone-gray/30"
        >
          <Plus className="h-4 w-4 mr-1" />
          {labels[lang].add}
        </Button>
        
        <div className="text-xs text-cone-gray">
          {labels[lang].total} <span className="text-cone-white font-medium">{formatNumber(totalEnergy)} kWh</span>
        </div>
      </div>
    </div>
  );
}
