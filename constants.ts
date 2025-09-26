import React from 'react';
import { NavItem, TagDefinition } from './types';

export const NAV_ITEMS: NavItem[] = [
  { key: 'home', label: '首頁', icon: 'home' },
  { key: 'incidents', label: '事件管理', icon: 'shield-alert' },
  { key: 'resources', label: '資源管理', icon: 'database-zap' },
  { key: 'dashboards', label: '儀表板管理', icon: 'layout-dashboard' },
  { key: 'analyzing', label: '分析中心', icon: 'activity' },
  { key: 'automation', label: '自動化中心', icon: 'bot' },
  {
    key: 'settings',
    label: '設定',
    icon: 'settings',
    children: [
       {
        key: 'settings/identity-access-management',
        label: '身份與存取',
        icon: 'users',
      },
      {
        key: 'settings/notification-management',
        label: '通知管理',
        icon: 'bell',
      },
      {
        key: 'settings/platform-settings',
        label: '平台設定',
        icon: 'sliders-horizontal',
      },
    ],
  },
];

const TAG_CATEGORIES = ['Infrastructure', 'Application', 'Business', 'Security'];