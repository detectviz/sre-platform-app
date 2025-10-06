import React, { useEffect, useRef, useState } from 'react';
import api from '../services/api';

// --- Caching Mechanism ---
// Module-level cache to store the fetched icon map.
let iconMapCache: Record<string, string> | null = null;
// Promise to prevent multiple fetches while one is already in flight.
let fetchPromise: Promise<Record<string, string>> | null = null;

const fetchAndCacheIconMap = (): Promise<Record<string, string>> => {
    if (iconMapCache) {
        return Promise.resolve(iconMapCache);
    }
    if (fetchPromise) {
        return fetchPromise;
    }
    fetchPromise = api.get<Record<string, string>>('/ui/icons')
        .then(response => {
            iconMapCache = response.data;
            return iconMapCache;
        })
        .catch(err => {
            // Failed to fetch icon map - icons may not render correctly
            // On failure, set an empty cache to prevent retries
            iconMapCache = {};
            return iconMapCache;
        })
        .finally(() => {
            fetchPromise = null;
        });
    return fetchPromise;
};

// Pre-fetch the map when the module is loaded.
fetchAndCacheIconMap();
// --- End Caching Mechanism ---


interface IconProps extends React.HTMLAttributes<HTMLElement> {
  name: string;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, className, ...rest }) => {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [iconMap, setIconMap] = useState<Record<string, string> | null>(iconMapCache);
  
  useEffect(() => {
    if (!iconMap) {
        fetchAndCacheIconMap().then(setIconMap);
    }
  }, [iconMap]);

  const lucidName = (iconMap && iconMap[name]) || name;

  useEffect(() => {
    if (containerRef.current) {
      const iconEl = document.createElement('i');
      iconEl.setAttribute('data-lucide', lucidName);
      
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(iconEl);

      // @ts-ignore
      if (window.lucide) {
        // @ts-ignore
        window.lucide.createIcons({
          nodes: [iconEl],
          attrs: {
            width: '100%',
            height: '100%',
          }
        });
      }
    }
  }, [lucidName]);

  return <span ref={containerRef} className={`${className || ''} inline-flex items-center justify-center`} {...rest} />;
};

export default Icon;