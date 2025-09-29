# sre-platform-app TODO

## ✅ Completed
- [x] Core SRE pages：War Room、Incidents、Alert Rules、Silence Rules、Resource List、Resource Groups、Topology、Dashboards、Analysis、Automation、Settings、Profile
- [x] Frontend foundation：routing、context providers、component library、API service layer、theme system
- [x] Batch operations APIs
  - [x] POST `/resources/batch-tags`
  - [x] POST `/discovery/batch-ignore`
  - [x] POST `/silence-rules/batch-actions`

## 🚧 Backlog
### AI & Automation
- [ ] Trace Analysis 深度分析 *(需 API 支援)*
- [ ] AI Copilot 進階能力 *(需 API 支援)*
- [ ] 智能異常檢測模型 *(需 API 支援)*
- [ ] 自動化診斷建議 *(需 API 支援)*

### Resource Discovery & Monitoring
- [ ] 即時監控代理部署 *(需 API 支援)*
- [ ] 動態資源拓撲 (即時更新) *(需 API / Streaming)*
- [ ] 資源健康評分演算法 *(需 API 支援)*

### Dashboard & Visualization
- [ ] 拖拉式儀表板編輯器
- [ ] 自訂圖表類型支援
- [ ] 即時數據串流 (WebSocket)
- [ ] 儀表板範本市集擴充
- [ ] 儀表板縮放功能 (UI 行為)

### Notifications & Alerts
- [ ] 規則測試 UI（AlertRulePage）
- [ ] 智能通知去重 *(需 API 支援)*
- [ ] 通知升級規則引擎 *(需 API 支援)*
- [ ] 多媒體通知（語音 / 簡訊）*(需 API 支援)*
- [ ] 通知效果分析 *(需 API 支援)*

### Security & Access Control
- [ ] 細粒度資源權限 *(需 API 支援)*
- [ ] SSO 整合 *(需 API / 後端協作)*
- [ ] API 金鑰管理 *(需 API 支援)*
- [ ] 稽核日誌強化 *(需 API 支援)*

### Performance & UX
- [ ] 表格分頁虛擬化
- [ ] 前端資料快取策略
- [ ] 離線模式（Service Worker）
- [ ] 漸進式載入 / Lazy loading

### Placeholder 功能待補
- [ ] AlertRulePage：規則測試流程
- [ ] DashboardViewer：Zoom In/Out 行為
- [ ] LogExplorerPage：進階日誌分析工具
- [ ] InfrastructureInsightsPage：進階洞察
- [ ] MailSettingsPage：進階郵件設定
- [ ] AuditLogsPage：詳細稽核檢視

## 🧭 Priorities
1. AI 驅動異常檢測 *(需 API)*
2. 進階資源監控代理 *(需 API)*
3. 細粒度權限控制 *(需 API)*
4. 智能通知去重 *(需 API)*
5. 通知升級引擎／效果分析 *(需 API)*
6. 拖拉式儀表板編輯器 *(前端)*
7. 即時數據串流 (WebSocket)
8. 高流量表格虛擬化
9. 前端資料快取
10. 離線功能支援

## 📌 Notes
- 儀表板分享功能已移除，暫無開發計畫。
- Alert Rule 測試 API 已存在，僅待前端整合。
- PlaceholderModal 出現的功能優先權低於核心體驗。 
- 需新增 / 擴充 API 的項目已標註，優先處理。
