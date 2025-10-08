# Feature Specification: Platform Tag Management

**模組代碼**: `platform-tag`
**模組層級**: 系統治理（跨模組基礎設施）
**憲法版本**: `.specify/memory/constitution.md` (v1.3.0)
**最後更新**: 2025-10-08
**狀態**: Ready for Technical Review

---

## 一、主要使用者情境（User Scenarios & Testing）

### Primary User Story

作為一名平台架構師、治理負責人或系統管理員，我需要一個集中化的標籤治理介面，讓我能夠：

1. **定義標籤綱要（Tag Schema）** — 建立、修改、刪除全平台統一的標籤定義，確保跨模組的一致性
2. **控制標籤類型與約束** — 設定標籤的資料類型（enum、text、boolean、reference）、適用範圍（resources、users、incidents）、是否必填
3. **管理標籤權限** — 限制關鍵標籤（如合規標籤）僅特定角色可修改，避免誤操作
4. **建立階層化標籤** — 支援父子關聯的標籤結構（例如：組織架構、業務分類），實現層級化管理
5. **批次管理標籤** — 匯入/匯出標籤綱要（CSV），批次建立或刪除標籤定義

### 具體情境（Specific Scenarios）

#### 情境 A：建立全平台標籤治理框架

**背景**：新平台上線前，需要建立一套完整的標籤治理框架，確保所有資源、使用者、事件都遵循統一的分類標準。

**流程**：
1. 我進入「標籤管理（Tag Management）」頁面，點擊「批次匯入」
2. 上傳預先準備好的標籤綱要 CSV 檔案，包含 20 個標籤定義：
   - 環境標籤：`environment: [dev, staging, production]`（enum，必填，適用於 resources）
   - 擁有者標籤：`owner: text`（必填，適用於 resources、incidents）
   - 合規標籤：`compliance: [pci, hipaa, sox]`（enum，僅 ComplianceOfficer 可修改）
   - 業務單位標籤：`business_unit: [sales, engineering, operations]`（enum，適用於 users、resources）
   - ...
3. 系統驗證 CSV 格式，並顯示預覽：「將建立 20 個標籤定義」
4. 我確認匯入，系統成功建立所有標籤定義
5. 系統自動記錄稽核日誌：「Admin 於 2025-10-08 10:30 批次建立 20 個標籤定義」
6. 我進入標籤列表，看到所有標籤已按類型分組顯示（enum: 12、text: 5、boolean: 3）

**價值**：快速建立完整治理框架，避免手動逐一建立的繁瑣與錯誤。

---

#### 情境 B：管理列舉標籤的允許值

**背景**：業務擴展至新區域，需在「區域（region）」標籤中新增 `us-west-2` 選項。

**流程**：
1. 我在標籤列表中找到 `region` 標籤（類型：enum）
2. 點擊「管理標籤值（Manage Values）」
3. 系統顯示目前的允許值清單：`us-east-1`、`eu-west-1`、`ap-southeast-1`
4. 我點擊「新增值」，輸入 `us-west-2`，設定顯示名稱「美國西部 2」
5. 系統驗證該值尚未存在，成功新增
6. 系統自動記錄稽核日誌：「Admin 於 region 標籤新增值：us-west-2」
7. 我回到資源管理頁面，選擇「區域」篩選時，看到新選項 `us-west-2` 已出現

**價值**：動態擴展標籤允許值，無需開發者介入，快速響應業務變化。

---

#### 情境 C：設定關鍵標籤的權限控制

**背景**：公司需遵守 PCI-DSS 合規要求，必須確保僅合規官可修改「合規標籤（compliance）」。

**流程**：
1. 我在標籤列表中找到 `compliance` 標籤
2. 點擊「編輯標籤」
3. 在「寫入權限（Write Permissions）」欄位，我選擇角色「ComplianceOfficer」
4. 我勾選「必填（Required）」選項，確保所有資源都必須標記合規類型
5. 我勾選「稽核啟用（Audit Enabled）」，確保所有變更都記錄於稽核日誌
6. 系統驗證設定，成功更新標籤定義
7. 系統自動記錄稽核日誌：「Admin 修改 compliance 標籤，限制寫入權限為 ComplianceOfficer」
8. 一般使用者嘗試修改資源的 `compliance` 標籤時，系統顯示：「無權限修改此標籤，請聯繫合規官」

**價值**：保護關鍵標籤，避免誤操作導致合規問題，確保治理策略有效執行。

---

#### 情境 D：建立階層化標籤結構

