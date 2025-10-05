import React, { useMemo } from 'react';
import { theme } from 'antd';
import { Card } from 'antd';
import type { GlobalToken } from 'antd/es/theme/interface';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import type { CSSProperties } from 'react';
import type { KpiCardColor, KpiTrendDirection } from '../types';
import { useTheme } from '../contexts/ThemeContext';

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

type ThemeMode = 'light' | 'dark';
type StatusTone = 'error' | 'warning' | 'success' | 'info' | 'default';

export const kpiPalette: Record<StatusTone, { bg: string; text: string }> = {
  error: { bg: 'rgba(255,77,79,0.25)', text: 'hsl(0,70%,75%)' },
  warning: { bg: 'rgba(250,173,20,0.25)', text: 'hsl(35,70%,70%)' },
  success: { bg: 'rgba(82,196,26,0.25)', text: 'hsl(130,50%,70%)' },
  info: { bg: 'rgba(22,119,255,0.25)', text: 'hsl(210,60%,75%)' },
  default: { bg: 'rgba(255,255,255,0.08)', text: '#d9d9d9' },
};

export const kpiPaletteLight: Record<StatusTone, { bg: string; text: string }> = {
  error: { bg: 'rgba(255,77,79,0.16)', text: 'hsl(0,70%,38%)' },
  warning: { bg: 'rgba(250,173,20,0.16)', text: 'hsl(35,70%,40%)' },
  success: { bg: 'rgba(82,196,26,0.16)', text: 'hsl(130,45%,32%)' },
  info: { bg: 'rgba(22,119,255,0.16)', text: 'hsl(210,70%,36%)' },
  default: { bg: 'rgba(0,0,0,0.04)', text: '#262626' },
};

const STATUS_TONES: StatusTone[] = ['error', 'warning', 'success', 'info', 'default'];
const STATUS_BASE_COLORS: Record<StatusTone, string> = {
  error: '#ff4d4f',
  warning: '#faad14',
  success: '#52c41a',
  info: '#1677ff',
  default: '#d9d9d9',
};

