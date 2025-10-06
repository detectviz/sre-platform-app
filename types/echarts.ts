import type { EChartsOption } from 'echarts';

export type AnyEChartsOption = EChartsOption;

export interface EChartsPointerEvent {
  preventDefault?: () => void;
  stopPropagation?: () => void;
  offsetX: number;
  offsetY: number;
  event?: {
    preventDefault?: () => void;
  };
}

export interface GraphInteractionEvent<TNode = unknown> {
  dataType?: 'node' | 'edge' | string;
  data?: TNode;
  event: EChartsPointerEvent;
}

export type GraphEventHandlers<TNode> = {
  contextmenu?: (params: GraphInteractionEvent<TNode>) => void;
  click?: (params: GraphInteractionEvent<TNode>) => void;
};
