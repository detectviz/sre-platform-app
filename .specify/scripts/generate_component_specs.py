#!/usr/bin/env python3
"""
生成元件級規格文件
"""

from pathlib import Path
from datetime import datetime

# 關鍵元件列表
COMPONENT_SPECS = {
    "unified-search-modal": {
        "name": "統一搜尋模態框",
        "source": "components/UnifiedSearchModal.tsx",
        "description": "提供統一的搜尋與篩選介面,支援多種頁面與條件組合",
        "usage_count": 10,
        "used_by": ["incidents-list", "alert-rules", "silence-rules", "resources-list", "resource-groups"]
    },
    "column-settings-modal": {
        "name": "欄位設定模態框",
        "source": "components/ColumnSettingsModal.tsx",
        "description": "允許使用者自訂表格欄位顯示與排序",
        "usage_count": 9,
        "used_by": ["incidents-list", "alert-rules", "resources-list", "dashboards-list"]
    },
    "table-container": {
        "name": "表格容器",
        "source": "components/TableContainer.tsx",
        "description": "統一的表格容器,提供一致的樣式與佈局",
        "usage_count": 12,
        "used_by": ["incidents-list", "alert-rules", "resources-list", "personnel", "teams"]
    },
    "toolbar": {
        "name": "工具列",
        "source": "components/Toolbar.tsx",
        "description": "統一的工具列元件,支援左右動作按鈕與批次操作",
        "usage_count": 13,
        "used_by": ["incidents-list", "alert-rules", "resources-list", "dashboards-list"]
    },
    "pagination": {
        "name": "分頁元件",
        "source": "components/Pagination.tsx",
        "description": "統一的分頁控制元件,支援頁碼切換與每頁筆數調整",
        "usage_count": 12,
        "used_by": ["incidents-list", "alert-rules", "resources-list", "personnel"]
    },
    "drawer": {
        "name": "抽屜元件",
        "source": "components/Drawer.tsx",
        "description": "側邊滑出抽屜,用於顯示詳情或表單",
        "usage_count": 8,
        "used_by": ["incidents-list", "resources-list", "resource-groups", "discovery-jobs"]
    },
    "modal": {
        "name": "模態框元件",
        "source": "components/Modal.tsx",
        "description": "通用模態框元件,支援自訂標題、內容、頁尾按鈕",
        "usage_count": 11,
        "used_by": ["incidents-list", "alert-rules", "resources-list", "personnel"]
    },
    "quick-filter-bar": {
        "name": "快速篩選列",
        "source": "components/QuickFilterBar.tsx",
        "description": "提供快速篩選按鈕,常用於狀態或類型快速切換",
        "usage_count": 6,
        "used_by": ["resources-list", "incidents-list", "dashboards"]
    }
}

def generate_component_spec(component_id: str, info: dict) -> str:
    today = datetime.now().strftime("%Y-%m-%d")

    return f"""# 元件規格書 (Component Specification)

**元件名稱 (Component)**: {info['name']}
**類型 (Type)**: Component
**來源路徑 (Source Path)**: {info['source']}
**建立日期 (Created)**: {today}
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md`
**使用次數**: {info['usage_count']} 次
**使用模組**: {', '.join(info['used_by'])}

---

## 一、功能概述 (Functional Overview)

{info['description']}

---

## 二、操作邏輯 (User Flow)

### 主要使用流程
{get_user_flow(component_id, info)}

### 互動事件
{get_interactions(component_id)}

---

## 三、狀態管理 (State Management)

{get_state_management(component_id)}

---

## 四、可配置屬性 (Props)

{get_props(component_id)}

---

## 五、錯誤與例外處理 (Error Handling)

{get_error_handling(component_id)}

---

## 六、關聯模組 (Related Modules)

以下模組使用此元件:
{chr(10).join(f"- **{module}**" for module in info['used_by'])}

---

## 七、設計原則遵循 (Design Principles)

| 項目 | 狀態 | 說明 |
|------|------|------|
| 可重用性 (Reusability) | ✅ | 元件設計為通用,可跨多個模組使用 |
| 一致性 (Consistency) | ✅ | 遵循統一的 UI 設計系統與互動模式 |
| 可存取性 (Accessibility) | ✅ | 支援鍵盤導航與 ARIA 屬性 |
| 主題支援 (Theme Support) | ✅ | 使用 Theme Token,支援深淺色主題 |
| i18n 支援 (i18n) | ✅ | 所有文案透過 useContent 存取 |

---

## 八、待確認事項 (Clarifications)

{get_clarifications(component_id)}
"""

