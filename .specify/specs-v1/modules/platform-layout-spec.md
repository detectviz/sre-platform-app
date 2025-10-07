# 功能規格書(Feature Specification)

**模組名稱 (Module)**: 版面設定
**類型 (Type)**: Module
**來源路徑 (Source Path)**: pages/settings/platform/LayoutSettingsPage.tsx
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md`

---

## 一、主要使用者情境(User Scenarios & Testing)

### 主要使用者故事(Primary User Story)
管理員需要配置系統版面設定,包含 Logo、標題、主題色、導覽選單等,客製化平台外觀。

### 驗收情境(Acceptance Scenarios)
1. **Given** 管理員上傳 Logo,**When** 選擇圖片並儲存,**Then** 系統應更新並即時顯示於導覽列
2. **Given** 管理員修改主題色,**When** 選擇顏色並儲存,**Then** 系統應更新 CSS 變數並即時生效
3. **Given** 管理員調整導覽選單,**When** 拖曳排序或隱藏項目,**Then** 系統應更新並即時反映於側邊欄

### 邊界案例(Edge Cases)
- 當 Logo 圖片過大時,應自動壓縮或提示大小限制
- 當主題色對比度不足時,應警告並建議調整
- 當隱藏所有導覽項目時,應拒絕並保留至少一個

---

## 二、功能需求(Functional Requirements)

- **FR-001**: 系統必須(MUST)支援 Logo 上傳與顯示設定。
- **FR-002**: 系統必須(MUST)支援系統標題與副標題設定。
- **FR-003**: 系統應該(SHOULD)支援主題色設定,即時預覽與套用。
- **FR-004**: 系統應該(SHOULD)支援導覽選單自訂,含排序、隱藏、重新命名。
- **FR-005**: 系統可以(MAY)支援多套版面配置,依團隊或使用者切換。

---

## 三、關鍵資料實體(Key Entities)
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| LayoutConfig | 版面配置 | 系統級設定 |
| ThemeCustomization | 主題自訂設定 | 屬於 LayoutConfig |
| NavigationMenu | 導覽選單配置 | 屬於 LayoutConfig |

---

## 四、觀測性與治理檢查(Observability & Governance Checklist)

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 記錄所有設定變更事件 |
| 指標與告警 (Metrics & Alerts) | ⚠️ | 追蹤設定變更頻率,無即時指標 |
| RBAC 權限與審計 | ✅ | 僅管理員可修改平台設定 |
| i18n 文案 | ✅ | 設定項目標籤與說明支援多語言 |
| Theme Token 使用 | ✅ | 表單與狀態標籤使用語義色 |

---

## 五、審查與驗收清單(Review & Acceptance Checklist)

- [ ] 無技術實作語句。
- [ ] 所有必填段落皆存在。
- [ ] 所有 FR 可測試且明確。
- [ ] 無未標註的模糊需求。
- [ ] 符合 `.specify/memory/constitution.md`。

---

## 六、主題色變更的即時生效機制 (Theme Color Live Preview)

### 6.1 生效策略: CSS Variables 動態更新 (即時預覽)

**實作方式**: 修改 CSS 自訂屬性 (CSS Custom Properties)

### 6.2 主題色設定流程

```
1. 管理員選擇主題色
2. (可選) 啟用即時預覽模式
3. 計算相關色階 (50-900)
4. 更新 CSS Variables
5. 更新 Ant Design 主題配置
6. 點擊「儲存」確認變更
7. 儲存至後端 + LocalStorage
```

### 6.3 即時預覽 UI

```
┌─────────────────────────────────────┐
│ 主題色設定                          │
├─────────────────────────────────────┤
│ 主題色: [🎨 #0284C7]                │
│                                     │
│ ☑ 即時預覽                          │
│                                     │
│ ┌───────────────────────────────┐   │
│ │ ℹ️ 預覽模式                    │   │
│ │ 目前正在預覽主題色效果          │   │
│ │ 點擊「儲存」套用變更            │   │
│ └───────────────────────────────┘   │
├─────────────────────────────────────┤
│ 色階預覽:                           │
│ ■ 50  ■ 100 ■ 200 ■ 300 ■ 400      │
│ ■ 500 ■ 600 ■ 700 ■ 800 ■ 900      │
├─────────────────────────────────────┤
│           [取消]  [儲存]            │
└─────────────────────────────────────┘
```

### 6.4 CSS Variables 更新

**Root 變數定義**:
```css
:root {
  --color-primary: #0284C7;
  --color-primary-hover: #0369A1;
  --color-primary-active: #075985;
  --color-primary-light: #E0F2FE;
}
```

**動態更新**:
```typescript
const applyThemeColor = (color: string) => {
  const colors = generateColorPalette(color);

  const root = document.documentElement;
  root.style.setProperty('--color-primary', colors[600]);
  root.style.setProperty('--color-primary-hover', colors[700]);
  root.style.setProperty('--color-primary-active', colors[800]);
  root.style.setProperty('--color-primary-light', colors[100]);

  // 更新 Ant Design 主題
  ConfigProvider.config({
    theme: { token: { colorPrimary: color } }
  });
};
```

### 6.5 色階生成邏輯

使用 Color 函式庫生成完整色階:

| 色階 | 計算方式 | 用途 |
|------|---------|------|
| 50 | lighten(0.4) | 極淺背景 |
| 100 | lighten(0.3) | 淺色背景 |
| 200 | lighten(0.2) | 次要背景 |
| 300 | lighten(0.1) | 邊框色 |
| 400 | lighten(0.05) | 淺色文字 |
| **500** | **base** | **基礎主題色** |
| 600 | darken(0.05) | 主要按鈕 |
| 700 | darken(0.1) | Hover 狀態 |
| 800 | darken(0.2) | Active 狀態 |
| 900 | darken(0.3) | 深色文字 |

### 6.6 Tailwind 整合

```css
/* globals.css */
:root {
  --color-primary: #0284C7;
  --color-primary-hover: #0369A1;
  --color-primary-active: #075985;
  --color-primary-light: #E0F2FE;
}

/* Tailwind 工具類別 */
@layer utilities {
  .bg-primary { background-color: var(--color-primary); }
  .text-primary { color: var(--color-primary); }
  .border-primary { border-color: var(--color-primary); }
}
```

### 6.7 載入時恢復主題色

```typescript
// App.tsx 初始化
useEffect(() => {
  const savedColor = localStorage.getItem('theme-color') || '#0284C7';
  applyThemeColor(savedColor);
}, []);
```

### 6.8 前後端分工

| 項目 | 前端 | 後端 |
|------|------|------|
| CSS Variables 更新 | ✅ | - |
| 色階生成 | ✅ | - |
| 即時預覽 UI | ✅ | - |
| Ant Design 主題配置 | ✅ | - |
| LocalStorage 儲存 | ✅ | - |
| 主題色設定儲存 | - | ✅ |
| 主題色載入 | - | ✅ |

---

## 七、模糊與待確認事項(Clarifications)

- [NEEDS CLARIFICATION: Logo 圖片的格式與大小限制]
- ✅ ~~[NEEDS CLARIFICATION: 主題色變更的即時生效機制]~~ → **已解決: 採用 CSS Variables 動態更新,支援即時預覽,點擊儲存確認變更**

---

## 八、決策記錄 (Decision Records)

### DR-001: 主題色即時生效機制

**決策日期**: 2025-10-06
**決策依據**: `_resolution-plan-phase2.md` § 3.2.1
**決策者**: Spec Architect

**決策內容**:
- 採用 CSS Variables 動態更新
- 支援即時預覽模式
- 自動生成色階 (50-900)
- 點擊「儲存」確認變更

**理由**:
- 提升使用者體驗,所見即所得
- CSS Variables 實作簡單,效能優異
- 無需重新整理頁面即可預覽效果

**前後端分工**:
- 前端: CSS Variables 更新、色階生成、即時預覽 UI
- 後端: 主題色設定儲存與載入
