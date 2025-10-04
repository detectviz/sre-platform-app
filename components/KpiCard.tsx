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
}

export const getKpiCardPalette = (token: GlobalToken, tone: KpiCardColor = 'default'): KpiCardPalette => {
  switch (tone) {
    case 'primary':
      return {
        background: token.colorPrimary,
        value: token.colorWhite,
        title: 'rgba(255, 255, 255, 0.75)',
        description: 'rgba(255, 255, 255, 0.72)',
        unit: 'rgba(255, 255, 255, 0.72)',
        hoverShadow: `0 12px 32px -12px ${token.colorPrimary}`,
      };
    case 'success':
      return {
        background: token.colorSuccess,
        value: token.colorWhite,
        title: 'rgba(255, 255, 255, 0.78)',
        description: 'rgba(255, 255, 255, 0.75)',
        unit: 'rgba(255, 255, 255, 0.75)',
        hoverShadow: `0 12px 32px -12px ${token.colorSuccess}`,
      };
    case 'warning':
      return {
        background: token.colorWarning,
        value: token.colorWhite,
        title: 'rgba(255, 255, 255, 0.8)',
        description: 'rgba(255, 255, 255, 0.78)',
        unit: 'rgba(255, 255, 255, 0.78)',
        hoverShadow: `0 12px 32px -12px ${token.colorWarning}`,
      };
    case 'error':
      return {
        background: token.colorError,
        value: token.colorWhite,
        title: 'rgba(255, 255, 255, 0.78)',
        description: 'rgba(255, 255, 255, 0.76)',
        unit: 'rgba(255, 255, 255, 0.76)',
        hoverShadow: `0 12px 32px -12px ${token.colorError}`,
      };
    case 'default':
    default:
      return {
        background: token.colorBgContainer,
        value: token.colorText,
        title: token.colorTextSecondary,
        description: token.colorTextTertiary ?? token.colorTextSecondary,
        unit: token.colorTextTertiary ?? token.colorTextSecondary,
        hoverShadow: token.boxShadowSecondary,
      };
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

  const cardStyle: CSSProperties & Record<string, string> = {
    background: palette.background,
    color: palette.value,
    '--kpi-card-title-color': palette.title,
    '--kpi-card-description-color': palette.description,
    '--kpi-card-unit-color': palette.unit,
    '--kpi-card-value-color': palette.value,
    '--kpi-card-hover-shadow': palette.hoverShadow,
  };

  const displayTrend = trend && (trend === 'up' || trend === 'down');
  const TrendIcon = trend === 'down' ? ArrowDownOutlined : ArrowUpOutlined;

  return (
    <Card
      bordered={false}
      className={['kpi-card', className].filter(Boolean).join(' ')}
      style={cardStyle}
      bodyStyle={{ padding: 0 }}
      onClick={onClick}
    >
      <div className="kpi-card-header">
        <div className="kpi-card-title" title={typeof title === 'string' ? title : undefined}>
          {title}
        </div>
        {(displayTrend || change) && (
          <div className="kpi-card-trend" style={{ color: displayTrend ? trendColor : palette.title }}>
            {displayTrend && <TrendIcon />}
            {change && <span>{change}</span>}
          </div>
        )}
      </div>
      <div className="kpi-card-value-row">
        <span className="kpi-card-value-text">{value}</span>
        {unit && <span className="kpi-card-unit">{unit}</span>}
      </div>
      {description && <div className="kpi-card-description">{description}</div>}
    </Card>
  );
};

export default KpiCard;