**背景**：公司有複雜的組織架構（業務單位 > 部門 > 團隊），需要建立階層化標籤以支援細粒度分類。

**流程**：
1. 我在標籤列表點擊「新增標籤」，選擇「階層標籤（Hierarchical Tag）」
2. 輸入標籤鍵：`organization`，顯示名稱「組織架構」
3. 我開始建立層級結構：
   - 第一層（業務單位）：Sales、Engineering、Operations
   - 第二層（部門，屬於 Engineering）：Backend、Frontend、DevOps
   - 第三層（團隊，屬於 DevOps）：SRE-Team-A、SRE-Team-B
4. 我為每一層設定不同的權限：
   - 第一層：僅 CEO 可修改
   - 第二層：僅部門主管可修改
   - 第三層：團隊 Lead 可修改
5. 系統驗證階層結構（最多 5 層），成功建立標籤
6. 我進入資源管理頁面，選擇「組織架構」標籤時，系統以樹狀結構顯示：
   ```
   Engineering
     ├─ Backend
     ├─ Frontend
     └─ DevOps
         ├─ SRE-Team-A
         └─ SRE-Team-B
   ```
7. 我選擇 `Engineering > DevOps > SRE-Team-A`，系統自動繼承父層標籤

**價值**：支援複雜組織架構的標籤管理，實現層級化分類與權限繼承。

---

#### 情境 E：處理標籤變更的影響評估

**背景**：我需要將 `environment` 標籤從「選填」改為「必填」，但擔心影響現有資源。

**流程**：
1. 我在標籤列表找到 `environment` 標籤，點擊「編輯標籤」
2. 我勾選「必填（Required）」選項
3. 系統自動查詢受影響的實體數量，顯示警告：
   「目前有 120 個資源未標記 environment 標籤，若設為必填，這些資源將違反標籤規則。是否繼續？」
4. 我選擇「檢視受影響資源」，系統顯示清單：
   - `resource-abc123` (type: VM, owner: john@example.com)
   - `resource-def456` (type: DB, owner: jane@example.com)
   - ...
5. 我選擇「匯出清單（CSV）」，並通知資源擁有者補充標籤
6. 我暫時不設為必填，而是啟用「建議標籤（Recommended）」模式
7. 系統在資源管理頁面顯示提示：「建議為資源標記 environment 標籤」
8. 兩週後，未標記資源降至 10 個，我再次將 `environment` 設為必填
9. 系統自動記錄稽核日誌：「Admin 將 environment 標籤設為必填，影響 10 個資源」

**價值**：降低標籤規則變更的風險，提供影響評估與漸進式推進策略。

---

### 現有痛點（Pain Points）

#### 痛點 1：標籤定義散落各模組，缺乏統一治理

**問題**：標籤定義散落在各模組的程式碼中，開發者各自定義標籤結構。
**影響**：相同概念的標籤出現多種拼寫（`env`、`environment`、`Env`），導致查詢與報表混亂。
**解決**：集中化標籤綱要管理，所有模組從統一來源讀取標籤定義，確保一致性。

---

#### 痛點 2：缺乏類型約束，標籤值不規範

**問題**：標籤類型為 `text` 時，使用者可輸入任意值（`prod`、`production`、`PROD`）。
**影響**：相同環境的資源因標籤值不一致而無法正確篩選與聚合。
**解決**：定義 `enum` 類型標籤，限制允許值清單，自動驗證與規範輸入。

---

#### 痛點 3：缺乏權限控制，關鍵標籤易被誤改

**問題**：所有使用者都可修改任意標籤，包括合規相關的關鍵標籤。
**影響**：非授權人員誤改合規標籤，導致稽核失敗或法規風險。
**解決**：為標籤定義設定「寫入權限」，限制僅特定角色可修改特定標籤。

---

#### 痛點 4：標籤變更無影響評估，風險不可控

**問題**：將標籤從「選填」改為「必填」時，無法預知影響範圍。
**影響**：大量現有資源突然違反標籤規則，導致系統異常或操作中斷。
**解決**：提供影響評估工具，自動統計受影響實體數量，支援漸進式推進策略。

---

#### 痛點 5：標籤管理依賴開發者，響應速度慢

**問題**：新增標籤或修改允許值需要開發者修改程式碼並部署。
**影響**：業務變化（如新增區域、新增產品線）無法快速響應，延誤上線時間。
**解決**：提供自助式標籤管理介面，授權管理員自行新增、修改、刪除標籤定義。

---

## 二、驗收場景（Acceptance Scenarios）

### 場景群組 A：標籤定義管理（Tag Definition Management）

