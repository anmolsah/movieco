import React from 'react';
import { getImageUrl } from '../config/api.js';

const StreamingPlatforms = ({ watchProviders, maxProviders = 3 }) => {
  if (!watchProviders) return null;

  // Get streaming providers (flatrate) first, then rent/buy as fallback
  const streamingProviders = watchProviders.flatrate || [];
  const rentProviders = watchProviders.rent || [];
  const buyProviders = watchProviders.buy || [];
  
  // Prioritize streaming, then rent, then buy
  const allProviders = [...streamingProviders, ...rentProviders, ...buyProviders];
  const uniqueProviders = allProviders.filter((provider, index, self) => 
    index === self.findIndex(p => p.provider_id === provider.provider_id)
  );

  const displayProviders = uniqueProviders.slice(0, maxProviders);
  const hasMore = uniqueProviders.length > maxProviders;

  if (displayProviders.length === 0) return null;

  return (
    <div className="flex items-center gap-1 mt-2">
      <span className="text-xs text-slate-400 mr-1">Watch on:</span>
      <div className="flex items-center gap-1">
        {displayProviders.map((provider) => (
          <div
            key={provider.provider_id}
            className="relative group"
            title={provider.provider_name}
          >
            <img
              src={getImageUrl(provider.logo_path, 'w45')}
              alt={provider.provider_name}
              className="w-6 h-6 rounded-md object-cover"
            />
          </div>
        ))}
        {hasMore && (
          <span className="text-xs text-slate-400 ml-1">
            +{uniqueProviders.length - maxProviders}
          </span>
        )}
      </div>
    </div>
  );
};

export default StreamingPlatforms;