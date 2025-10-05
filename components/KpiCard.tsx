import React, { useMemo } from 'react';
import { theme } from 'antd';
import { Card } from 'antd';
import type { GlobalToken } from 'antd/es/theme/interface';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import type { CSSProperties } from 'react';
import type { KpiCardColor, KpiTrendDirection } from '../types';

export type { KpiCardColor } from '../types';

import './KpiCard.css';

/**
 * KPI Card 調色盤系統
 * 
 * 專為 SRE 平台設計的監控指標卡片色彩系統：
 * - 基於 Grafana 色彩規範，確保視覺一致性
 * - 針對深色主題優化，提供良好的對比度
 * - 語義化顏色設計，符合監控運維場景
 */
const KPI_COLOR_PALETTE = {
  default: {
    background: 'rgba(71, 85, 105, 0.3)',
    text: '#e2e8f0',
    shadow: 'rgba(71, 85, 105, 0.4)',
  },
  primary: {
    background: 'rgba(59, 130, 246, 0.25)',
    text: '#93c5fd',
    shadow: 'rgba(59, 130, 246, 0.4)',
  },
  success: {
    background: 'rgba(34, 197, 94, 0.25)',
    text: '#86efac',
    shadow: 'rgba(34, 197, 94, 0.4)',
  },
  warning: {
    background: 'rgba(245, 158, 11, 0.25)',
    text: '#f5f4a9', // 淡黃色文字
    shadow: 'rgba(245, 158, 11, 0.4)',
  },
  error: {
    background: 'rgba(239, 68, 68, 0.25)',
    text: '#fca5a5',
    shadow: 'rgba(239, 68, 68, 0.4)',
  },
  info: {
    background: 'rgba(6, 182, 212, 0.25)',
    text: '#67e8f9',
    shadow: 'rgba(6, 182, 212, 0.4)',
  },
  performance: {
    background: 'rgba(147, 51, 234, 0.25)',
    text: '#c4b5fd',
    shadow: 'rgba(147, 51, 234, 0.4)',
  },
  resource: {
    background: 'rgba(5, 150, 105, 0.25)',
    text: '#6ee7b7',
    shadow: 'rgba(5, 150, 105, 0.4)',
  },
  health: {
    background: 'rgba(16, 185, 129, 0.25)',
    text: '#6ee7b7',
    shadow: 'rgba(16, 185, 129, 0.4)',
  },
  monitoring: {
    background: 'rgba(14, 165, 233, 0.25)',
    text: '#7dd3fc',
    shadow: 'rgba(14, 165, 233, 0.4)',
  },
} as const;

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
  baseColor: string;
  swatchBorder?: string;
}

// 獲取 KPI 卡片調色盤
export const getKpiCardPalette = (token: GlobalToken, tone: KpiCardColor = 'default'): KpiCardPalette => {
  const palette = KPI_COLOR_PALETTE[tone] || KPI_COLOR_PALETTE.default;

  return {
    background: palette.background,
    value: palette.text,
    title: palette.text,
    description: palette.text,
    unit: palette.text,
    baseColor: palette.background,
    swatchBorder: token.colorBorderSecondary,
  };
};

// 獲取趨勢指示器樣式
const getTrendStyle = (color: KpiCardColor, trend: KpiTrendDirection | null): CSSProperties => {
  if (!trend || (trend !== 'up' && trend !== 'down')) {
    return {};
  }

  // 警示背景使用淡黃色文字，其他使用白色
  if (color === 'warning') {
    return {
      color: '#f5f4a9',
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.25)',
    };
  }

  return {
    color: '#ffffff',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.25)',
  };
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

  const palette = useMemo(() => getKpiCardPalette(token, color as KpiCardColor), [token, color]);

  const cardStyle: CSSProperties & Record<string, string> = {
    background: palette.background,
    color: palette.value,
    '--kpi-card-title-color': palette.title,
    '--kpi-card-description-color': palette.description,
    '--kpi-card-unit-color': palette.unit,
    '--kpi-card-value-color': palette.value,
  };

  const displayTrend = trend && (trend === 'up' || trend === 'down');
  const TrendIcon = trend === 'down' ? ArrowDownOutlined : ArrowUpOutlined;
  const showChange = displayTrend || Boolean(change);

  const trendStyle = useMemo(() => getTrendStyle(color as KpiCardColor, trend), [color, trend]);

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
      data-color={color}
    >
      <div className="kpi-card-inner">
        <div className="kpi-card-header">
          <div className="kpi-card-title" title={typeof title === 'string' ? title : undefined}>
            {title}
          </div>
          {showChange && (
            <div className="kpi-card-change" style={trendStyle}>
              {displayTrend && (
                <span className="kpi-card-change-icon" style={{ background: 'transparent' }}>
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