#### A1. 建立新的標籤定義

1. **Given** 我在「標籤管理」頁面。
2. **When** 我點擊「新增標籤」，輸入標籤鍵 `cost_center`，類型選擇 `text`，適用範圍選擇 `resources`。
3. **Then** 系統必須（MUST）驗證標籤鍵的唯一性（不可與現有標籤重複）。
4. **And** 系統必須（MUST）成功建立標籤定義，並顯示於標籤列表。
5. **And** 系統必須（MUST）記錄稽核日誌（類別：`tag-definition-create`，內容：標籤鍵、類型、執行者）。

---

#### A2. 編輯現有標籤定義

1. **Given** 標籤 `environment` 已存在（類型：enum，允許值：dev、staging、production）。
2. **When** 我點擊「編輯標籤」，勾選「必填（Required）」選項。
3. **Then** 系統必須（MUST）顯示影響評估：「目前有 X 個資源未標記此標籤」。
4. **And** 我確認變更後，系統必須（MUST）更新標籤定義。
5. **And** 系統必須（MUST）記錄稽核日誌（類別：`tag-definition-update`，內容：變更欄位、舊值、新值、執行者）。

---

#### A3. 刪除標籤定義

1. **Given** 標籤 `deprecated_tag` 存在，且未被任何實體使用。
2. **When** 我點擊「刪除標籤」。
3. **Then** 系統必須（MUST）檢查該標籤是否被使用（查詢所有實體的標籤欄位）。
4. **And** 若未被使用，系統必須（MUST）顯示確認對話框：「確定刪除標籤定義 `deprecated_tag`？此操作不可復原。」
5. **And** 我確認後，系統必須（MUST）刪除標籤定義，並記錄稽核日誌（類別：`tag-definition-delete`）。

---

#### A4. 刪除被使用的標籤定義

1. **Given** 標籤 `owner` 被 500 個資源使用。
2. **When** 我嘗試刪除標籤 `owner`。
3. **Then** 系統必須（MUST）顯示警告：「標籤 `owner` 被 500 個實體使用，刪除後這些實體的標籤資料將遺失。是否繼續？」
4. **And** 系統必須（MUST）提供「檢視使用清單」功能，顯示受影響實體（分頁顯示，每頁 50 筆）。
5. **And** 我確認刪除後，系統必須（MUST）執行刪除，並記錄稽核日誌（包含受影響實體數量）。

---

### 場景群組 B：標籤值管理（Tag Value Management）

#### B1. 新增列舉標籤的允許值

1. **Given** 標籤 `region` 存在（類型：enum，允許值：us-east-1、eu-west-1）。
2. **When** 我點擊「管理標籤值」，新增允許值 `ap-southeast-1`，顯示名稱「亞太東南 1」。
3. **Then** 系統必須（MUST）驗證該值尚未存在（忽略大小寫）。
4. **And** 系統必須（MUST）成功新增允許值，並即時更新下拉選單。
5. **And** 系統必須（MUST）記錄稽核日誌（類別：`tag-value-create`，內容：標籤鍵、新增值、執行者）。

---

#### B2. 刪除列舉標籤的允許值

1. **Given** 標籤 `region` 的允許值包含 `us-west-1`，且該值未被任何實體使用。
2. **When** 我在「管理標籤值」中刪除 `us-west-1`。
3. **Then** 系統必須（MUST）檢查該值是否被使用（查詢所有實體的 `region` 標籤值）。
4. **And** 若未被使用，系統必須（MUST）成功刪除該值。
5. **And** 系統必須（MUST）記錄稽核日誌（類別：`tag-value-delete`）。

---

#### B3. 刪除被使用的列舉標籤允許值

1. **Given** 標籤 `region` 的允許值包含 `us-east-1`，且該值被 200 個資源使用。
2. **When** 我嘗試刪除 `us-east-1`。
3. **Then** 系統必須（MUST）顯示警告：「值 `us-east-1` 被 200 個實體使用，刪除後這些實體的標籤值將失效。是否繼續？」
4. **And** 系統必須（MUST）提供「遷移至其他值」選項，讓我選擇替代值（例如：遷移至 `us-east-2`）。
5. **And** 我確認刪除後，系統必須（MUST）執行刪除，並記錄稽核日誌（包含受影響實體數量與遷移選項）。

---

### 場景群組 C：標籤權限控制（Tag Permission Management）

#### C1. 設定標籤的寫入權限