const isStatusTone = (tone: KpiCardColor): tone is StatusTone =>
  STATUS_TONES.includes(tone as StatusTone);

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

  const hslMatch = trimmed.match(/hsla?\(([^,]+),\s*([^,]+)%,\s*([^,]+)%/i);
  if (hslMatch) {
    const h = ((Number(hslMatch[1]) % 360) + 360) % 360;
    const s = Number(hslMatch[2]) / 100;
    const l = Number(hslMatch[3]) / 100;
    return hslToRgb({ h: h / 360, s, l });
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

const createTextTokens = (textColor: string, mode: ThemeMode) => {
  if (!textColor) {
    return {
      value: textColor,
      title: textColor,
      description: textColor,
      unit: textColor,
    };
  }

  if (mode === 'dark') {
    return {
      value: tuneColor(textColor, { lightness: 0.12 }),
      title: textColor,
      description: tuneColor(textColor, { lightness: -0.08 }),
      unit: tuneColor(textColor, { lightness: -0.04 }),
    };
  }

  return {
    value: tuneColor(textColor, { lightness: -0.12 }),
    title: tuneColor(textColor, { lightness: -0.08 }),
    description: tuneColor(textColor, { lightness: -0.02 }),
    unit: tuneColor(textColor, { lightness: -0.04 }),
  };
};

export interface GetKpiCardPaletteOptions {
  themeMode?: ThemeMode;
}

const buildVibrantGradient = (baseColor: string) => {
  const start = tuneColor(baseColor, { lightness: 0.18, saturation: 0.12 });
  const end = tuneColor(baseColor, { lightness: -0.16, saturation: 0.05 });
  return `linear-gradient(135deg, ${start}, ${end})`;
};

export const getKpiCardPalette = (
  token: GlobalToken,
  tone: KpiCardColor = 'default',
  options: GetKpiCardPaletteOptions = {},
): KpiCardPalette => {
  const themeMode: ThemeMode = options.themeMode ?? 'dark';
  const statusPalette = themeMode === 'dark' ? kpiPalette : kpiPaletteLight;

  if (isStatusTone(tone) && tone !== 'default') {
    const baseColor = STATUS_BASE_COLORS[tone];
    const textTokens = createTextTokens(statusPalette[tone].text, themeMode);
    return {
      background: statusPalette[tone].bg,
      value: textTokens.value,
      title: textTokens.title,
      description: textTokens.description,
      unit: textTokens.unit,
      hoverShadow: `0 18px 42px -20px ${toRgba(baseColor, themeMode === 'dark' ? 0.55 : 0.28)}`,
      baseColor,
      swatchBorder: themeMode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.12)',
    };
  }

  if (tone === 'default') {
    const palette = statusPalette.default;
    const baseColor = STATUS_BASE_COLORS.default;
    const textTokens = createTextTokens(palette.text, themeMode);
    return {
      background: palette.bg,
      value: textTokens.value || token.colorText,
      title: textTokens.title || (themeMode === 'dark' ? '#d9d9d9' : token.colorTextSecondary),
      description:
        textTokens.description ||
        (themeMode === 'dark' ? 'rgba(255,255,255,0.65)' : token.colorTextTertiary ?? '#595959'),
      unit:
        textTokens.unit ||
        (themeMode === 'dark' ? 'rgba(255,255,255,0.7)' : token.colorTextTertiary ?? '#595959'),
      hoverShadow:
        token.boxShadowSecondary ??
        (themeMode === 'dark' ? '0 18px 42px -24px rgba(0,0,0,0.6)' : '0 18px 42px -24px rgba(0,0,0,0.2)'),
      baseColor,
      swatchBorder: themeMode === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.08)',
    };
  }

  const primaryAccent = token.colorInfo ?? token.colorPrimary;
  const neutralBase = token.colorBgElevated ?? token.colorBgContainer;

  switch (tone) {
    case 'primary': {
      const base = primaryAccent || '#3274d9';
      return {
        background: buildVibrantGradient(base),
        value: '#ffffff',
        title: '#ffffff',
        description: '#e6f4ff',
        unit: '#e6f4ff',
        hoverShadow: `0 22px 46px -24px ${toRgba(base, 0.55)}`,
        baseColor: base,
        swatchBorder: themeMode === 'dark' ? '#ffffff' : '#102a43',
      };
    }
    case 'performance': {
      const base = '#9966ff';
      return {
        background: buildVibrantGradient(base),
        value: '#ffffff',
        title: '#f8f5ff',
        description: '#ede7ff',
        unit: '#ede7ff',
        hoverShadow: `0 22px 46px -24px ${toRgba(base, 0.5)}`,
        baseColor: base,
        swatchBorder: themeMode === 'dark' ? '#ffffff' : '#2f0544',
      };
    }
    case 'resource': {
      const base = '#56c596';
      return {
        background: buildVibrantGradient(base),
        value: '#ffffff',
        title: '#f6fffa',
        description: '#e9fff4',
        unit: '#e9fff4',
        hoverShadow: `0 22px 46px -24px ${toRgba(base, 0.5)}`,
        baseColor: base,
        swatchBorder: themeMode === 'dark' ? '#ffffff' : '#0f2f21',
      };
    }
    case 'health': {
      const base = '#4ecdc4';
      return {
        background: buildVibrantGradient(base),
        value: '#ffffff',
        title: '#effffd',
        description: '#ddfbf8',
        unit: '#ddfbf8',
        hoverShadow: `0 22px 46px -24px ${toRgba(base, 0.5)}`,
        baseColor: base,
        swatchBorder: themeMode === 'dark' ? '#ffffff' : '#0d2a28',
      };
    }
    case 'monitoring': {
      const base = '#17becf';
      return {
        background: buildVibrantGradient(base),
        value: '#ffffff',
        title: '#e8fbff',
        description: '#d1f5fb',
        unit: '#d1f5fb',
        hoverShadow: `0 22px 46px -24px ${toRgba(base, 0.5)}`,
        baseColor: base,
        swatchBorder: themeMode === 'dark' ? '#ffffff' : '#07272b',
      };
    }
    case 'info': {
      const base = '#36a2eb';
      return {
        background: buildVibrantGradient(base),
        value: '#ffffff',
        title: '#e6f4ff',
        description: '#c9e8ff',
        unit: '#c9e8ff',
        hoverShadow: `0 22px 46px -24px ${toRgba(base, 0.5)}`,
        baseColor: base,
        swatchBorder: themeMode === 'dark' ? '#ffffff' : '#102a43',
      };
    }
    case 'success': {
      const base = token.colorSuccess || '#56c596';
      return {
        background: buildVibrantGradient(base),
        value: '#ffffff',
        title: '#f6ffed',
        description: '#d9f7be',
        unit: '#d9f7be',
        hoverShadow: `0 22px 46px -24px ${toRgba(base, 0.5)}`,
        baseColor: base,
        swatchBorder: themeMode === 'dark' ? '#ffffff' : '#0f2f21',
      };
    }
    case 'warning': {
      const base = token.colorWarning || '#f2cc0c';
      return {
        background: buildVibrantGradient(base),
        value: themeMode === 'dark' ? '#1f1f1f' : '#000000',
        title: themeMode === 'dark' ? '#262626' : '#000000',
        description: themeMode === 'dark' ? '#333333' : '#262626',
        unit: themeMode === 'dark' ? '#333333' : '#262626',
        hoverShadow: `0 22px 46px -24px ${toRgba(base, 0.48)}`,
        baseColor: base,
        swatchBorder: themeMode === 'dark' ? '#1f1f1f' : '#000000',
      };
    }
    case 'error': {
      const base = token.colorError || '#dc3545';
      return {
        background: buildVibrantGradient(base),
        value: '#ffffff',
        title: '#fff1f0',
        description: '#ffccc7',
        unit: '#ffccc7',
        hoverShadow: `0 22px 46px -24px ${toRgba(base, 0.52)}`,
        baseColor: base,
        swatchBorder: themeMode === 'dark' ? '#ffffff' : '#2a0708',
      };
    }
    default: {
      const base = neutralBase;
      return {
        background: buildVibrantGradient(base),
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

const WHITE_ICON_SHADOW = '0 1px 2px rgba(0,0,0,0.25)';

const TREND_COLOR_RULES: Record<ThemeMode, Record<StatusTone, { up: string; down: string }>> = {
  dark: {
    error: { up: '#ffffff', down: '#ffffff' },
    warning: { up: '#ffffff', down: '#ffffff' },
    success: { up: '#ffffff', down: '#ffffff' },
    info: { up: '#52c41a', down: '#ff4d4f' },
    default: { up: '#52c41a', down: '#ff4d4f' },
  },
  light: {
    error: { up: '#52c41a', down: '#ff4d4f' },
    warning: { up: '#52c41a', down: '#ff4d4f' },
    success: { up: '#52c41a', down: '#ff4d4f' },
    info: { up: '#52c41a', down: '#ff4d4f' },
    default: { up: '#52c41a', down: '#ff4d4f' },
  },
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
  const { theme: themeMode } = useTheme();

  const palette = useMemo(
    () => getKpiCardPalette(token, (color as KpiCardColor) || 'default', { themeMode }),
    [token, color, themeMode],
  );

  const changePalette = useMemo(() => {
    const tone = (color as KpiCardColor) || 'default';
    const statusTone = isStatusTone(tone) ? tone : null;
    const fallbackUp = token.colorSuccess ?? '#52c41a';
    const fallbackDown = token.colorError ?? '#ff4d4f';
    const trendSet = statusTone ? TREND_COLOR_RULES[themeMode][statusTone] : null;
    const direction = trend === 'down' ? 'down' : 'up';
    const iconColor = (trendSet ?? { up: fallbackUp, down: fallbackDown })[direction];
    const iconShadow = iconColor.toLowerCase() === '#ffffff' ? WHITE_ICON_SHADOW : 'none';

    const background = statusTone ? 'transparent' : toRgba(palette.baseColor, themeMode === 'dark' ? 0.16 : 0.12);
    const iconBackground = statusTone
      ? themeMode === 'dark'
        ? toRgba('#000000', 0.35)
        : toRgba('#ffffff', 0.9)
      : toRgba(palette.baseColor, themeMode === 'dark' ? 0.28 : 0.16);
    const textColor = statusTone ? palette.title : token.colorTextSecondary;

    return {
      background,
      text: textColor,
      iconBackground,
      iconColor,
      iconShadow,
    };
  }, [color, palette.baseColor, palette.title, themeMode, token.colorError, token.colorSuccess, token.colorTextSecondary, trend]);

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
    '--kpi-card-change-icon-shadow': changePalette.iconShadow,
  };

  const displayTrend = trend && (trend === 'up' || trend === 'down');
  const TrendIcon = trend === 'down' ? ArrowDownOutlined : ArrowUpOutlined;
  const showChange = displayTrend || Boolean(change);

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
            <div className="kpi-card-change">
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