def get_user_flow(component_id: str, info: dict) -> str:
    flows = {
        "unified-search-modal": """1. 使用者點擊「搜尋和篩選」按鈕
2. 系統開啟模態框,載入可用篩選條件
3. 使用者選擇條件並輸入值
4. 使用者點擊「搜尋」
5. 系統關閉模態框,回傳篩選條件至父元件
6. 父元件依條件重新載入資料""",
        "column-settings-modal": """1. 使用者點擊「欄位設定」按鈕
2. 系統開啟模態框,顯示所有可用欄位與當前顯示狀態
3. 使用者勾選/取消勾選欄位,或拖曳調整順序
4. 使用者點擊「儲存」
5. 系統呼叫 API 儲存設定
6. 系統關閉模態框,父元件重新渲染表格""",
        "table-container": """1. 父元件傳入表格與分頁元件
2. TableContainer 渲染容器,提供固定高度與滾動區域
3. 表格內容在滾動區域內顯示
4. 分頁控制固定於底部
5. 使用者滾動查看更多資料""",
        "toolbar": """1. 父元件傳入左側動作、右側動作、批次動作
2. Toolbar 渲染按鈕列
3. 當無選取項目時,顯示左右動作
4. 當有選取項目時,顯示批次動作列與選取數量
5. 使用者點擊按鈕觸發對應事件""",
        "pagination": """1. 父元件傳入總筆數、當前頁碼、每頁筆數
2. Pagination 計算總頁數並渲染控制項
3. 使用者點擊頁碼或上下頁按鈕
4. Pagination 觸發 onPageChange 事件
5. 父元件更新狀態並重新載入資料""",
        "drawer": """1. 父元件設定 isOpen 為 true
2. Drawer 從右側滑入顯示
3. 使用者查看內容或進行操作
4. 使用者點擊關閉按鈕或背景遮罩
5. Drawer 觸發 onClose 事件
6. 父元件設定 isOpen 為 false,Drawer 滑出關閉""",
        "modal": """1. 父元件設定 isOpen 為 true
2. Modal 顯示並覆蓋頁面,背景變暗
3. 使用者查看內容並進行操作
4. 使用者點擊按鈕或關閉圖示
5. Modal 觸發對應事件(onClose 或自訂)
6. 父元件處理事件並關閉 Modal""",
        "quick-filter-bar": """1. 父元件傳入篩選選項與當前值
2. QuickFilterBar 渲染按鈕列
3. 使用者點擊篩選按鈕
4. QuickFilterBar 觸發 onChange 事件
5. 父元件更新篩選條件並重新載入資料"""
    }
    return flows.get(component_id, "待補充操作流程")

