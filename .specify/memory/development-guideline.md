# 開發指導原則（Development Guideline）

## 一、總體方向：Spec-driven Frontend Development

本專案目前採取 **前端正式開發、後端暫緩（Mock-based）** 策略。  
所有實作皆以 `/specs` 目錄內的規格文件為唯一事實來源（Single Source of Truth）。

### 原則摘要
1. **前端為正式實作（Production-grade Frontend）**  
   - 前端開發以 Grafana UI / Scenes SDK 為核心，React 為基礎。  
   - 所有頁面、元件、表單與狀態皆需可實際執行、可交互。  
   - 開發目標為可直接整合未來後端，不為臨時 MVP。

2. **後端暫緩、以 Mock Server 模擬**  
   - 暫不開發實際 API、資料庫或驗證邏輯。  
   - 所有資料交換以 Mock Server (`/mock/api`) 實現。  

3. **最小可行原則（Minimum Viable Implementation）**  
   - 僅開發展示核心行為的必要功能。  
   - 延伸特性標註 `[FUTURE]`。  
   - 嚴禁 overdesign（不建立抽象層、不擴充多模組架構、不提前優化）。

---

## 二、開發策略

### 1. 前端實作範圍
- 完整實作畫面、互動、驗證、UI 狀態。  
- 模擬所有 API 呼叫、資料綁定、錯誤回應與狀態變化。  
- 規格變更時，立即更新 Mock 與 UI 行為以保持一致。  

### 2. 後端模擬範圍
- 所有 `/mock/api` 端點對應 specs 合約。  
- 允許使用靜態 JSON 或函式回傳模擬資料。  
- 不涉及真實資料庫、認證、或外部服務。  

### 3. 驗收條件
| 項目 | 驗收標準 |
|------|-----------|
| UI 完整性 | 所有頁面可實際操作，符合 specs 行為定義 |
| 資料流一致性 | Mock API 與 spec.md 中的關鍵資料實體定義完全對齊 |
| 可維護性 | 程式結構簡潔、無重複邏輯、無過度封裝 |
| 文件同步性 | `/specs` 為唯一事實來源，代碼與文件一致 |
| 延伸彈性 | 未來後端接入時無需重構前端 |

---

## 三、開發哲學

> **Spec → Mock → UI → Backend**

1. 所有功能設計皆以 `/specs` 文件為出發點。  
2. Mock 僅為過渡層，目的在於支撐 UI 實作與互動驗證。  
3. 前端實作為正式產品一部分，而非暫時性 MVP。  
4. 保持簡潔、可驗證、可展示。

---

## 四、文件與規範

- 所有規格文件（`spec.md`）包含完整的功能需求、資料實體、權限控制與技術實現細節。  
- 技術實現細節包含數據存儲策略、API 端點定義與外部系統整合規範。  
- AI 或人工撰寫的開發文件須附註：
  > **開發模式：Spec-driven Frontend Implementation (Mock-based)**  
  > 後端暫緩，僅以 Mock Server 驗證資料流與互動。

---

## 五、執行流程

```text
/specs/*.md
    ↓ 解析功能需求、資料實體與技術實現細節
mock-generator
    ↓ 建立 /mock/api 對應端點（遵循 API 端點定義）
frontend/
    ↓ 實作 React + Grafana UI 畫面
整合測試（Mock 驗證）
    ↓ 驗證與技術實現細節的一致性
```

---

## 六、結語

> 本專案遵循「前端正式實作、後端暫緩」的策略。  
> 所有開發以 Specs 為核心，以 Mock Server 驗證互動，  
> 並嚴守最小可行原則，避免過度設計。