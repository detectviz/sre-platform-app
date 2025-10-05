# 前端架構總覽報告

## 1. 專案架構概觀

* **技術棧**
    
    * React + TypeScript（大量 `.tsx`，246 檔）
        
    * Vite（`vite.config.ts`）
        
    * Ant Design reset（`index.css` 引入 `antd/dist/reset.css`）
        
    * Tailwind via CDN（`index.html` 以 `<script src="https://cdn.tailwindcss.com">` 載入）
        
    * ECharts via CDN
        
    * dayjs、axios
        
* **目錄**
    
    * `pages/`（頁面，約 42 檔）
        
    * `components/`（共用元件，約 70 檔）
        
    * `contexts/`（7 檔）
        
    * `hooks/`（2 檔：`useTableSorting`、`useLogOptions`）
        
    * `services/`（3 檔：`api`, `toast`, `export`）
        
    * `utils/`（工具）
        
    * `mock-server/`（模擬 API）
        
    * `index.html` 定義 **glass-card** 樣式與深/淺主題 CSS 變數
        
* **資料量概要**
    
    * 總檔案：~341
        
    * `.tsx`：246
        
    * `.ts`：30
        
    * `.js`：26
        
    * `.json`：10
        

**整體結構評語**  
頁面/元件/服務分層清楚。以頁面為單位組裝 UI，透過少量 Hook、Context 共享狀態與選項。Mock server 補齊資料來源。樣式主軸為 Tailwind + 自訂 CSS 變數（glass-*），AntD 僅用 reset 與少數心智模型。

* * *

## 2. 技術棧分析

* **建置與執行**
    
    * Scripts：`vite dev/build/preview`、`mock-server`
        
    * 依賴精簡，無 ESLint/Prettier 設定檔
        
* **UI/樣式**
    
    * Tailwind class 大量使用（例如 `bg-slate-*/text-slate-*`）
        
    * `index.html` 以 CSS 變數管理「玻璃化」卡片與主題底色
        
    * 未見 AntD 元件系統化使用（以自製元件為主）
        
* **資料與 API**
    
    * `services/api.ts` 封裝 axios。所有路由前綴自動補 `/api/v1`
        
    * `OptionsContext` 載入各種選項（狀態、類別、顏色 class）供頁面使用
        
* **圖表**
    
    * 透過全域 CDN 注入 ECharts
        
* **TypeScript 使用**
    
    * 發現 **`: any` 約 226 處**。型別涵蓋度尚可，但仍有相當比例逃逸
        

* * *

## 3. 架構與設計一致性

### 3.1 組件層級劃分

* **呈現層**：多數頁面直寫 `<table>` 與 Tailwind class。共用元件如 `TableContainer`, `StatusTag`, `Toolbar`, `IconButton`, `Pagination`, `Modal/Drawer` 已存在。
    
* **邏輯層**：`useTableSorting` 統一排序；`OptionsContext` 提供狀態/枚舉/樣式描述；`PageMetadataContext` 提供欄位設定 key。
    
* **服務層**：`api.ts`、`toast.ts`、`export.ts` 單一職責清楚。
    

**評語**  
基本分層合理。表格與操作列高度重複，已抽象出部分共用元件，但不同頁面仍有大量局部實作差異。

### 3.2 狀態管理與 API 模式

* **列表頁模式固定**：`Toolbar` → `TableContainer` → `Pagination`。
    
* **欄位配置**：`ColumnSettingsModal` + `/settings/column-config/{key}`。頁面以 `pageKey` 決定可見欄位。
    
* **排序**：一致採 `useTableSorting`，但表頭元件分為 `SortableHeader` 與 `SortableColumnHeaderCell` 兩套。
    
* **篩選**：有頁面使用 `QuickFilterBar`（如執行歷史），有頁面未用（如 Playbooks）。
    

**評語**  
模式趨近一致，但**表頭排序元件、快速篩選使用**尚未統一到單一路徑。

### 3.3 UI/UX 統一性

* **表格樣式**：絕大多數為 `text-slate-300`、`bg-slate-800/50` header、`border-slate-800` 行分隔、`hover:bg-slate-800/40`。  
    但在不同頁面仍見：
    
    * 外層容器是否加「圓角 + 邊框 + 半透明底」不一致
        
    * 滾動容器 class（`flex-1 overflow-y-auto` vs `h-full overflow-y-auto`）不一致
        
    * 行內 padding（`px-6 py-4` vs `px-4 py-3`）偶見差異
        
* **狀態標籤**：`StatusTag` 已統一 tone 與 class，但也存在頁面級覆蓋 class 的情形
    
* **KPI 卡**：有採用色票與「玻璃化」風格，趨勢與顏色規則在不同頁出現不同版本實作
    

**評語**  
視覺語言接近，但**表格容器與細節 spacing/hover/selected 行為**仍有頁面間微差。

