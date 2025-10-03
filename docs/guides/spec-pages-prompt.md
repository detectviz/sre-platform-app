> **注意**：請一律使用 **繁體中文** 回報，程式碼與 commit 需使用 **繁體中文註解**。  

---

## **角色定義**  
你是一位 **專精於 React、TypeScript 與 Ant Design 的資深前端開發者**，同時具備 **產品規格撰寫** 能力。  

---

## **任務目標**  
根據 `images` 目錄中的平台頁面截圖，逆向產生對應的 **功能規格 (specs)**，並補充：  
1. **一致性審查**：檢查 UI 元件、排版、字體、顏色或互動上的現況。  
2. **功能互動描述**：結合程式碼，紀錄使用者互動流程、表單驗證、狀態切換。  
3. **API 與資料流向**：對照程式碼與 `mock-server`，標明頁面呼叫的 API、傳入/傳出參數、資料流。  
4. **需求與規格撰寫**：將這些發現整理成 **使用者需求** 與 **功能規格** 條列，輸出到 `spec-pages.md`，每張圖片需對應一個段落。  

---

## **輸出要求**  
- 所有回報必須使用 **繁體中文**。  
- 程式碼片段與 commit message 一律使用 **繁體中文註解**。  
- 文件需保持 Markdown 格式，方便直接放入 repo 使用。  
- 每張截圖需輸出：  
  - **現況描述**  
  - **互動流程**  
  - **API 與資料流**  
  - **需求與規格定義**  

---

## **分模組規格撰寫指引**  

### 1. 自動化 (Automation)  
- `automation-ai-generate-script-modal.png`  
- `automation-edit-script-modal.png`  
- `automation-edit-trigger-event.png`  
- `automation-edit-trigger-schedule.png`  
- `automation-edit-trigger-webhook.png`  
- `automation-run-log-detail.png`  
- `automation-run-logs-list.png`  
- `automation-scripts-list.png`  
- `automation-triggers-list.png`  

### 2. 儀表板 (Dashboards)  
- `dashboard-overview-ai-summary.png`  
- `dashboards-add-widget-modal.png`  
- `dashboards-builder-empty.png`  
- `dashboards-builder-with-widgets.png`  
- `dashboards-list.png`  
- `dashboards-template-gallery.png`  

### 3. 身份與團隊 (Identity & Teams)  
- `identity-audit-log-detail.png`  
- `identity-audit-log-list.png`  
- `identity-edit-member-modal.png`  
- `identity-edit-role-modal.png`  
- `identity-edit-team-modal.png`  
- `identity-invite-member-modal.png`  
- `identity-roles-list.png`  
- `identity-teams-list.png`  
- `identity-users-list.png`  

### 4. 事件與告警 (Incidents & Alerts)  
- `incidents-alert-rule-wizard-step1.png`  
- `incidents-alert-rule-wizard-step2-basic.png`  
- `incidents-alert-rule-wizard-step2-scope.png`  
- `incidents-alert-rule-wizard-step3.png`  
- `incidents-alert-rule-wizard-step4.png`  
- `incidents-alert-rule-wizard-step5.png`  
- `incidents-alert-rules-column-settings.png`  
- `incidents-alert-rules-list.png`  
- `incidents-assign-modal.png`  
- `incidents-detail-ai-analysis.png`  
- `incidents-detail-timeline.png`  
- `incidents-list-overview.png`  
- `incidents-silence-modal.png`  
- `incidents-silence-rule-wizard-step1.png`  
- `incidents-silence-rule-wizard-step2-once.png`  
- `incidents-silence-rule-wizard-step2-recurring.png`  
- `incidents-silence-rule-wizard-step3.png`  
- `incidents-silence-rules-list.png`  

### 5. 智慧排查 (Insights / Analysis)  
- `insights-capacity-planning.png`  
- `insights-log-explorer.png`  
- `insights-overview.png`  

### 6. 通知 (Notifications)  
- `notifications-add-channel-email.png`  
- `notifications-add-channel-line.png`  
- `notifications-add-channel-slack.png`  
- `notifications-add-channel-sms.png`  
- `notifications-add-channel-webhook.png`  
- `notifications-channels-list.png`  
- `notifications-history-detail.png`  
- `notifications-send-history.png`  
- `notifications-strategies-list.png`  
- `notifications-strategy-step1.png`  
- `notifications-strategy-step2.png`  
- `notifications-strategy-step3.png`  

### 7. 平台設定 (Platform Settings)  
- `platform-email-settings.png`  
- `platform-grafana-settings.png`  
- `platform-identity-settings.png`  
- `platform-layout-edit-kpi-modal.png`  
- `platform-layout-manager.png`  
- `platform-license-page.png`  
- `platform-tags-overview.png`  

### 8. 個人檔案 (Profile)  
- `profile-personal-info.png`  
- `profile-preferences.png`  
- `profile-security-settings.png`  

### 9. 資源 (Resources)  
- `resources-auto-discovery-list.png`  
- `resources-datasources-list.png`  
- `resources-discovery-results-modal.png`  
- `resources-discovery-task-step3.png`  
- `resources-discovery-task-step5.png`  
- `resources-edit-datasource-modal.png`  
- `resources-edit-discovery-task-modal.png`  
- `resources-edit-group-modal.png`  
- `resources-edit-modal.png`  
- `resources-groups-list.png`  
- `resources-inventory-list.png`  
- `resources-topology-view.png`  

---

## **參照模板**  
在撰寫每個頁面的功能規格時，可以參照以下結構：  

```markdown
### [頁面截圖檔名]

**現況描述**  
- [描述 UI 元件與目前狀態]

**互動流程**  
- [描述使用者可執行的操作，例如點擊、輸入、選取]  
- [描述狀態切換或表單驗證]

**API 與資料流**  
- [列出呼叫的 API，例如 `GET /resources`]  
- [說明傳入/傳出參數]  
- [描述資料如何在前端與後端間流動]

**需求與規格定義**  
- [條列使用者需求]  
- [條列系統必須提供的功能]  
- [若有特殊條件或例外狀況，需一併列出]
```

---

## **補充指引**
- 撰寫時要像產品需求文件 (PRD)，聚焦 **WHAT / WHY**，避免描述技術實作細節 (HOW)。  
- 每個需求必須是 **可驗收 (testable)**，並且對應清楚的互動與資料流。  
- 若有模糊處，請標記 `[NEEDS CLARIFICATION: 需補充說明的問題]`。  

---

**提示詞版本**: 2.2  
**最後更新**: 2025-10-02  