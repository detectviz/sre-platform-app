
import React, { useRef, useEffect } from 'react';

declare global {
  interface Window {
    echarts: any;
  }
}

interface EChartsReactProps {
  option: any;
  style?: React.CSSProperties;
  className?: string;
  onEvents?: Record<string, (params: any) => void>;
}

const EChartsReact: React.FC<EChartsReactProps> = ({ option, style, className, onEvents }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let chartInstance: any | null = null;
    if (chartRef.current && window.echarts) {
      chartInstance = window.echarts.init(chartRef.current, 'dark');
      chartInstance.setOption(option, true); // Use `true` to not merge with previous options

      // Add event listeners
      if (onEvents) {
        Object.entries(onEvents).forEach(([eventName, handler]) => {
          chartInstance.on(eventName, handler);
        });
      }
    }

    const handleResize = () => {
      chartInstance?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      chartInstance?.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [option, onEvents]);

  return <div ref={chartRef} style={style || { height: '100%', width: '100%' }} className={className} />;
};

export default EChartsReact;
