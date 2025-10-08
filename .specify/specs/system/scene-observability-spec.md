# Scene Observability Specification（Scenes 架構可觀測性規範）

**模組名稱 (Module)**: Scene Observability Specification  
**來源 (Source)**: `SceneTelemetry`, `SceneQueryRunner`, `SceneEventBus`, `SceneAppProvider`  
**建立日期 (Created)**: 2025-10-09  
**狀態 (Status)**: Active  
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v2.0)

---

## 一、目標（Objective）

建立平台級統一的可觀測性層，確保每一個 Scene 模組皆能自動上報性能、行為與錯誤事件，  
以滿足憲法條款中對「Observability（可觀測性）」的要求，並支援治理與持續優化。

---

## 二、核心組件與角色（Core Components）

| 組件 | 職責 |
|------|------|
| **SceneTelemetry** | 收集延遲、錯誤、互動耗時與渲染時間等指標。 |
| **SceneQueryRunner** | 於查詢生命週期中自動產生遙測資料。 |
| **SceneEventBus** | 廣播使用者互動與錯誤事件，供 Telemetry 訂閱。 |
| **SceneAppProvider** | 初始化全域可觀測性設定與 API 鏈接資訊。 |

---

## 三、需收集的數據（Metrics & Signals）

1. **頁面性能指標**
   - `scene_load_time`: Scene 初始化至第一次繪製的時間。
   - `first_interaction_delay`: 使用者首次互動延遲。
   - `render_stability`: 畫面穩定度（類似 CLS）。

2. **資料流與查詢性能**
   - `query_latency`: 由 `SceneQueryRunner` 自動上報。
   - `query_error_rate`: 查詢失敗率。
   - `data_refresh_interval`: 資料更新頻率與命中率。

3. **互動與使用者行為**
   - `interaction_duration`: 使用者與 Scene 的互動耗時。
   - `interaction_type`: 互動類型（click、select、scroll、filter）。
   - `context_scene_id`: 所屬 Scene 識別碼。

4. **錯誤與例外**
   - `scene_error_event`: 捕獲前端執行錯誤。
   - `query_failure_event`: 資料查詢異常。
   - `state_inconsistency`: 狀態同步失敗。

---

## 四、實施策略（Implementation Strategy）

- **全域初始化**  
  可觀測性層由 `SceneAppProvider` 在應用初始化時設定，註冊至全域 `SceneTelemetry` 實例。  
  所有 Scene 模組自動註冊其生命週期事件。

- **資料流監測**  
  `SceneQueryRunner` 在每次查詢開始與結束時觸發 `SceneEventBus` 事件，  
  Telemetry 模組會自動計算延遲與成功率。

- **互動監測**  
  Scene 控制元件（如 `SceneControls`、`ScenePanel`）於使用者操作時觸發事件：  
  ```ts
  SceneEventBus.emit("scene:interaction", {
    sceneId: "automation-playbooks",
    action: "run",
    latency_ms: 154,
  });
  ```

- **錯誤收集**  
  `SceneStatusHandler` 會攔截並上報未捕獲的異常，並由 Telemetry 紀錄。

---

## 五、開發者職責（Developer Responsibilities）

- 為新的 Scene 模組註冊 Telemetry context：  
  ```ts
  SceneTelemetry.register(sceneId, { type: "table-view" });
  ```
- 為特殊操作（例如自動化腳本執行）標記自訂事件：  
  ```ts
  SceneTelemetry.mark("playbook:execute", durationMs);
  ```
- 不需手動收集 API 或查詢性能資料，皆由 `SceneQueryRunner` 自動處理。
- 如需附加自訂標籤，可透過：
  ```ts
  SceneTelemetry.tag("tenant", tenantId);
  ```

---

## 六、治理與監控（Governance & Monitoring）

| 項目 | 狀態 | 說明 |
|------|------|------|
| Telemetry 指標 | ✅ | 所有 Scene 模組均應自動上報核心延遲與錯誤指標。 |
| Logging / Tracing | ✅ | 與後端 OpenTelemetry trace ID 綁定。 |
| Metrics 儲存 | ✅ | 支援匯入 Grafana Cloud / Prometheus。 |
| Alert Rules | ✅ | 延遲超標或錯誤率升高時應觸發警報。 |
| i18n 支援 | ✅ | 錯誤訊息需具多語化格式。 |

---

## 七、範例（Examples）

```ts
SceneEventBus.emit("scene:query", {
  sceneId: "incidents-list",
  latency_ms: 213,
  status: "success",
  traceId: "TRACE-23910",
});
```

```ts
SceneTelemetry.record("scene_load_time", 845);
SceneTelemetry.record("interaction_duration", 312);
```

---

## 八、結語（Conclusion）

本文件定義了 Scenes 架構下的全域可觀測性行為，  
所有模組必須透過 `SceneTelemetry`、`SceneEventBus` 與 `SceneQueryRunner` 實現自動遙測與統一指標。  
前端可觀測性應與後端追蹤鏈路統一，確保性能瓶頸可追溯且行為可審計。