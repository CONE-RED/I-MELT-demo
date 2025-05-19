import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { Bucket } from '@/types';
import { cn } from '@/lib/utils';

interface ChargeBucketsMatrixProps {
  buckets: Bucket[];
}

export default function ChargeBucketsMatrix({ buckets }: ChargeBucketsMatrixProps) {
  const { language } = useSelector((state: RootState) => state);
  
  // Combine all materials to ensure we display all types
  const allMaterialNames = Array.from(new Set(
    buckets.flatMap(bucket => 
      bucket.materials.map(m => m.name)
    )
  ));
  
  const labels = {
    en: {
      title: "Charge Materials per Bucket (t)",
      material: "Material",
      bucket: "Bucket",
      total: "Total",
      composition: "Material Composition"
    },
    ru: {
      title: "Шихтовые материалы по бадьям (т)",
      material: "Материал",
      bucket: "Бадья",
      total: "Итого",
      composition: "Состав материалов"
    }
  };
  
  const lang = language === 'en' ? 'en' : 'ru';
  
  // Function to get material weight for a specific bucket and material
  const getMaterialWeight = (bucketId: number, materialName: string) => {
    const bucket = buckets.find(b => b.id === bucketId);
    if (!bucket) return null;
    
    const material = bucket.materials.find(m => m.name === materialName);
    return material ? material.weight : null;
  };
  
  const formatNumber = (num: number | null) => {
    if (num === null) return "—";
    return num.toLocaleString(lang === 'en' ? 'en-US' : 'ru-RU', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    });
  };
  
  return (
    <div className="dashboard-card h-full overflow-hidden">
      <h2 className="text-lg font-semibold triangle mb-4">
        {labels[lang].title}
      </h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-cone-gray border-b border-cone-gray/20">
              <th className="text-left py-2 font-medium">{labels[lang].material}</th>
              {buckets.map(bucket => (
                <th key={bucket.id} className="text-center py-2 font-medium w-24">
                  {labels[lang].bucket} {bucket.id}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allMaterialNames.map((materialName, idx) => (
              <tr 
                key={materialName} 
                className="border-b border-cone-gray/10 hover:bg-cone-gray/10"
              >
                <td className="py-2">{materialName}</td>
                {buckets.map(bucket => {
                  const weight = getMaterialWeight(bucket.id, materialName);
                  const isBold = weight !== null && weight >= 9.0;
                  
                  return (
                    <td 
                      key={`${bucket.id}-${materialName}`} 
                      className={cn(
                        "py-2 text-center",
                        isBold ? "font-semibold" : "",
                        weight === null ? "text-cone-gray" : ""
                      )}
                    >
                      {formatNumber(weight)}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="border-t-2 border-cone-gray/20 font-semibold">
              <td className="py-2">{labels[lang].total}</td>
              {buckets.map(bucket => (
                <td key={`total-${bucket.id}`} className="py-2 text-center">
                  {formatNumber(bucket.totalWeight)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="mt-6">
        <h3 className="font-medium text-cone-gray mb-2 text-sm">{labels[lang].composition}</h3>
        <div className="grid grid-cols-2 gap-4">
          {buckets.map(bucket => (
            <div key={`composition-${bucket.id}`}>
              <div className="text-xs mb-1">{labels[lang].bucket} {bucket.id}</div>
              <div className="relative h-8 rounded-md bg-cone-gray/20 overflow-hidden">
                {bucket.materials.map((material, idx) => {
                  const offset = bucket.materials
                    .slice(0, idx)
                    .reduce((sum, m) => sum + m.percentage, 0);
                  
                  return (
                    <div 
                      key={`${bucket.id}-${material.name}-bar`}
                      className={`absolute h-full bg-cone-red/${70 - (idx * 10)}`}
                      style={{ 
                        left: `${offset}%`, 
                        width: `${material.percentage}%`
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
