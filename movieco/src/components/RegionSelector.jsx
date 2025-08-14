import React from 'react';
import { Globe } from 'lucide-react';

const RegionSelector = ({ selectedRegion, onRegionChange }) => {
  const regions = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'ES', name: 'Spain' },
    { code: 'IT', name: 'Italy' },
    { code: 'JP', name: 'Japan' },
    { code: 'KR', name: 'South Korea' },
    { code: 'IN', name: 'India' },
    { code: 'BR', name: 'Brazil' },
    { code: 'MX', name: 'Mexico' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'SE', name: 'Sweden' }
  ];

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-slate-400" />
      <select
        value={selectedRegion}
        onChange={(e) => onRegionChange(e.target.value)}
        className="bg-slate-800 text-white text-sm border border-slate-600 rounded-lg px-3 py-1 focus:outline-none focus:border-purple-500 transition-colors"
      >
        {regions.map((region) => (
          <option key={region.code} value={region.code}>
            {region.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RegionSelector;