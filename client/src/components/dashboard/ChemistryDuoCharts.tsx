import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface ChemistryDuoChartsProps {
  chemSteel: Record<string, number>;
  chemSlag: Record<string, number>;
}

export default function ChemistryDuoCharts({ chemSteel, chemSlag }: ChemistryDuoChartsProps) {
  const dispatch = useDispatch();
  const { language, chemViewMode, chemActiveView } = useSelector((state: RootState) => state);
  
  const labels = {
    en: {
      title: "Chemistry Analysis",
      absolute: "Absolute",
      delta: "Delta",
      steel: "Steel",
      slag: "Slag",
      targetRange: "Target Range",
      actualValues: "Actual Values"
    },
    ru: {
      title: "Химический анализ",
      absolute: "Абсолютный",
      delta: "Дельта",
      steel: "Сталь",
      slag: "Шлак",
      targetRange: "Целевой диапазон",
      actualValues: "Фактические значения"
    }
  };
  
  const lang = language === 'en' ? 'en' : 'ru';
  
  // Target ranges (would come from server in real app)
  const targetRanges = {
    steel: {
      C: [0.080, 0.100],
      Mn: [0.130, 0.150],
      Si: [0.000, 0.010],
      P: [0.003, 0.005],
      S: [0.025, 0.030],
      Cr: [0.090, 0.110],
      Cu: [0.180, 0.200],
      Ni: [0.110, 0.130],
      Mo: [0.025, 0.030]
    },
    slag: {
      CaO: [0.085, 0.095],
      SiO2: [0.135, 0.145],
      P2O5: [0.000, 0.010],
      Cr2O3: [0.003, 0.005],
      FeO: [0.025, 0.030],
      MnO: [0.095, 0.105],
      MgO: [0.185, 0.195],
      Al2O3: [0.115, 0.125],
      S: [0.000, 0.001]
    }
  };
  
  // Prepare radar chart data for steel
  const steelElements = Object.keys(chemSteel).slice(0, 9);
  const steelData = steelElements.map(element => ({
    element,
    value: chemSteel[element],
    targetLow: targetRanges.steel[element as keyof typeof targetRanges.steel]?.[0] || 0,
    targetHigh: targetRanges.steel[element as keyof typeof targetRanges.steel]?.[1] || 0
  }));
  
  // Prepare radar chart data for slag
  const slagElements = Object.keys(chemSlag).slice(0, 9);
  const slagData = slagElements.map(element => ({
    element,
    value: chemSlag[element],
    targetLow: targetRanges.slag[element as keyof typeof targetRanges.slag]?.[0] || 0,
    targetHigh: targetRanges.slag[element as keyof typeof targetRanges.slag]?.[1] || 0
  }));
  
  // Determine which data to display
  const chartData = chemActiveView === 'steel' ? steelData : slagData;
  const displayElements = chemActiveView === 'steel' ? steelElements : slagElements;
  
  return (
    <div className="dashboard-card h-full overflow-hidden">
      <h2 className="text-lg font-semibold triangle mb-3">
        {labels[lang].title}
      </h2>
      
      <div className="flex justify-between mb-2">
        <div className="flex">
          <Button
            variant={chemViewMode === 'absolute' ? 'default' : 'outline'}
            size="sm"
            className="rounded-r-none px-3 py-1 h-7 text-xs"
            onClick={() => dispatch({ type: 'SET_CHEM_VIEW_MODE', payload: 'absolute' })}
          >
            {labels[lang].absolute}
          </Button>
          <Button
            variant={chemViewMode === 'delta' ? 'default' : 'outline'}
            size="sm"
            className="rounded-l-none px-3 py-1 h-7 text-xs"
            onClick={() => dispatch({ type: 'SET_CHEM_VIEW_MODE', payload: 'delta' })}
          >
            {labels[lang].delta}
          </Button>
        </div>
        
        <div className="flex text-xs">
          <Button
            variant={chemActiveView === 'steel' ? 'default' : 'outline'}
            size="sm"
            className="rounded-r-none px-2 py-1 h-7"
            onClick={() => dispatch({ type: 'SET_CHEM_ACTIVE_VIEW', payload: 'steel' })}
          >
            {labels[lang].steel}
          </Button>
          <Button
            variant={chemActiveView === 'slag' ? 'default' : 'outline'}
            size="sm"
            className="rounded-l-none px-2 py-1 h-7"
            onClick={() => dispatch({ type: 'SET_CHEM_ACTIVE_VIEW', payload: 'slag' })}
          >
            {labels[lang].slag}
          </Button>
        </div>
      </div>
      
      {/* Chemistry Radar Chart */}
      <div className="h-48 mt-4 mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart outerRadius={80} data={chartData}>
            <PolarGrid stroke="#444" />
            <PolarAngleAxis 
              dataKey="element" 
              tick={{ fill: '#7A7A7A', fontSize: 9 }} 
            />
            <Radar
              name={labels[lang].targetRange}
              dataKey="targetHigh"
              stroke="#FF5740"
              fill="rgba(255, 87, 64, 0.1)"
              strokeDasharray="4 4"
              isAnimationActive={false}
            />
            <Radar
              name={labels[lang].actualValues}
              dataKey="value"
              stroke="#E30613"
              fill="rgba(227, 6, 19, 0.3)"
              isAnimationActive={true}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#222', 
                border: '1px solid #444',
                borderRadius: '5px'
              }} 
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-3 gap-1 text-xs mt-1">
        {displayElements.map(element => {
          const value = chemActiveView === 'steel' 
            ? chemSteel[element] 
            : chemSlag[element];
            
          return (
            <div key={element} className="text-center">
              <div className="text-cone-gray">{element}</div>
              <div>{value.toFixed(3)}</div>
            </div>
          );
        })}
      </div>
      
      <div className="text-xs flex justify-between mt-3">
        <div className="flex items-center">
          <div className="w-3 h-3 border border-dashed border-cone-accent/50 rounded-sm mr-1" />
          <span>{labels[lang].targetRange}</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-cone-red/20 border border-cone-red rounded-sm mr-1" />
          <span>{labels[lang].actualValues}</span>
        </div>
      </div>
    </div>
  );
}
