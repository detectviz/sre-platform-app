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

/**
 * 智慧 KPI 調色盤 (深色主題)
 * @description 根據 Grafana "status palette" 設計，提供高對比度且語義清晰的顏色。
 * - bg: 使用半透明背景以融入深色主題。
 * - text: 使用柔和的 HSL 顏色以降低視覺疲勞。
 */
export const kpiPalette = {
  error: { bg: 'rgba(255,77,79,0.25)', text: 'hsl(0,70%,75%)' },
  warning: { bg: 'rgba(250,173,20,0.25)', text: 'hsl(35,70%,70%)' },
  success: { bg: 'rgba(82,196,26,0.25)', text: 'hsl(130,50%,70%)' },
  info: { bg: 'rgba(22,119,255,0.25)', text: 'hsl(210,60%,75%)' },
  default: { bg: 'rgba(255,255,255,0.08)', text: '#d9d9d9' },
  performance: { bg: 'rgba(153,102,255,0.25)', text: 'hsl(260,60%,75%)' },
  monitoring: { bg: 'rgba(23,190,207,0.25)', text: 'hsl(185,70%,75%)' },
};

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

export const getKpiCardPalette = (token: GlobalToken, tone: KpiCardColor = 'default'): KpiCardPalette => {
  // 確保傳入的 tone 在 kpiPalette 中有效，否則使用 default
  const safeTone = (tone && tone in kpiPalette ? tone : 'default') as keyof typeof kpiPalette;
  const selectedPalette = kpiPalette[safeTone];

  // 從半透明的背景色中提取 RGB 值，用於生成更柔和的陰影
  const shadowColor = selectedPalette.bg.replace(/,.*?\)/, ', 0.3)');

  return {
    background: selectedPalette.bg,
    value: selectedPalette.text,
    title: selectedPalette.text,
    description: selectedPalette.text,
    unit: selectedPalette.text,
    hoverShadow: `0 8px 32px -8px ${shadowColor}`,
    baseColor: selectedPalette.bg,
    swatchBorder: token.colorBorderSecondary,
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

  const palette = useMemo(() => getKpiCardPalette(token, (color as KpiCardColor) || 'default'), [token, color]);

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
  const showChange = displayTrend || Boolean(change);

  // 根據 KPI 卡片背景色，動態決定趨勢的顏色
  const trendStyle = useMemo((): React.CSSProperties => {
    if (!displayTrend) {
      return { color: palette.value }; // 若無趨勢，文字顏色與主色調一致
    }

    const safeColor = (color && color in kpiPalette ? color : 'default') as keyof typeof kpiPalette;

    switch (safeColor) {
      case 'error':
      case 'warning':
      case 'success':
        // 在紅、橙、綠背景下，趨勢箭頭統一為白色以確保可見性
        return {
          color: '#ffffff',
          textShadow: '0 1px 2px rgba(0,0,0,0.25)',
        };
      case 'info':
      case 'default':
      default:
        // 在藍色和灰色背景下，趨勢箭頭保留語義顏色（綠升紅降）
        return {
          color: trend === 'down' ? '#ff4d4f' : '#52c41a',
        };
    }
  }, [displayTrend, color, trend, palette.value]);


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