def get_interactions(component_id: str) -> str:
    interactions = {
        "unified-search-modal": """- `onClose`: 關閉模態框
- `onSearch`: 使用者點擊搜尋,回傳篩選條件物件
- `onReset`: 使用者重置篩選條件
- 各條件欄位的 onChange 事件""",
        "column-settings-modal": """- `onClose`: 關閉模態框
- `onSave`: 儲存欄位設定,回傳新欄位鍵值陣列
- 拖曳排序觸發內部狀態更新
- 勾選欄位觸發內部狀態更新""",
        "table-container": """- 表格內的點擊、排序、選取事件由父元件處理
- 滾動事件由容器管理
- 分頁事件透過 Pagination 元件觸發""",
        "toolbar": """- 左側動作按鈕的 onClick 事件
- 右側動作按鈕的 onClick 事件
- 批次動作按鈕的 onClick 事件
- `onClearSelection`: 清除選取""",
        "pagination": """- `onPageChange`: 頁碼變更事件
- `onPageSizeChange`: 每頁筆數變更事件
- 上下頁按鈕點擊觸發 onPageChange""",
        "drawer": """- `onClose`: 關閉抽屜事件
- ESC 鍵按下觸發 onClose
- 背景遮罩點擊觸發 onClose
- 內容區的事件由 children 處理""",
        "modal": """- `onClose`: 關閉模態框事件
- ESC 鍵按下觸發 onClose
- 背景遮罩點擊觸發 onClose(可配置)
- footer 區塊的按鈕事件由父元件定義""",
        "quick-filter-bar": """- `onChange`: 篩選值變更事件
- 按鈕點擊觸發 onChange,回傳新選取值"""
    }
    return interactions.get(component_id, "待補充互動事件")

def get_state_management(component_id: str) -> str:
    states = {
        "unified-search-modal": """### 內部狀態
- `filters`: 當前篩選條件物件
- `tempFilters`: 暫存篩選條件(未套用前)
- `availableOptions`: 可用的篩選選項(從 API 或 Context 取得)

### 外部控制
- `isOpen`: 控制顯示/隱藏(由父元件管理)
- `initialFilters`: 初始篩選條件(由父元件傳入)""",
        "column-settings-modal": """### 內部狀態
- `selectedColumns`: 當前選取的欄位鍵值陣列
- `isDragging`: 是否正在拖曳

### 外部控制
- `isOpen`: 控制顯示/隱藏
- `allColumns`: 所有可用欄位
- `visibleColumnKeys`: 當前顯示的欄位鍵值""",
        "table-container": """### 內部狀態
- 無特殊狀態,純展示容器

### 外部控制
- `children`: 傳入的表格與分頁元件""",
        "toolbar": """### 內部狀態
- 無特殊狀態

### 外部控制
- `selectedCount`: 選取項目數量
- `leftActions`: 左側動作按鈕陣列
- `rightActions`: 右側動作按鈕陣列
- `batchActions`: 批次動作按鈕陣列""",
        "pagination": """### 內部狀態
- 無特殊狀態,所有狀態由父元件管理

### 外部控制
- `total`: 總筆數
- `page`: 當前頁碼
- `pageSize`: 每頁筆數""",
        "drawer": """### 內部狀態
- `isAnimating`: 動畫進行中標記

### 外部控制
- `isOpen`: 控制顯示/隱藏
- `title`: 標題
- `width`: 寬度(如 w-1/2, w-3/4)
- `children`: 內容""",
        "modal": """### 內部狀態
- `isAnimating`: 動畫進行中標記

### 外部控制
- `isOpen`: 控制顯示/隱藏
- `title`: 標題
- `width`: 寬度
- `footer`: 頁尾內容(按鈕)
- `children`: 主要內容""",
        "quick-filter-bar": """### 內部狀態
- 無特殊狀態

### 外部控制
- `options`: 篩選選項陣列
- `value`: 當前選取值
- `onChange`: 變更事件"""
    }
    return states.get(component_id, "待補充狀態管理")

