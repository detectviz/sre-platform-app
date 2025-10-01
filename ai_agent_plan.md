# 核心啟發與行動建議

## 1. AI Agent 整合必須列為優先級

### 現況：
- ✅ 已有基礎 AI 功能（/ai/* 端點）
- ⚠️ AI 分析結果未儲存到 Incident.aiAnalysis（data_lineage_verification.md P0 問題）
- ❌ 缺少 AI Agent 與自動化工作流的深度整合

### 建議行動：
// 新增 AI Agent 編排功能
POST /ai/agents - 創建 AI Agent
POST /ai/agents/{id}/execute - 執行 Agent 任務
GET /ai/agents/{id}/history - 查看執行歷史

// 與現有功能整合
- Incident 分析 → 自動觸發 AutomationPlaybook
- Alert Rule 優化建議 → AI Agent 自動調整閾值
- Resource 異常檢測 → AI Agent 主動巡檢

## 2. MCP (Model Context Protocol) 快速整合能力

### 文章強調「MCP 快速開發整合，正成為 AI 服務供應商的下一個戰場」

### 現況：
- ❌ 缺少統一的第三方整合框架
- ⚠️ Datasource 支援有限
- ❌ 無插件式架構

### 建議架構：
-- 新增 Integration 表
CREATE TABLE integrations (
	id VARCHAR(255) PRIMARY KEY,
	name VARCHAR(255) NOT NULL,
	type VARCHAR(50) NOT NULL, -- mcp, webhook, api
	protocol VARCHAR(50), -- MCP protocol version
	config JSON NOT NULL,
	enabled BOOLEAN DEFAULT true,
	created_at DATETIME,
	updated_at DATETIME
);

-- 新增 Integration Endpoints
POST /integrations - 註冊新整合
POST /integrations/{id}/test - 測試連線
GET /integrations/{id}/schema - 取得資料結構

## 3. 權限控管與 Guardrail 資安護欄

### 文章提到「缺乏多用戶權限控管，無法建立 Guardrail 資安護欄」

現況（來自 platform_functionality_verification.md）：
- ❌ Permission 驗證邏輯未實現
- ❌ 缺少 API Rate Limiting
- ❌ 缺少操作審計追蹤（AuditLog 幾乎未實現）

緊急修復（P0+）：
// 1. 實現權限中間件
const PERMISSION_RULES = {
	'ai/agents/execute': ['ai_operator', 'platform_admin'],
	'alert-rules/create': ['sre_engineer', 'platform_admin'],
	'resources/delete': ['platform_admin']
};

// 2. AI Guardrail 機制
interface AIGuardrail {
	maxTokens: number;
	allowedOperations: string[];
	requireApproval: boolean;
	sensitiveDataFilter: boolean;
}

// 3. 操作審計強化
auditLogMiddleware(
	userId,
	'AI_AGENT_EXECUTE',
	'AIAgent',
	agentId,
	{ prompt: sanitized, tokens: usage }
);

## 4. 預期管理與用戶教育

### 文章指出「90+ 項整合需求」與「預期管理」的挑戰

### 建議新增功能：
-- Feature Request 管理
CREATE TABLE feature_requests (
	id VARCHAR(255) PRIMARY KEY,
	title VARCHAR(255),
	description TEXT,
	category VARCHAR(50), -- ai, integration, automation
	priority VARCHAR(20), -- p0, p1, p2, p3
	status VARCHAR(50), -- requested, planned, in_progress, completed
	requested_by VARCHAR(255),
	votes INT DEFAULT 0,
	created_at DATETIME
);

-- 對應 API
GET /feature-requests - 查看需求列表
POST /feature-requests - 提交需求
POST /feature-requests/{id}/vote - 投票

## 5. 生成式 AI + 預測型 AI 整合

### 文章強調「將生成式 AI 與預測型 AI（AutoML）結合」

### 現況：
- ✅ 有容量規劃預測（/analysis/capacity-planning）
- ✅ 有 AI 風險預測（/ai/infra/risk-prediction）
- ❌ 兩者未整合

### 建議整合方案：
```json
// 新增混合 AI 分析端點
POST /ai/hybrid-analysis
{
	"mode": "predictive_generative", // 預測型 + 生成式
	"targets": ["resource-001", "resource-002"],
	"analysisType": "capacity_optimization",
	"actions": {
		"predictiveModel": "automl_timeseries",
		"generativeTask": "recommendation_generation"
	}
}

// 回應範例
{
	"prediction": {
		"forecast": [...],
		"confidence": 0.85,
		"model": "AutoML-TS-v2"
	},
	"recommendation": {
		"summary": "基於預測，建議在 30 天內擴容 CPU 20%",
		"actions": [...],
		"estimatedCost": "$1,200/月"
	}
}
```

---
### 📋 更新後的優先級

### 基於文章啟發，調整改進建議的優先級：

### P0+ 戰略級（新增）

1. AI Guardrail 與權限框架 - 2 週
2. AuditLog 完整實現 - 1 週
3. MCP 整合框架 - 2 週

### P0 緊急修復（維持原計畫）

- 補充關鍵外鍵欄位
- 欄位命名統一化
- 軟刪除策略統一

### P1 重要補強（新增 AI 相關）

- AI Agent 編排功能
- 生成式 + 預測型 AI 整合
- Feature Request 管理系統

---
## 立即行動

### 建議先完成以下驗證性 PoC：

1. AI Agent 最小可行方案（1 週）
	- 實現 1 個 AI Agent：自動化事件分析與建議
	- 整合到現有 Incident 流程
	- 驗證用戶接受度
2. 權限與 Guardrail 原型（1 週）
	- 實現基礎 RBAC
	- AI 操作限額與審計
	- 敏感資料過濾
3. MCP 整合試點（1 週）
	- 選擇 1-2 個高頻整合需求
	- 實現 MCP Protocol 適配器
	- 驗證擴展性

### 完成 PoC 後，再基於改進後的架構生成最終的 openapi.yaml 和 db_schema.sql。