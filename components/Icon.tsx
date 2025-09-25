import React, { useEffect, useRef } from 'react';

// FIX: Extend React.HTMLAttributes<HTMLElement> to allow passing standard HTML attributes like 'title'.
interface IconProps extends React.HTMLAttributes<HTMLElement> {
  name: string;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, className, ...rest }) => {
  const containerRef = useRef<HTMLSpanElement>(null);
  
  // A map for Ant Design icon names to Lucide names
  const iconNameMap: { [key: string]: string } = {
    'home': 'home',
    'incidents': 'shield-alert',
    'resources': 'database-zap',
    'dashboard': 'layout-dashboard',
    'analyzing': 'activity',
    'automation': 'bot',
    'settings': 'settings',
    'identity-access-management': 'users',
    'notification-management': 'bell',
    'platform-settings': 'sliders-horizontal',
    'MenuFoldOutlined': 'menu',
    'MenuUnfoldOutlined': 'menu',
    'menu-fold': 'align-justify',
    'menu-unfold': 'align-left',
    'deployment-unit': 'box',
  };

  const lucidName = iconNameMap[name] || name;

  useEffect(() => {
    if (containerRef.current) {
      const iconEl = document.createElement('i');
      iconEl.setAttribute('data-lucide', lucidName);
      
      // Clear previous icon from the container
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(iconEl);

      // @ts-ignore
      if (window.lucide) {
        // @ts-ignore
        window.lucide.createIcons({
          nodes: [iconEl], // Tell lucide to only process this new element
          // FIX: Add attributes to make the generated SVG inherit size from its container.
          attrs: {
            width: '100%',
            height: '100%',
          }
        });
      }
    }
  }, [lucidName]); // Re-run effect when the icon name changes

  // The container will handle the className for sizing and color.
  // The SVG inside will inherit color, and size will be constrained.
  // FIX: Use inline-flex and centering to ensure the icon is properly contained and sized.
  return <span ref={containerRef} className={`${className || ''} inline-flex items-center justify-center`} {...rest} />;
};

export default Icon;