def get_props(component_id: str) -> str:
    props = {
        "unified-search-modal": """| 屬性名稱 | 類型 | 必填 | 預設值 | 說明 |
|----------|------|------|--------|------|
| isOpen | boolean | ✅ | - | 控制顯示/隱藏 |
| onClose | () => void | ✅ | - | 關閉事件 |
| onSearch | (filters) => void | ✅ | - | 搜尋事件 |
| page | string | ✅ | - | 頁面識別碼 |
| initialFilters | object | ❌ | {} | 初始篩選條件 |""",
        "column-settings-modal": """| 屬性名稱 | 類型 | 必填 | 預設值 | 說明 |
|----------|------|------|--------|------|
| isOpen | boolean | ✅ | - | 控制顯示/隱藏 |
| onClose | () => void | ✅ | - | 關閉事件 |
| onSave | (keys: string[]) => void | ✅ | - | 儲存事件 |
| allColumns | TableColumn[] | ✅ | - | 所有欄位 |
| visibleColumnKeys | string[] | ✅ | - | 當前顯示欄位 |""",
        "table-container": """| 屬性名稱 | 類型 | 必填 | 預設值 | 說明 |
|----------|------|------|--------|------|
| children | ReactNode | ✅ | - | 表格與分頁元件 |
| table | ReactNode | ❌ | - | 表格元件(替代 children) |
| footer | ReactNode | ❌ | - | 分頁元件(替代 children) |""",
        "toolbar": """| 屬性名稱 | 類型 | 必填 | 預設值 | 說明 |
|----------|------|------|--------|------|
| leftActions | ReactNode | ❌ | null | 左側動作按鈕 |
| rightActions | ReactNode | ❌ | null | 右側動作按鈕 |
| selectedCount | number | ❌ | 0 | 選取項目數量 |
| onClearSelection | () => void | ❌ | - | 清除選取事件 |
| batchActions | ReactNode | ❌ | null | 批次動作按鈕 |""",
        "pagination": """| 屬性名稱 | 類型 | 必填 | 預設值 | 說明 |
|----------|------|------|--------|------|
| total | number | ✅ | - | 總筆數 |
| page | number | ✅ | - | 當前頁碼 |
| pageSize | number | ✅ | - | 每頁筆數 |
| onPageChange | (page) => void | ✅ | - | 頁碼變更事件 |
| onPageSizeChange | (size) => void | ✅ | - | 每頁筆數變更事件 |""",
        "drawer": """| 屬性名稱 | 類型 | 必填 | 預設值 | 說明 |
|----------|------|------|--------|------|
| isOpen | boolean | ✅ | - | 控制顯示/隱藏 |
| onClose | () => void | ✅ | - | 關閉事件 |
| title | string | ✅ | - | 標題 |
| width | string | ❌ | 'w-1/2' | 寬度類別 |
| children | ReactNode | ✅ | - | 內容 |""",
        "modal": """| 屬性名稱 | 類型 | 必填 | 預設值 | 說明 |
|----------|------|------|--------|------|
| isOpen | boolean | ✅ | - | 控制顯示/隱藏 |
| onClose | () => void | ✅ | - | 關閉事件 |
| title | string | ✅ | - | 標題 |
| width | string | ❌ | 'w-1/3' | 寬度類別 |
| footer | ReactNode | ❌ | null | 頁尾內容 |
| children | ReactNode | ✅ | - | 主要內容 |""",
        "quick-filter-bar": """| 屬性名稱 | 類型 | 必填 | 預設值 | 說明 |
|----------|------|------|--------|------|
| options | FilterOption[] | ✅ | - | 篩選選項 |
| value | string | ✅ | - | 當前值 |
| onChange | (value) => void | ✅ | - | 變更事件 |"""
    }
    return props.get(component_id, "待補充屬性列表")