1. **Given** 標籤 `compliance` 存在（類型：enum）。
2. **When** 我編輯標籤，設定「寫入權限（Write Permissions）」為角色 `ComplianceOfficer`。
3. **Then** 系統必須（MUST）更新標籤定義，記錄允許修改此標籤的角色清單。
4. **And** 系統必須（MUST）在資源管理頁面，當非授權使用者嘗試修改 `compliance` 標籤時，顯示錯誤：「無權限修改此標籤」。
5. **And** 系統必須（MUST）記錄稽核日誌（類別：`tag-permission-update`）。

---

#### C2. 驗證標籤寫入權限

1. **Given** 標籤 `compliance` 的寫入權限限制為 `ComplianceOfficer`。
2. **When** 一般使用者（角色：`User`）嘗試在資源頁面修改 `compliance` 標籤。
3. **Then** 系統必須（MUST）檢查使用者角色，若不符合寫入權限，拒絕操作。
4. **And** 系統必須（MUST）顯示錯誤訊息：「此標籤僅限 ComplianceOfficer 角色修改，請聯繫合規官」。
5. **And** 系統必須（MUST）記錄稽核日誌（類別：`tag-permission-denied`，內容：標籤鍵、使用者、拒絕原因）。

---

### 場景群組 D：階層化標籤管理（Hierarchical Tag Management）

#### D1. 建立階層化標籤結構

1. **Given** 我在「新增標籤」頁面，選擇「階層標籤（Hierarchical Tag）」類型。
2. **When** 我輸入標籤鍵 `organization`，並建立三層結構：
   - 第一層：`Sales`、`Engineering`
   - 第二層（屬於 Engineering）：`Backend`、`Frontend`
   - 第三層（屬於 Backend）：`Team-A`、`Team-B`
3. **Then** 系統必須（MUST）驗證階層深度（最多 5 層）。
4. **And** 系統必須（MUST）成功建立標籤定義，並在標籤列表以樹狀結構顯示。
5. **And** 系統必須（MUST）記錄稽核日誌（類別：`tag-definition-create`，內容：標籤鍵、層級數、執行者）。

---

#### D2. 選擇階層化標籤值

1. **Given** 階層標籤 `organization` 存在（結構：Engineering > Backend > Team-A）。
2. **When** 我在資源管理頁面選擇 `organization` 標籤，選擇 `Engineering > Backend > Team-A`。
3. **Then** 系統必須（MUST）自動繼承父層標籤（資源同時標記為 `Engineering`、`Backend`、`Team-A`）。
4. **And** 系統必須（MUST）在標籤顯示時以階層路徑顯示：`organization: Engineering > Backend > Team-A`。
5. **And** 系統必須（MUST）支援按任一層級篩選資源（例如：篩選所有 `Engineering` 下的資源）。

---

#### D3. 刪除階層標籤的父層節點

1. **Given** 階層標籤 `organization` 存在，`Engineering` 節點下有 `Backend`、`Frontend` 子節點。
2. **When** 我嘗試刪除 `Engineering` 節點。
3. **Then** 系統必須（MUST）顯示警告：「刪除 `Engineering` 將同時刪除其子節點（Backend、Frontend），共影響 X 個實體。是否繼續？」
4. **And** 系統必須（MUST）提供「遷移子節點至其他父層」選項。
5. **And** 我確認刪除後，系統必須（MUST）執行刪除，並記錄稽核日誌（包含刪除的子節點清單）。

---

### 場景群組 E：批次管理（Batch Operations）

#### E1. 批次匯入標籤定義（CSV）

1. **Given** 我準備了包含 20 個標籤定義的 CSV 檔案。
2. **When** 我在標籤管理頁面點擊「批次匯入」，上傳 CSV 檔案。
3. **Then** 系統必須（MUST）驗證 CSV 格式（包含必填欄位：key、kind、scopes）。
4. **And** 系統必須（MUST）顯示預覽清單：「將建立 20 個標籤定義」，並標註衝突項（例如：鍵已存在）。
5. **And** 我確認匯入後，系統必須（MUST）批次建立標籤定義，並記錄稽核日誌（類別：`tag-definition-batch-import`，內容：成功數、失敗數、執行者）。

---

#### E2. 批次匯出標籤定義（CSV）

1. **Given** 我在標籤列表選擇 10 個標籤（使用多選功能）。
2. **When** 我點擊「批次匯出」。
3. **Then** 系統必須（MUST）產出包含所選標籤定義的 CSV 檔案（包含所有欄位：key、kind、scopes、required、readonly、write_permissions）。
4. **And** CSV 檔案必須（MUST）包含標頭列，欄位名稱使用英文（便於跨系統整合）。
5. **And** 系統必須（MUST）記錄稽核日誌（類別：`tag-definition-batch-export`，內容：匯出數量、執行者）。