### 3.4 命名規範與檔案組織

* 檔案命名多採 `PascalCasePage.tsx` 與 `Component.tsx`，一致性良好
    
* 以功能域分目錄（`pages/settings/...`、`pages/automation/...`、`pages/dashboards/...`），清楚
    
* 共用元件集中於 `components/`，但**表格/表頭/操作列**存在兩到三個變體
    

* * *

## 4. 程式品質與風險

### 4.1 硬編碼比例

* **文案**：大量中文字串直接寫在頁面與元件內（錯誤訊息、按鈕文字、標題、篩選選項）
    
* **顏色**：大量 Tailwind 顏色 class（`text-slate-*`, `bg-*-*/xx`）直接混用；同時也有 `index.html` 的 CSS 變數（glass-*）。兩種系統並存
    
* **枚舉/狀態值**：部份頁面改用 `OptionsContext` 的 descriptors，但仍有頁面直寫字串（如 trigger/status 文案、tooltip）
    

**風險**：i18n、主題切換、狀態擴充時需逐檔修，成本高。

### 4.2 重複邏輯 / 重複元件

* **表格**：專案內含 **26 個** `<table>` 實作；排序表頭元件至少 2 套；操作列樣式與寬度設定不一
    
* **載入/錯誤**：已統一到 `TableLoader/TableError`，此處一致性佳
    
* **KPI/色票**：存在多處局部邏輯（趨勢色、底色、陰影/透明度），未完全集中
    

**風險**：樣式與交互微差導致體驗不一致；維護成本升高。

### 4.3 錯誤處理與 Loading

* 多數列表頁：`isLoading` → `TableLoader`；錯誤→ `TableError`；成功→資料列
    
* `api.ts` 有 license 錯誤提示處理；其他錯誤以 `showToast` 分散觸發
    

**風險**：錯誤訊息多為硬字串；不同頁面的訊息文案與等級略有出入。

### 4.4 可測試性與型別覆蓋

* 使用 TypeScript，但 **`: any` 約 226**；部分 API 回傳型別以 `Promise<{data: T}>` 包裝，尚可
    
* 無 ESLint/Prettier 設定與檢查
    
* 無單元測試/端對端測試痕跡
    

**風險**：大型改動時易引入型別/語意錯誤，缺少靜態規範工具與測試網。

### 4.5 建置與執行環境

* Tailwind 與 ECharts 採 CDN 載入；React 也指向 CDN（`aistudiocdn.com`）
    
* `mock-server` 使用 Node + TS 編譯輸出到 `mock-server/dist`
    

**風險**：CDN 版本與本地型別可能漂移；離線或版本鎖定策略未見。

* * *

## 5. 專頁比對摘記

* **AutomationHistoryPage vs AutomationPlaybooksPage**
    
    * `Toolbar` 功能不同步（History 有搜尋/匯出，Playbooks 有新增/批刪）
        
    * 表頭排序元件不同（`SortableHeader` vs `SortableColumnHeaderCell`）
        
    * 內容滾動容器 class 不同（`flex-1` vs `h-full`）
        
    * 快速篩選（History 有 `QuickFilterBar`，Playbooks 無）
        
    * 其他表格樣式元素基本一致（header/hover/selected/padding）
        

* * *

## 6. 總體評價

| 面向 | 等級 | 說明 |
| --- | --- | --- |
| 架構完整度 | **B+** | 分層清楚，元件化良好，Mock 支撐研發流暢 |
| 模組一致性 | **B** | 列表頁相似但仍多變體；篩選/表頭/操作列尚未統一 |
| 可維護性 | **B-** | 硬編碼文案/顏色普遍；`: any` 次數偏高；無 Lint/Prettier |
| 擴充性 | **B** | Context 與 ColumnConfig 設計不錯；但色彩/表格樣式系統需整合 |

**關鍵觀察摘要（供 AI 全面優化與修正使用）**

1. **表格體系**：全專案 26 個 `<table>` 實作，排序表頭有兩套，行/容器樣式微差；需要「單一路徑的表格基底與表頭排序元件」。
    
2. **文案與色彩**：文案、顏色、枚舉仍多硬編碼；需要「集中化的 i18n 與 color token」，避免頁面級覆蓋。
    
3. **KPI/趨勢色**：多處分散邏輯；需要「統一色票與趨勢判斷規則」。
    
4. **工具規範**：缺少 ESLint/Prettier；`: any` 出現約 226 次；需要「靜態規範與型別強化」。
    
5. **功能一致性**：Automation 模組兩頁在篩選與排序表頭元件不一致；需要「功能與交互對齊」。
    
6. **CDN 依賴風險**：React/Tailwind/ECharts 走 CDN；需要「版本鎖定與本地型別對齊策略」。
    