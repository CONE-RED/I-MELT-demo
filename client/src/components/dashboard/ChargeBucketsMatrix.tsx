import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { Bucket } from '@/types';
import { CollapsibleSection } from '@/components/ui/collapsible-section';
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
    // Format with comma as decimal separator to match the Markdown table format
    return num.toLocaleString(lang === 'en' ? 'de-DE' : 'ru-RU', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    });
  };
  
  // Calculate critical materials (> 50% by weight)
  const criticalMaterials = allMaterialNames.filter(materialName => {
    const totalWeight = buckets.reduce((sum, bucket) => {
      const weight = getMaterialWeight(bucket.id, materialName);
      return sum + (weight || 0);
    }, 0);
    const totalPercentage = buckets.reduce((sum, bucket) => {
      const material = bucket.materials.find(m => m.name === materialName);
      return sum + (material?.percentage || 0);
    }, 0) / buckets.length;
    return totalPercentage > 50;
  });

  const secondaryMaterials = allMaterialNames.filter(name => !criticalMaterials.includes(name));

  return (
    <div className="dashboard-card-enhanced h-full overflow-hidden">
      <h2 className="text-lg font-semibold triangle mb-4">
        {labels[lang].title}
      </h2>
      
      {/* Critical Materials - Always Visible */}
      <CollapsibleSection 
        title="Primary Materials" 
        defaultOpen={true}
        priority="high"
        className="mb-4"
      >
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
            {criticalMaterials.map((materialName, idx) => (
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
          </tbody>
        </table>
        </div>
      </CollapsibleSection>

      {/* Secondary Materials - Collapsible */}
      {secondaryMaterials.length > 0 && (
        <CollapsibleSection 
          title="Secondary Materials" 
          defaultOpen={false}
          priority="medium"
          className="mb-4"
        >
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
                {secondaryMaterials.map((materialName, idx) => (
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
              </tbody>
            </table>
          </div>
        </CollapsibleSection>
      )}

      {/* Bucket Totals - Summary */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        {buckets.map(bucket => (
          <div key={bucket.id} className="bg-cone-gray/10 rounded-lg p-3">
            <div className="font-medium text-cone-gray">{labels[lang].bucket} {bucket.id}</div>
            <div className="text-xl font-bold text-cone-red">
              {formatNumber(bucket.totalWeight)} t
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
