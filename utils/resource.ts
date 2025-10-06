import { ResourceStatus } from '../types';
import { StatusTagProps } from '../components/StatusTag';

interface StatusDescriptor {
  label?: string;
  class_name?: string;
}

interface StatusColorDescriptor {
  label?: string;
  color?: string;
}

export interface ResourceStatusPresentation {
  label: string;
  tone: StatusTagProps['tone'];
  icon: string;
  tooltip: string;
  className?: string;
  dotColor?: string;
}

const BASE_STATUS_META: Record<ResourceStatus, { label: string; tone: StatusTagProps['tone']; icon: string }> = {
  healthy: { label: '正常', tone: 'success', icon: 'check-circle' },
  warning: { label: '警告', tone: 'warning', icon: 'alert-triangle' },
  critical: { label: '嚴重', tone: 'danger', icon: 'alert-octagon' },
  offline: { label: '離線', tone: 'neutral', icon: 'wifi-off' },
  unknown: { label: '未知', tone: 'info', icon: 'help-circle' },
};

const titleCase = (value: string): string => value.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());

export const resolveResourceStatusPresentation = (
  status: ResourceStatus,
  descriptor?: StatusDescriptor,
  colorDescriptor?: StatusColorDescriptor,
): ResourceStatusPresentation => {
  const base = BASE_STATUS_META[status] ?? BASE_STATUS_META.unknown;
  const readable = descriptor?.label ?? base.label;
  const englishLabel = titleCase(status);

  return {
    label: readable,
    tone: base.tone,
    icon: base.icon,
    tooltip: `${readable}（${englishLabel}）`,
    className: descriptor?.class_name,
    dotColor: colorDescriptor?.color,
  };
};
