import React, { useMemo } from 'react';
import { theme } from 'antd';
import { Card } from 'antd';
import type { CardProps } from 'antd';
import type { GlobalToken } from 'antd/es/theme/interface';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import type { CSSProperties } from 'react';
import type { KpiCardColor, KpiTrendDirection } from '../types';

export type { KpiCardColor } from '../types';

/**
 * SRE Platform KPI Card Color System
 *
 * 專為監控和運維場景設計的專業色彩系統：
 *
 * 🎨 色彩主題說明：
 * - default: 中性灰色，適用於一般指標
 * - primary: 品牌藍色，用於主要業務指標
 * - success: 成功綠色，表示正常運行狀態
 * - warning: 警告橙色，提示需要關注的指標
 * - error: 錯誤紅色，表示嚴重問題
 * - info: 資訊青色，用於一般資訊類指標
 * - performance: 效能紫色，專為效能指標設計
 * - resource: 資源綠色，用於資源使用率指標
 * - health: 健康深綠，強調系統健康狀態
 * - monitoring: 監控藍色，用於監控相關指標
 *
 * 🔧 設計原則：
 * - 每個主題都有獨特的漸變背景和懸停效果
 * - 在深色主題下提供優秀的對比度和可讀性
 * - 色彩語義明確，符合監控運維的視覺語言
 * - 支援動畫過渡，提供流暢的互動體驗
 */

import './KpiCard.css';

export interface KpiCardProps {
  title: string;
  value: number | string;
  unit?: string;
  description?: React.ReactNode;
  color?: KpiCardColor;
  trend?: KpiTrendDirection;
  change?: string;
  className?: string;
  onClick?: () => void;
}

export interface KpiCardPalette {
  background: string;
  value: string;
  title: string;
  description: string;
  unit: string;
  hoverShadow: string;
  baseColor: string;
  swatchBorder?: string;
}

type RGB = { r: number; g: number; b: number };

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const parseColor = (color: string): RGB | null => {
  if (!color) {
    return null;
  }

  const trimmed = color.trim();

  if (/^#([a-fA-F0-9]{3})$/.test(trimmed)) {
    const hex = trimmed.slice(1);
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    return { r, g, b };
  }

  if (/^#([a-fA-F0-9]{6})$/.test(trimmed)) {
    const hex = trimmed.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return { r, g, b };
  }

  const rgbMatch = trimmed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgbMatch) {
    return {
      r: Number(rgbMatch[1]),
      g: Number(rgbMatch[2]),
      b: Number(rgbMatch[3]),
    };
  }

  return null;
};


const rgbToHsl = ({ r, g, b }: RGB) => {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;

  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  const delta = max - min;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case rn:
        h = (gn - bn) / delta + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / delta + 2;
        break;
      default:
        h = (rn - gn) / delta + 4;
        break;
    }

    h /= 6;
  }

  return { h, s, l };
};

