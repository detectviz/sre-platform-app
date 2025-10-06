# 功能規格書(Feature Specification)

**模組名稱 (Module)**: 偏好設定
**類型 (Type)**: Module
**來源路徑 (Source Path)**: pages/profile/PreferenceSettingsPage.tsx
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md`

---

## 一、主要使用者情境(User Scenarios & Testing)

### 主要使用者故事(Primary User Story)
使用者需要設定個人偏好,包含語言、時區、主題、通知偏好等,客製化使用體驗。

### 驗收情境(Acceptance Scenarios)
1. **Given** 使用者進入偏好設定頁面,**When** 系統載入資料,**Then** 應顯示當前語言、時區、主題、通知偏好
2. **Given** 使用者切換語言,**When** 選擇語言並儲存,**Then** 系統應更新並即時切換介面語言
3. **Given** 使用者調整通知偏好,**When** 勾選或取消通知類型,**Then** 系統應更新並影響後續通知發送

### 邊界案例(Edge Cases)
- 當切換時區時,應即時更新所有時間顯示
- 當停用所有通知時,應警告並確認是否繼續
- 當主題設定與系統衝突時,應提供覆寫選項

---

## 二、功能需求(Functional Requirements)

- **FR-001**: 系統必須(MUST)支援語言設定,即時切換介面語言。
- **FR-002**: 系統必須(MUST)支援時區設定,即時更新時間顯示。
- **FR-003**: 系統應該(SHOULD)支援主題設定(淺色/深色/自動)。
- **FR-004**: 系統應該(SHOULD)支援通知偏好,勾選接收的通知類型與渠道。
- **FR-005**: 系統可以(MAY)支援介面密度設定(緊湊/標準/寬鬆)。

---

## 三、關鍵資料實體(Key Entities)
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| UserPreference | 使用者偏好設定 | 屬於 User |
| NotificationPreference | 通知偏好 | 屬於 UserPreference |

---

## 四、觀測性與治理檢查(Observability & Governance Checklist)

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 記錄設定變更事件 |
| 指標與告警 (Metrics & Alerts) | ⚠️ | 追蹤設定變更頻率,無即時指標 |
| RBAC 權限與審計 | ✅ | 使用者僅可修改自己的設定 |
| i18n 文案 | ✅ | 所有設定項目支援多語言 |
| Theme Token 使用 | ✅ | 表單與狀態使用語義色 |

---

## 五、審查與驗收清單(Review & Acceptance Checklist)

- [ ] 無技術實作語句。
- [ ] 所有必填段落皆存在。
- [ ] 所有 FR 可測試且明確。
- [ ] 無未標註的模糊需求。
- [ ] 符合 `.specify/memory/constitution.md`。

---

## 五、語言切換的即時生效範圍 (Language Switch Scope)

### 5.1 生效策略: 即時生效 (無需重新整理)

**實作方式**: React Context + i18n 熱更新

### 5.2 即時生效範圍

| 項目 | 生效方式 | 說明 |
|------|---------|------|
| ✅ **UI 文案** | i18n Context 自動更新 | 所有使用 `useTranslation()` 的元件 |
| ✅ **動態內容** | i18n `t()` 函式 | 使用翻譯函式的文字 |
| ✅ **日期格式** | dayjs locale 同步更新 | 切換語言時同步更新 |
| ✅ **數字格式** | Intl.NumberFormat | 根據語言調整格式 |
| ✅ **Ant Design 元件** | ConfigProvider locale | 同步更新組件庫語言 |
| ❌ **後端回傳文字** | 需重新載入資料 | 呼叫 API 重新取得 |

### 5.3 實作流程

```
1. 使用者選擇新語言
2. 更新 i18n.changeLanguage(lang)
3. 儲存至 LocalStorage
4. 同步至後端 (使用者偏好)
5. 更新 dayjs locale
6. 更新 Ant Design locale
7. 顯示成功提示
8. (可選) 重新載入包含後端文字的資料
```

### 5.4 語言設定

**支援語言**:
- `zh-TW`: 繁體中文
- `en-US`: English
- `ja-JP`: 日本語

**預設語言**: 繁體中文 (`zh-TW`)

### 5.5 日期格式同步

語言切換時,自動同步 dayjs locale:

| 語言 | dayjs Locale | 日期格式範例 |
|------|-------------|-------------|
| zh-TW | `zh-tw` | 2025年10月6日 |
| en-US | `en` | October 6, 2025 |
| ja-JP | `ja` | 2025年10月6日 |

### 5.6 特殊情況處理

**包含後端文字的頁面**:
- 通知列表 (後端回傳的通知內容)
- 審計日誌 (後端回傳的操作描述)
- 系統訊息 (後端回傳的訊息內容)

**處理方式**:
```typescript
const handleLanguageChange = async (lang: string) => {
  // 1. 更新 i18n
  await i18n.changeLanguage(lang);

  // 2. 同步 dayjs locale
  dayjs.locale(dayjsLocaleMap[lang]);

  // 3. 同步 Ant Design locale
  ConfigProvider.config({ locale: antdLocaleMap[lang] });

  // 4. 重新載入包含後端文字的資料
  refetch(); // 使用 React Query refetch

  // 5. 顯示提示
  showToast('語言已切換', 'success');
};
```

### 5.7 前後端分工

| 項目 | 前端 | 後端 |
|------|------|------|
| i18n 熱更新 | ✅ | - |
| dayjs locale 同步 | ✅ | - |
| Ant Design locale 同步 | ✅ | - |
| LocalStorage 儲存 | ✅ | - |
| 使用者偏好儲存 | - | ✅ |
| 多語言內容提供 | - | ✅ |

---

## 六、模糊與待確認事項(Clarifications)

- ✅ ~~[NEEDS CLARIFICATION: 語言切換的即時生效範圍]~~ → **已解決: 採用 React Context + i18n 熱更新,即時生效無需重新整理,後端文字需重新載入**
- ✅ ~~[NEEDS CLARIFICATION: 通知偏好的優先級與策略繼承]~~ → **已解決: 參見 `_backend-parameters-spec.md` § 5.1**

---

## 七、決策記錄 (Decision Records)

### DR-001: 語言切換即時生效

**決策日期**: 2025-10-06
**決策依據**: `_resolution-plan-phase2.md` § 3.1.1
**決策者**: Spec Architect

**決策內容**:
- 採用 React Context + i18n 熱更新
- 無需重新整理頁面即可切換語言
- 同步更新 dayjs 與 Ant Design locale
- 後端文字需重新載入資料

**理由**:
- 提升使用者體驗
- 減少頁面重新整理的中斷感
- 確保所有元件即時更新

**前後端分工**:
- 前端: i18n 熱更新、locale 同步、LocalStorage 儲存
- 後端: 使用者偏好儲存、多語言內容提供