---

#### E3. 批次刪除標籤定義

1. **Given** 我在標籤列表選擇 5 個標籤（使用多選功能）。
2. **When** 我點擊「批次刪除」。
3. **Then** 系統必須（MUST）逐一檢查每個標籤是否被使用。
4. **And** 系統必須（MUST）顯示摘要：「5 個標籤中，2 個被使用（共影響 X 個實體），3 個未被使用。是否繼續？」
5. **And** 我確認刪除後，系統必須（MUST）執行批次刪除，並記錄稽核日誌（類別：`tag-definition-batch-delete`，內容：刪除數量、受影響實體數、執行者）。

---

### 場景群組 F：搜尋與篩選（Search & Filter）

#### F1. 即時搜尋標籤定義

1. **Given** 標籤列表包含 50 個標籤定義。
2. **When** 我在搜尋框輸入關鍵字 `env`。
3. **Then** 系統必須（MUST）即時過濾標籤列表，僅顯示標籤鍵或顯示名稱包含 `env` 的項目（不區分大小寫）。
4. **And** 系統必須（MUST）高亮匹配的文字部分（例如：`**env**ironment`）。
5. **And** 搜尋應於使用者停止輸入 300ms 後執行（防抖），避免頻繁查詢。

---

#### F2. 按類型篩選標籤

1. **Given** 標籤列表包含多種類型的標籤（enum: 20、text: 15、boolean: 10、reference: 5）。
2. **When** 我在快速篩選欄（Quick Filter Bar）選擇「類型：enum」。
3. **Then** 系統必須（MUST）僅顯示類型為 `enum` 的標籤（20 個）。
4. **And** 系統必須（MUST）在篩選欄顯示目前篩選條件：「類型：enum（20）」。
5. **And** 我可以清除篩選條件，恢復顯示所有標籤。

---

#### F3. 複合篩選（類型 + 範圍）

1. **Given** 標籤列表包含多種類型與範圍的標籤。
2. **When** 我選擇「類型：enum」和「範圍：resources」。
3. **Then** 系統必須（MUST）顯示同時符合兩個條件的標籤（類型為 enum 且適用於 resources）。
4. **And** 系統必須（MUST）在篩選欄顯示目前篩選條件：「類型：enum（15）+ 範圍：resources（15）」。
5. **And** 篩選結果必須（MUST）即時更新，無需重新載入頁面。

---

## 三、功能需求（Functional Requirements）

### 3.1. 標籤定義管理（Tag Definition Management）

| 編號 | 說明 |
|------|------|
| **FR-TD-001** | 系統必須（MUST）支援建立、編輯、刪除標籤定義（CRUD）。 |
| **FR-TD-002** | 每個標籤定義必須（MUST）包含以下核心屬性：標籤鍵（key，唯一）、類型（kind）、適用範圍（scopes）、是否必填（required）、是否唯讀（readonly）。 |
| **FR-TD-003** | 系統必須（MUST）支援多種標籤類型：`enum`、`text`、`boolean`、`reference`、`hierarchical`。 |
| **FR-TD-004** | 系統必須（MUST）在建立標籤時驗證標籤鍵的唯一性（不可與現有標籤重複）。 |
| **FR-TD-005** | 系統必須（MUST）在刪除標籤前檢查該標籤是否被使用，並顯示影響評估。 |
| **FR-TD-006** | 系統必須（MUST）記錄所有標籤定義的 CRUD 操作於稽核日誌（類別：`tag-definition-*`）。 |

---

### 3.2. 標籤值管理（Tag Value Management）

| 編號 | 說明 |
|------|------|
| **FR-TV-001** | 對於 `enum` 類型標籤，系統必須（MUST）提供專門介面管理其允許值清單。 |
| **FR-TV-002** | 系統必須（MUST）支援新增、編輯、刪除允許值，並驗證唯一性（忽略大小寫）。 |
| **FR-TV-003** | 系統必須（MUST）在刪除允許值前檢查該值是否被使用，並顯示影響評估。 |
| **FR-TV-004** | 系統必須（MUST）提供「遷移至其他值」功能，在刪除被使用的允許值時自動替換。 |
| **FR-TV-005** | 系統必須（MUST）記錄所有允許值的 CRUD 操作於稽核日誌（類別：`tag-value-*`）。 |

---

### 3.3. 標籤權限控制（Tag Permission Management）