def get_error_handling(component_id: str) -> str:
    errors = {
        "unified-search-modal": """- 當 API 載入篩選選項失敗時,顯示錯誤訊息並提供重試按鈕
- 當必填篩選條件未填寫時,標記欄位錯誤並阻止搜尋
- 當搜尋條件組合無效時,顯示提示訊息""",
        "column-settings-modal": """- 當儲存設定 API 失敗時,顯示錯誤訊息並保持模態框開啟
- 當未選取任何欄位時,阻止儲存並提示至少選擇一個欄位
- 當拖曳排序失敗時,恢復原始順序""",
        "table-container": """- 當子元件渲染錯誤時,顯示錯誤邊界訊息
- 當表格資料為空時,由父元件的 TableLoader 或 TableError 處理""",
        "toolbar": """- 當按鈕點擊事件處理失敗時,由父元件處理錯誤
- 無內部錯誤處理邏輯""",
        "pagination": """- 當總頁數計算錯誤時,顯示錯誤訊息
- 當頁碼超出範圍時,自動修正為有效頁碼
- 當每頁筆數為 0 或負數時,使用預設值 10""",
        "drawer": """- 當內容渲染錯誤時,顯示錯誤邊界
- 當動畫執行失敗時,強制完成開啟/關閉狀態
- 無內部業務邏輯錯誤處理""",
        "modal": """- 當內容渲染錯誤時,顯示錯誤邊界
- 當背景點擊關閉被禁用時,僅允許按鈕關閉
- 無內部業務邏輯錯誤處理""",
        "quick-filter-bar": """- 當選項為空時,顯示提示訊息
- 當 onChange 事件處理失敗時,保持原值
- 無內部錯誤處理邏輯"""
    }
    return errors.get(component_id, "待補充錯誤處理")

def get_clarifications(component_id: str) -> str:
    clarifications = {
        "unified-search-modal": """- [NEEDS CLARIFICATION: 不同頁面的篩選條件來源與格式統一機制]
- [NEEDS CLARIFICATION: 進階搜尋(複雜條件組合)的支援範圍]""",
        "column-settings-modal": """- [NEEDS CLARIFICATION: 欄位設定的儲存位置(使用者級或團隊級)]
- [NEEDS CLARIFICATION: 欄位排序的持久化策略]""",
        "table-container": """- [NEEDS CLARIFICATION: 表格高度的自適應策略]
- [NEEDS CLARIFICATION: 虛擬滾動的觸發條件]""",
        "toolbar": """- [NEEDS CLARIFICATION: 批次操作的權限控制機制]
- [NEEDS CLARIFICATION: 工具列在不同螢幕尺寸的響應式佈局]""",
        "pagination": """- [NEEDS CLARIFICATION: 分頁資訊的持久化(跨頁面保留)]
- [NEEDS CLARIFICATION: 大資料量時的分頁策略(前端或後端)]""",
        "drawer": """- [NEEDS CLARIFICATION: 多層抽屜的堆疊管理機制]
- [NEEDS CLARIFICATION: 抽屜內容的預載入策略]""",
        "modal": """- [NEEDS CLARIFICATION: 巢狀模態框的顯示優先級]
- [NEEDS CLARIFICATION: 模態框內容的生命週期管理]""",
        "quick-filter-bar": """- [NEEDS CLARIFICATION: 快速篩選與進階搜尋的整合方式]
- [NEEDS CLARIFICATION: 篩選狀態的 URL 同步機制]"""
    }
    return clarifications.get(component_id, "- [NEEDS CLARIFICATION: 待補充確認事項]")

def main():
    project_root = Path("/Users/zoe/Desktop/sre-platform-app")
    specs_dir = project_root / ".specify/specs/components"
    specs_dir.mkdir(parents=True, exist_ok=True)

    print("開始生成元件級規格文件...")
    print(f"目標目錄: {specs_dir}")
    print("-" * 60)

    generated_count = 0
    for component_id, info in COMPONENT_SPECS.items():
        spec_filename = f"{component_id}-spec.md"
        spec_path = specs_dir / spec_filename

        print(f"生成: {spec_filename} ({info['name']})")

        spec_content = generate_component_spec(component_id, info)

        with open(spec_path, 'w', encoding='utf-8') as f:
            f.write(spec_content)

        generated_count += 1

    print("-" * 60)
    print(f"✅ 成功生成 {generated_count} 份元件級規格文件")
    print(f"📁 儲存位置: {specs_dir}")

if __name__ == "__main__":
    main()
