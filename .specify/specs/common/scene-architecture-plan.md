# 剩餘待處理項目清單 (Remaining NEEDS CLARIFICATION)

**統計日期**: 2025-10-06
**總數**: 78 項
**已解決**: 15 項 (前端 UI/UX)
**剩餘**: 63 項

---

## 一、項目分類統計

> **註記 (2025-10-08 更新)**  
> 前端架構已全面改採 Like Grafana / Scenes-based Framework，  
> 因此元件層 Clarification（UI/UX 細節與元件行為）已失效並移除。  
>  
> 本文件僅保留：
> - 後端參數項目  
> - 跨域協作項目  
> 其餘項目視為自動解決，無需後續追蹤。

### 1.1 已解決項目 (✅ 15 項)

| # | 項目 | 所屬檔案 | 解決方式 |
|---|------|----------|----------|
| 1 | 巢狀 Modal 層級限制 | ../specs/common/modal-interaction-pattern.md | 前端決策: 最大 2 層 |
| 2 | 虛擬滾動方案選擇 | ../specs/common/table-design-system.md | 前端決策: react-window |
| 3 | 軟刪除與硬刪除 UI | ../specs/common/crud-interaction-pattern.md | 前端決策: Checkbox vs 輸入確認 |
| 4 | 權限選擇器 UI | identity-role-spec.md | 前端決策: 樹狀結構 |
| 5 | 事件狀態變更提示 | incidents-list-spec.md | 前端決策: Toast + 時間軸 |
| 6 | 策略衝突提示 | notification-strategy-spec.md | 前端決策: Alert + 色點 |
| 7 | 拓撲圖更新提示 | resources-topology-spec.md | 前端決策: 狀態指示器 + 置信度 |
| 8 | 容量預測展示 | insights-capacity-spec.md | 前端決策: ECharts + 星級 |
| 9 | SSO 登入 UI | platform-auth-spec.md | 前端決策: 主輔結構 + 降級 |
| 10 | 敏感資料遮罩 | resources-datasource-spec.md | 前端決策: Password/Token/Key |
| 11-15 | 後端參數項目 | 各模組 | 標記為「由 API 提供」 |

---

# 模組行為解決方案建議書（Scenes 架構適用）

**文件版本**: 2.0  
**建立日期**: 2025-10-08  
**狀態**: Draft  
**依據**: `.specify/specs/_review.md`  
**範圍**: **針對 Scene 模組間行為與資料流，移除純 UI 細節**

---

## 一、執行摘要

本文件為原「前端規格解決方案」的 Scenes 架構版本，用以統整 `NEEDS CLARIFICATION` 項目，聚焦於：
- 模組間互動行為  
- 場景狀態傳遞  
- 資料流封裝與 API 契約  
- 共用變數（tenantId, timeRange, filters）  

所有 UI/UX 細節、Ant Design 相關元件及前端技術選型已移除。  
Scenes 架構下，行為邏輯由狀態驅動（state-driven）與 SceneQueryRunner 控制。  

---

## 二、後端參數項目（前端僅顯示）

由後端 API 提供，SceneApp 僅負責顯示：

| 參數 | 說明 |
|------|------|
| `maxConcurrent` | 並行上限 |
| `retentionDays` | 資料保留天數 |
| `cacheTTL` | 快取有效期 |
| `rateLimit` | API 請求頻率限制 |
| `queryRange` | 查詢可選範圍 |
| `autoCloseAfter` | 自動關閉時長 |
| `algorithm` | 演算法設定 |
| `priority` | 策略優先級 |
| `updateInterval` | 拓撲更新頻率 |
| `silenceDuration` | 靜音時長 |
| `maxGroupLevel` | 資源群組層級上限 |

---

## 三、跨模組場景行為 (Scene Interactions)

定義各模組之間的互動方式：

| 來源模組 | 觸發行為 | 目標 Scene | 備註 |
|-----------|-----------|-------------|------|
| 事件列表 (Incidents List) | 點擊事件行 | 事件詳情 Scene | 使用 SceneVariable: `incidentId` |
| 告警規則 (Alert Rules) | 編輯按鈕 | 告警編輯 Scene | 自動載入規則配置 |
| 自動化任務 (Automation) | 查看紀錄 | 執行日誌 Scene | 由 `playbookId` 決定資料來源 |
| 資源拓撲 (Resources) | 手動刷新 | 資源更新 Scene | 支援 WebSocket + Polling 模式 |
| 通知策略 (Notifications) | 衝突檢查 | 策略檢視 Scene | 以優先級決定顯示層 |

---

## 四、資料流封裝 (Scene Dataflow)

Scenes 架構的資料流規範如下：

- 所有資料流以 `SceneQueryRunner` 驅動  
- 篩選條件統一由 `SceneVariableSet` 管理  
- 共用變數（timeRange、tenantId、filters）由 `SceneAppProvider` 掛載  
- 錯誤狀態由 `SceneStatusHandler` 處理  
- 事件通知與更新狀態由 `SceneEventBus` 廣播  
- 當後端異常時，場景自動進入「降級模式」顯示暫停訊息  

---

## 五、Scenes 模組升級路線圖

| 階段 | 任務 | 產出 |
|------|------|------|
| **Phase 1** | 將現有頁面封裝為 `SceneAppPage` | 各模組具獨立資料流 |
| **Phase 2** | 整合共用變數與全域狀態 | `SceneApp` 雛形形成 |
| **Phase 3** | 導入 `SceneRouter` 並實現跨模組導航 | 統一頁面切換邏輯 |
| **Phase 4** | 整合 AI 模組與自動生成 Scene 結構 | 支援智慧化介面組成 |

---

## 六、驗收與風險

### 驗收條件
- 各 Scene 模組能獨立運作並維持資料流閉環  
- API 契約穩定且可由前端自動映射  
- 主題切換與 SceneVariable 同步正確  
- 所有交互皆由狀態控制而非 DOM 事件  

### 潛在風險
| 項目 | 風險 | 緩解措施 |
|------|------|----------|
| 資料流重構不一致 | 高 | 優先封裝 QueryRunner，統一資料契約 |
| 狀態同步延遲 | 中 | 導入 SceneEventBus 並加上防抖 |
| 轉換期間頁面重繪 | 中 | 分批遷移模組並使用骨架屏 |
| API 格式變動 | 中 | 建立 versioned config schema |

---

## 七、結語

本文件為 Scenes 架構版本的最終解決方案建議書，  
作為舊版前端規格的收斂與新架構的統一依據。  

所有前端行為已抽象化為：
- **SceneAppPage 模組行為**
- **資料流封裝**
- **狀態驅動渲染邏輯**

未來所有更新與審查，皆應以此文件作為 Scenes 架構的實施標準基礎。