const hslToRgb = ({ h, s, l }: { h: number; s: number; l: number }): RGB => {
  const hueToRgb = (p: number, q: number, t: number) => {
    let temp = t;
    if (temp < 0) temp += 1;
    if (temp > 1) temp -= 1;
    if (temp < 1 / 6) return p + (q - p) * 6 * temp;
    if (temp < 1 / 2) return q;
    if (temp < 2 / 3) return p + (q - p) * (2 / 3 - temp) * 6;
    return p;
  };

  if (s === 0) {
    const value = Math.round(l * 255);
    return { r: value, g: value, b: value };
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const r = Math.round(hueToRgb(p, q, h + 1 / 3) * 255);
  const g = Math.round(hueToRgb(p, q, h) * 255);
  const b = Math.round(hueToRgb(p, q, h - 1 / 3) * 255);

  return { r, g, b };
};

const tuneColor = (color: string, { lightness = 0, saturation = 0 }: { lightness?: number; saturation?: number }) => {
  const rgb = parseColor(color);
  if (!rgb) {
    return color;
  }

  const hsl = rgbToHsl(rgb);
  const next = {
    h: hsl.h,
    s: clamp(hsl.s + saturation, 0, 1),
    l: clamp(hsl.l + lightness, 0, 1),
  };

  const { r, g, b } = hslToRgb(next);
  return `rgb(${r}, ${g}, ${b})`;
};

const toRgba = (color: string, alpha: number) => {
  const rgb = parseColor(color);
  if (!rgb) {
    return color;
  }
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
};

const buildVibrantGradient = (baseColor: string) => {
  const start = tuneColor(baseColor, { lightness: 0.18, saturation: 0.12 });
  const end = tuneColor(baseColor, { lightness: -0.16, saturation: 0.05 });
  return `linear-gradient(135deg, ${start}, ${end})`;
};

export const getKpiCardPalette = (token: GlobalToken, tone: KpiCardColor = 'default'): KpiCardPalette => {
  const primaryAccent = token.colorInfo ?? token.colorPrimary;
  const neutralBase = token.colorBgElevated ?? token.colorBgContainer;

  switch (tone) {
    case 'primary': {
      const base = primaryAccent || '#3274d9'; // 使用更貼近Grafana的主題藍色
      return {
        background: `linear-gradient(135deg, ${base}, ${base})`,
        value: '#ffffff',
        title: '#ffffff',
        description: '#ffffff',
        unit: '#ffffff',
        hoverShadow: `0 22px 46px -24px ${toRgba(base, 0.55)}`,
        baseColor: base,
        swatchBorder: '#ffffff',
      };
    }
    case 'success': {
      const base = token.colorSuccess || '#56c596'; // 使用更貼近Grafana的綠色
      return {
        background: `linear-gradient(135deg, ${base}, ${base})`,
        value: '#ffffff',
        title: '#ffffff',
        description: '#ffffff',
        unit: '#ffffff',
        hoverShadow: `0 22px 46px -24px ${toRgba(base, 0.5)}`,
        baseColor: base,
        swatchBorder: '#ffffff',
      };
    }
    case 'info': {
      const base = '#36a2eb'; // 更鮮明的藍色，類似Grafana
      return {
        background: `linear-gradient(135deg, ${base}, ${base})`,
        value: '#ffffff',
        title: '#ffffff',
        description: '#ffffff',
        unit: '#ffffff',
        hoverShadow: `0 22px 46px -24px ${toRgba(base, 0.5)}`,
        baseColor: base,
        swatchBorder: '#ffffff',
      };
    }
    case 'performance': {
      const base = '#9966ff'; // 更鮮明的紫色，類似Grafana
      return {
        background: `linear-gradient(135deg, ${base}, ${base})`,
        value: '#ffffff',
        title: '#ffffff',
        description: '#ffffff',
        unit: '#ffffff',
        hoverShadow: `0 22px 46px -24px ${toRgba(base, 0.5)}`,
        baseColor: base,
        swatchBorder: '#ffffff',
      };
    }
    case 'resource': {
      const base = '#56c596'; // 更鮮明的綠色，類似Grafana
      return {
        background: `linear-gradient(135deg, ${base}, ${base})`,
        value: '#ffffff',
        title: '#ffffff',
        description: '#ffffff',
        unit: '#ffffff',
        hoverShadow: `0 22px 46px -24px ${toRgba(base, 0.5)}`,
        baseColor: base,
        swatchBorder: '#ffffff',
      };
    }
    case 'health': {
      const base = '#4ecdc4'; // 青綠色，更符合Grafana的健康狀態色彩
      return {
        background: `linear-gradient(135deg, ${base}, ${base})`,
        value: '#ffffff',
        title: '#ffffff',
        description: '#ffffff',
        unit: '#ffffff',
        hoverShadow: `0 22px 46px -24px ${toRgba(base, 0.5)}`,
        baseColor: base,
        swatchBorder: '#ffffff',
      };
    }
    case 'monitoring': {
      const base = '#17becf'; // 青藍色，更符合Grafana的監控色彩
      return {
        background: `linear-gradient(135deg, ${base}, ${base})`,
        value: '#ffffff',
        title: '#ffffff',
        description: '#ffffff',
        unit: '#ffffff',
        hoverShadow: `0 22px 46px -24px ${toRgba(base, 0.5)}`,
        baseColor: base,
        swatchBorder: '#ffffff',
      };
    }
    case 'warning': {
      const base = token.colorWarning || '#f2cc0c'; // 使用更貼近Grafana的黃色
      return {
        background: `linear-gradient(135deg, ${base}, ${base})`,
        value: '#000000', // 黃色背景用黑色文字
        title: '#000000',
        description: '#000000',
        unit: '#000000',
        hoverShadow: `0 22px 46px -24px ${toRgba(base, 0.48)}`,
        baseColor: base,
        swatchBorder: '#000000',
      };
    }
    case 'error': {
      const base = token.colorError || '#dc3545'; // 使用更貼近Grafana的紅色
      return {
        background: `linear-gradient(135deg, ${base}, ${base})`,
        value: '#ffffff',
        title: '#ffffff',
        description: '#ffffff',
        unit: '#ffffff',
        hoverShadow: `0 22px 46px -24px ${toRgba(base, 0.52)}`,
        baseColor: base,
        swatchBorder: '#ffffff',
      };
    }
    case 'default':
    default: {
      const base = neutralBase;
      return {
        background: `linear-gradient(135deg, ${base}, ${base})`,
        value: token.colorText,
        title: token.colorTextSecondary,
        description: token.colorTextTertiary ?? token.colorTextSecondary,
        unit: token.colorTextTertiary ?? token.colorTextSecondary,
        hoverShadow: token.boxShadowSecondary,
        baseColor: base,
        swatchBorder: token.colorBorderSecondary ?? token.colorBorder,
      };
    }
  }
};

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  unit,
  description,
  color = 'default',
  trend = null,
  change,
  className,
  onClick,
}) => {
  const { token } = theme.useToken();

  const palette = useMemo(() => getKpiCardPalette(token, (color as KpiCardColor) || 'default'), [token, color]);
  const trendColor = trend === 'down' ? token.colorError : token.colorSuccess;

  const changePalette = useMemo(() => {
    const tinted = ((color as KpiCardColor) || 'default') !== 'default';
    const currentColor = (color as KpiCardColor) || 'default';

    // 簡單選擇文字顏色
    const getTextColor = () => {
      if (!tinted) return token.colorTextSecondary;
      // 黃色背景用黑色，其他用白色
      return currentColor === 'warning' ? '#000000' : '#ffffff';
    };

    // 為趨勢指標選擇適當的顏色
    const getTrendIconColor = () => {
      if (!tinted) return trendColor; // 預設情況使用原始趨勢顏色
      return getTextColor(); // 有色背景使用對比色
    };

    return {
      background: tinted ? palette.baseColor : token.colorFillSecondary,
      text: getTextColor(),
      iconBackground: tinted ? palette.baseColor : token.colorBgElevated,
      iconColor: getTrendIconColor(),
    };
  }, [color, palette.baseColor, palette.value, token.colorBgElevated, token.colorFillSecondary, token.colorTextSecondary, trendColor]);

  const cardStyle: CSSProperties & Record<string, string> = {
    background: palette.background,
    color: palette.value,
    '--kpi-card-title-color': palette.title,
    '--kpi-card-description-color': palette.description,
    '--kpi-card-unit-color': palette.unit,
    '--kpi-card-value-color': palette.value,
    '--kpi-card-hover-shadow': palette.hoverShadow,
    '--kpi-card-change-bg': changePalette.background,
    '--kpi-card-change-text': changePalette.text,
    '--kpi-card-change-icon-bg': changePalette.iconBackground,
    '--kpi-card-change-icon-color': changePalette.iconColor,
  };

  const displayTrend = trend && (trend === 'up' || trend === 'down');
  const TrendIcon = trend === 'down' ? ArrowDownOutlined : ArrowUpOutlined;
  const showChange = displayTrend || Boolean(change);

  // 為趨勢指標選擇適當的顏色，避免與背景衝突
  const changeToneStyle = useMemo(() => {
    if (!displayTrend) return undefined;

    const currentColor = (color as KpiCardColor) || 'default';
    const tinted = currentColor !== 'default';

    if (!tinted) {
      // 預設背景使用原始趨勢顏色
      return { color: trendColor };
    }

    // 有色背景：黃色用黑色，其他用白色
    return { color: currentColor === 'warning' ? '#000000' : '#ffffff' };
  }, [displayTrend, color, trendColor]);

  return (
    // @ts-ignore
    <Card
      bordered={false}
      className={['kpi-card', className].filter(Boolean).join(' ')}
      style={{
        ...cardStyle,
        padding: '12px',
        height: '120px',
      } as React.CSSProperties}
      bodyStyle={{
        padding: 0,
      }}
      onClick={onClick}
      data-color={(color as KpiCardColor) || 'default'}
    >
      <div className="kpi-card-inner">
        <div className="kpi-card-header">
          <div className="kpi-card-title" title={typeof title === 'string' ? title : undefined}>
            {title}
          </div>
          {showChange && (
            <div className="kpi-card-change" style={changeToneStyle}>
              {displayTrend && (
                <span className="kpi-card-change-icon">
                  <TrendIcon />
                </span>
              )}
              {change && <span>{change}</span>}
            </div>
          )}
        </div>
        <div className="kpi-card-value-row">
          <span className="kpi-card-value-text">{value}</span>
          {unit && <span className="kpi-card-unit">{unit}</span>}
        </div>
        {description && (
          <div className="kpi-card-footer">
            <div className="kpi-card-description">{description}</div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default KpiCard;
