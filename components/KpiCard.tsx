import React, { useMemo } from 'react';
import { Card, theme } from 'antd';
import type { GlobalToken } from 'antd/es/theme/interface';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import type { CSSProperties } from 'react';
import type { KpiCardColor, KpiTrendDirection } from '../types';

export type { KpiCardColor } from '../types';

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
      const base = primaryAccent;
      return {
        background: buildVibrantGradient(base),
        value: token.colorWhite,
        title: 'rgba(255, 255, 255, 0.82)',
        description: 'rgba(255, 255, 255, 0.78)',
        unit: 'rgba(255, 255, 255, 0.78)',
        hoverShadow: `0 22px 46px -24px ${toRgba(base, 0.55)}`,
        baseColor: base,
        swatchBorder: 'rgba(255, 255, 255, 0.35)',
      };
    }
    case 'success': {
      const base = token.colorSuccess;
      return {
        background: buildVibrantGradient(base),
        value: token.colorWhite,
        title: 'rgba(255, 255, 255, 0.85)',
        description: 'rgba(255, 255, 255, 0.8)',
        unit: 'rgba(255, 255, 255, 0.8)',
        hoverShadow: `0 22px 46px -24px ${toRgba(base, 0.5)}`,
        baseColor: base,
        swatchBorder: 'rgba(255, 255, 255, 0.35)',
      };
    }
    case 'warning': {
      const base = token.colorWarning;
      return {
        background: buildVibrantGradient(base),
        value: token.colorWhite,
        title: 'rgba(255, 255, 255, 0.9)',
        description: 'rgba(255, 255, 255, 0.85)',
        unit: 'rgba(255, 255, 255, 0.85)',
        hoverShadow: `0 22px 46px -24px ${toRgba(base, 0.48)}`,
        baseColor: base,
        swatchBorder: 'rgba(255, 255, 255, 0.4)',
      };
    }
    case 'error': {
      const base = token.colorError;
      return {
        background: buildVibrantGradient(base),
        value: token.colorWhite,
        title: 'rgba(255, 255, 255, 0.82)',
        description: 'rgba(255, 255, 255, 0.78)',
        unit: 'rgba(255, 255, 255, 0.78)',
        hoverShadow: `0 22px 46px -24px ${toRgba(base, 0.52)}`,
        baseColor: base,
        swatchBorder: 'rgba(255, 255, 255, 0.35)',
      };
    }
    case 'default':
    default: {
      const base = neutralBase;
      return {
        background: `linear-gradient(135deg, ${tuneColor(base, { lightness: 0.08, saturation: -0.05 })}, ${tuneColor(base, { lightness: -0.06, saturation: -0.05 })})`,
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

  const palette = useMemo(() => getKpiCardPalette(token, color), [token, color]);
  const trendColor = trend === 'down' ? token.colorError : token.colorSuccess;

  const changePalette = useMemo(() => {
    const tinted = color !== 'default';
    return {
      background: tinted ? toRgba(palette.baseColor, 0.25) : token.colorFillSecondary,
      text: tinted ? 'rgba(255, 255, 255, 0.95)' : token.colorTextSecondary,
      iconBackground: tinted ? toRgba(palette.baseColor, 0.35) : token.colorBgElevated,
      iconColor: tinted ? palette.value : trendColor,
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

  const changeToneStyle = displayTrend && color === 'default' ? { color: trendColor } : undefined;

  return (
    <Card
      bordered={false}
      className={['kpi-card', className].filter(Boolean).join(' ')}
      style={cardStyle}
      bodyStyle={{ padding: 0 }}
      onClick={onClick}
    >
      <div className="kpi-card-inner">
        <div className="kpi-card-header">
          <div className="kpi-card-title" title={typeof title === 'string' ? title : undefined}>
            {title}
          </div>
        </div>
        <div className="kpi-card-value-row">
          <span className="kpi-card-value-text">{value}</span>
          {unit && <span className="kpi-card-unit">{unit}</span>}
        </div>
        {(description || showChange) && (
          <div className="kpi-card-footer">
            {description && <div className="kpi-card-description">{description}</div>}
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
        )}
      </div>
    </Card>
  );
};

export default KpiCard;
