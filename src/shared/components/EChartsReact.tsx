import { useEffect, useRef } from 'react';
import type { EChartsType } from 'echarts';
import type { AnyEChartsOption } from '@/shared/types/domain/echarts';

type EChartsEventHandler = (params: unknown) => void;

type EventMap = Record<string, EChartsEventHandler>;

declare global {
  interface Window {
    echarts?: {
      init: (dom: HTMLDivElement, theme?: string) => EChartsType;
    };
  }
}

interface EChartsReactProps<Option extends AnyEChartsOption = AnyEChartsOption, Events extends EventMap = EventMap> {
  option: Option;
  style?: React.CSSProperties;
  className?: string;
  onEvents?: Partial<Events>;
}

const EChartsReact = <Option extends AnyEChartsOption, Events extends EventMap>({
  option,
  style,
  className,
  onEvents
}: EChartsReactProps<Option, Events>) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let chartInstance: EChartsType | undefined;
    if (chartRef.current && window.echarts) {
      chartInstance = window.echarts.init(chartRef.current, 'dark');
      chartInstance.setOption(option, true);

      if (onEvents) {
        Object.entries(onEvents).forEach(([eventName, handler]) => {
          if (handler) {
            chartInstance?.on(eventName, handler as (params: unknown) => void);
          }
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