| 編號 | 說明 |
|------|------|
| **FR-TP-001** | 系統必須（MUST）支援為標籤定義設定「寫入權限（Write Permissions）」，限制僅特定角色可修改。 |
| **FR-TP-002** | 系統必須（MUST）在使用者嘗試修改標籤時驗證其角色，若無權限則拒絕操作並記錄稽核日誌。 |
| **FR-TP-003** | 系統必須（MUST）在標籤定義介面顯示「寫入權限」欄位，列出允許修改的角色清單。 |
| **FR-TP-004** | 系統必須（MUST）支援「唯讀（Readonly）」標籤，系統標籤（如 `created_at`）不可修改或刪除。 |

---

### 3.4. 階層化標籤管理（Hierarchical Tag Management）

| 編號 | 說明 |
|------|------|
| **FR-HT-001** | 系統必須（MUST）支援階層化標籤結構（父子關聯），最多 5 層。 |
| **FR-HT-002** | 系統必須（MUST）在標籤列表以樹狀結構顯示階層標籤（使用縮排標示層級）。 |
| **FR-HT-003** | 系統必須（MUST）在選擇階層標籤值時自動繼承父層標籤。 |
| **FR-HT-004** | 系統必須（MUST）在刪除父層節點時顯示影響評估（包含子節點數量與受影響實體數）。 |
| **FR-HT-005** | 系統必須（MUST）支援按任一層級篩選實體（例如：篩選所有 `Engineering` 下的資源）。 |

---

### 3.5. 批次管理（Batch Operations）

| 編號 | 說明 |
|------|------|
| **FR-BT-001** | 系統必須（MUST）支援批次匯入標籤定義（CSV 格式），並驗證必填欄位（key、kind、scopes）。 |
| **FR-BT-002** | 系統必須（MUST）在匯入前顯示預覽清單，標註衝突項（例如：鍵已存在）。 |
| **FR-BT-003** | 系統必須（MUST）支援批次匯出標籤定義（CSV 格式），包含所有欄位。 |
| **FR-BT-004** | 系統必須（MUST）支援多選標籤，並提供批次刪除功能（顯示影響評估摘要）。 |
| **FR-BT-005** | 系統必須（MUST）記錄所有批次操作於稽核日誌（類別：`tag-definition-batch-*`）。 |

---

### 3.6. 搜尋與篩選（Search & Filter）

| 編號 | 說明 |
|------|------|
| **FR-SF-001** | 系統必須（MUST）支援即時搜尋標籤定義（按標籤鍵或顯示名稱，不區分大小寫）。 |
| **FR-SF-002** | 系統必須（MUST）在搜尋結果中高亮匹配文字。 |
| **FR-SF-003** | 系統必須（MUST）支援按類型（kind）篩選標籤定義。 |
| **FR-SF-004** | 系統必須（MUST）支援按適用範圍（scopes）篩選標籤定義。 |
| **FR-SF-005** | 系統必須（MUST）支援複合篩選（類型 + 範圍），並即時更新結果。 |
| **FR-SF-006** | 搜尋應使用防抖機制（300ms），避免頻繁查詢。 |

---

### 3.7. 影響評估（Impact Assessment）

| 編號 | 說明 |
|------|------|
| **FR-IA-001** | 系統必須（MUST）在標籤定義變更前自動統計受影響實體數量（例如：將選填改為必填）。 |
| **FR-IA-002** | 系統必須（MUST）提供「檢視受影響實體」功能，顯示實體清單（分頁顯示，每頁 50 筆）。 |
| **FR-IA-003** | 系統必須（MUST）支援匯出受影響實體清單（CSV 格式）。 |
| **FR-IA-004** | 系統應該（SHOULD）提供「建議標籤（Recommended）」模式，在強制必填前先推廣使用。 |

---

### 3.8. 效能與擴展性（Performance & Scalability）

| 編號 | 說明 |
|------|------|
| **FR-PS-001** | 標籤列表載入時間必須（MUST）在 2 秒內完成（包含 100 個標籤定義）。 |
| **FR-PS-002** | 即時搜尋響應時間必須（MUST）在 300ms 內完成（包含 100 個標籤定義）。 |
| **FR-PS-003** | 批次匯入必須（MUST）支援至少 1000 個標籤定義，處理時間在 30 秒內完成。 |
| **FR-PS-004** | 影響評估查詢必須（MUST）在 5 秒內完成（查詢所有實體的標籤使用情況）。 |

---

## 四、關鍵資料實體（Key Entities）

| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **TagDefinition** | 標籤定義，包含標籤鍵、類型、適用範圍、是否必填、是否唯讀、寫入權限。 | TagValue、Role |
| **TagValue** | `enum` 類型標籤的允許值，包含值、顯示名稱、排序順序。 | TagDefinition |
| **TagHierarchyNode** | 階層化標籤的節點，記錄父子關係、層級、路徑。 | TagDefinition、TagHierarchyNode (self-reference) |
| **TagUsageRecord** | 標籤使用記錄，追蹤哪些實體使用了哪些標籤值（用於影響評估）。 | TagDefinition、Entity (resources, users, incidents) |

---

## 五、權限控制（RBAC）

| 權限字串 | 描述 |
|-----------|------|
| `tags:read` | 檢視標籤定義清單與詳細資訊。 |
| `tags:create` | 建立新的標籤定義。 |
| `tags:update` | 修改標籤定義（包括允許值、權限、必填設定）。 |
| `tags:delete` | 刪除標籤定義。 |
| `tags:batch-import` | 批次匯入標籤定義（CSV）。 |
| `tags:batch-export` | 批次匯出標籤定義（CSV）。 |

---

## 六、邊界案例（Edge Cases）

### 6.1. 刪除唯讀標籤

**情境**：使用者嘗試刪除系統內建的唯讀標籤（例如：`created_at`）。
**處理**：
- 系統必須（MUST）檢查標籤的 `readonly` 屬性
- 若為唯讀標籤，系統必須（MUST）拒絕刪除操作，顯示錯誤：「唯讀標籤不可刪除」
- 系統必須（MUST）在標籤列表中隱藏唯讀標籤的「刪除」按鈕

---

### 6.2. 將 text 類型標籤改為 enum 類型

**情境**：標籤 `environment` 原為 `text` 類型，已有 500 個資源使用（值為：prod、production、PROD、dev、staging）。管理員嘗試改為 `enum` 類型（允許值：production、staging、development）。
**處理**：
- 系統必須（MUST）顯示警告：「目前有 500 個實體使用此標籤，其中部分值（prod、PROD）不符合新定義的允許值清單」
- 系統必須（MUST）提供「值映射（Value Mapping）」功能，讓管理員指定舊值如何映射至新值：
  - `prod` → `production`
  - `PROD` → `production`
  - `dev` → `development`
- 系統必須（MUST）在確認變更後自動執行批次替換，並記錄稽核日誌

---

### 6.3. 標籤鍵包含特殊字元

**情境**：使用者嘗試建立標籤鍵為 `cost-center$123` 或 `env.production`。
**處理**：
- 系統必須（MUST）驗證標籤鍵格式：僅允許小寫字母、數字、底線、連字號（`[a-z0-9_-]+`）
- 若包含特殊字元，系統必須（MUST）顯示錯誤：「標籤鍵僅可包含小寫字母、數字、底線、連字號」
- 系統應該（SHOULD）自動建議規範化的標籤鍵（例如：`cost_center_123`、`env_production`）

---

### 6.4. 階層標籤深度超過限制

**情境**：使用者嘗試建立第 6 層階層標籤（超過 5 層限制）。
**處理**：
- 系統必須（MUST）驗證階層深度
- 若超過限制，系統必須（MUST）顯示錯誤：「階層標籤最多支援 5 層，請重新規劃結構」
- 系統應該（SHOULD）在建立階層標籤時顯示目前層級數（例如：「目前：3/5 層」）

---

### 6.5. 批次匯入 CSV 格式錯誤

**情境**：使用者上傳的 CSV 檔案缺少必填欄位（例如：`kind` 欄位為空）。
**處理**：
- 系統必須（MUST）驗證 CSV 格式，檢查必填欄位（key、kind、scopes）
- 若有錯誤，系統必須（MUST）顯示錯誤清單：「第 3 行：kind 欄位為空」、「第 5 行：scopes 格式錯誤」
- 系統必須（MUST）拒絕匯入，直到所有錯誤修正
- 系統應該（SHOULD）提供 CSV 範本下載功能，協助使用者正確填寫

---

### 6.6. 標籤權限衝突

**情境**：使用者同時擁有 `ComplianceOfficer` 和 `User` 角色，標籤 `compliance` 的寫入權限限制為 `ComplianceOfficer`。
**處理**：
- 系統必須（MUST）採用「最高權限優先」原則
- 若使用者的任一角色符合寫入權限，則允許修改
- 系統必須（MUST）在稽核日誌中記錄使用者的所有角色與使用的權限

---

## 七、觀測性與治理（Observability & Governance）

### 7.1. Logging & Tracing
- [ ] 所有標籤定義 CRUD 操作記錄於稽核日誌（類別：`tag-definition-*`，內容：標籤鍵、操作類型、執行者、時間戳）
- [ ] 所有標籤值 CRUD 操作記錄於稽核日誌（類別：`tag-value-*`，內容：標籤鍵、值、操作類型、執行者）
- [ ] 所有標籤權限變更記錄於稽核日誌（類別：`tag-permission-*`，內容：標籤鍵、舊權限、新權限、執行者）
- [ ] 所有權限驗證失敗記錄於稽核日誌（類別：`tag-permission-denied`，內容：標籤鍵、使用者、拒絕原因）
- [ ] 分散式追蹤（Trace ID）貫穿整個標籤管理流程（建立 → 驗證 → 影響評估 → 儲存）

### 7.2. Metrics & Alerts
- [ ] 監控標籤定義總數（按類型分組：enum、text、boolean、reference、hierarchical）
- [ ] 監控標籤使用率（每個標籤被多少實體使用）
- [ ] 監控標籤變更頻率（每日/每週變更次數）
- [ ] 監控批次匯入成功率與失敗原因
- [ ] 告警：若標籤定義總數超過 500，發送警告（可能存在標籤濫用）
- [ ] 告警：若標籤變更影響超過 1000 個實體，發送警告（高風險操作）

### 7.3. RBAC
- [ ] 所有標籤管理功能必須檢查 `tags:*` 權限
- [ ] 「新增標籤」按鈕必須檢查 `tags:create` 權限
- [ ] 「編輯標籤」按鈕必須檢查 `tags:update` 權限
- [ ] 「刪除標籤」按鈕必須檢查 `tags:delete` 權限
- [ ] 「批次匯入/匯出」功能必須檢查 `tags:batch-*` 權限

### 7.4. i18n
- [ ] 所有 UI 文案支援 `zh-TW`、`en-US`
- [ ] 所有錯誤訊息支援多語系
- [ ] CSV 匯出標頭列支援多語系（可選：英文或當前語言）

### 7.5. Theme Token
- [ ] 標籤類型標記顏色使用 Theme Token（例如：`enum-badge-bg`、`text-badge-bg`）
- [ ] 必填標籤標記顏色使用 Theme Token（例如：`required-badge-bg`）
- [ ] 唯讀標籤標記顏色使用 Theme Token（例如：`readonly-badge-bg`）

---

## 八、審查與驗收清單（Review Checklist）

- [x] 文件結構符合憲法 v1.3.0 標準
- [x] Primary User Story 包含 5 個能力點、5 個具體情境、5 個痛點分析
- [x] Acceptance Scenarios 包含 18 個場景，分為 6 個群組（A-F）
- [x] Functional Requirements 包含 42 個需求，分為 8 個類別
- [x] 完整 RBAC 定義（6 個權限）
- [x] 完整邊界案例（6 個）
- [x] 完整觀測性與治理清單（Logging、Metrics、RBAC、i18n、Theme Token）
- [x] 移除所有技術實作細節，保持技術中立

---

## 九、模糊與待確認事項（Clarifications）

| 項目 | 狀態 | 備註 |
|------|------|------|
| 標籤類型變更的值映射 | [RESOLVED] | 已明確：將 text 改為 enum 時提供值映射功能，管理員指定舊值如何映射至新值。 |
| 刪除被使用標籤的遷移策略 | [RESOLVED] | 已明確：刪除允許值時提供「遷移至其他值」選項，自動替換所有使用該值的實體。 |
| 階層標籤深度限制 | [RESOLVED] | 已明確：階層標籤最多 5 層，刪除父層節點時同時刪除子層節點（需顯示影響評估）。 |
| 多租戶隔離的標籤規則 | [NEEDS CLARIFICATION] | 是否支援多租戶環境下，不同租戶擁有獨立的標籤綱要（例如：租戶 A 定義的標籤對租戶 B 不可見）。 |
| 標籤值映射的自動化程度 | [NEEDS CLARIFICATION] | 將 text 改為 enum 時，系統是否提供「自動建議映射」功能（基於相似度演算法，例如：`prod` 自動建議映射至 `production`）。 |
| 跨頁多選功能 | [NEEDS CLARIFICATION] | 批次操作是否支援跨頁多選（例如：第 1 頁選擇 5 個標籤，翻至第 2 頁再選擇 3 個，共選擇 8 個）。 |
| 標籤使用率監控的即時性 | [NEEDS CLARIFICATION] | 標籤使用率統計是否即時計算（每次查詢時統計）或定期更新（例如：每小時更新一次）。 |
