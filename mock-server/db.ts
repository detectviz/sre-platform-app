import {
    Dashboard, DashboardTemplate, Incident, IncidentPriority, IncidentCategory, AlertRule, AlertRuleTemplate, SilenceRule, SilenceRuleTemplate,
    Resource, ResourceGroup, AutomationPlaybook, AutomationExecution, AutomationTrigger, User, Team, Role,
    AuditLog, TagDefinition, NotificationItem, NotificationStrategy, NotificationChannel,
    NotificationHistoryRecord, LoginHistoryRecord, LogEntry, MailSettings, AuthSettings, LayoutWidget,
    UserPreferences, DatasourceConnectionTestLog, TagBulkImportJob, UserPreferenceExportJob,
    IncidentAnalysis,
    MultiIncidentAnalysis,
    RuleAnalysisReport,
    LogAnalysis,
    LogLevel,
    NavItem,
    TabConfigMap,
    PlatformSettings,
    PreferenceOptions,
    GrafanaSettings,
    GrafanaOptions,
    AllOptions,
    IncidentOptions,
    AlertRuleOptions,
    SilenceRuleOptions,
    ResourceOptions,
    AutomationScriptOptions,
    NotificationChannelOptions,
    NotificationOptions,
    AutomationPlaybookOptions,
    ParameterDefinition,
    NotificationChannelType,
    AutomationTriggerOptions,
    TriggerType,
    PersonnelOptions,
    DashboardOptions,
    NotificationStrategyOptions,
    AuditLogOptions,
    LogOptions,
    InfraInsightsOptions,
    TagManagementOptions,
    TopologyOptions,
    AutomationExecutionOptions,
    NotificationHistoryOptions,
    ResourceType,
    MetricMetadata,
    RolePermission,
    Datasource,
    DiscoveryJob,
    DiscoveredResource,
    ResourceOverviewData,
    ResourceAnalysis,
    ResourceGroupStatusData,
    DatasourceOptions,
    AutoDiscoveryOptions,
    TableColumn,
    StyleDescriptor,
    ChartTheme,
    ResourceLink,
    ConfigVersion,
    KpiDataEntry
} from '../types';
import { TAG_SCOPE_OPTIONS, createTagDefinitions, getEnumValuesForTag } from '../tag-registry';

const readRequiredEnv = (name: string): string => {
    const value = process.env[name];
    if (!value || !value.trim()) {
        throw new Error(`Missing required environment variable "${name}" for mock data configuration.`);
    }
    return value;
};

const DEFAULT_API_BASE_URL = readRequiredEnv('MOCK_API_BASE_URL');
const DEFAULT_GRAFANA_BASE_URL = readRequiredEnv('MOCK_GRAFANA_BASE_URL');
const DEFAULT_IDP_ADMIN_URL = readRequiredEnv('MOCK_IDP_ADMIN_URL');


// Helper to generate UUIDs
export function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
            v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

// --- ALL MOCK DATA DEFINITIONS ---

const PAGE_CONTENT = {
    // Global & Common Strings
    GLOBAL: {
        SEARCH_PLACEHOLDER: '搜尋...',
        SAVE: '儲存',
        CANCEL: '取消',
        DELETE: '刪除',
        EDIT: '編輯',
        CONFIRM_DELETE_TITLE: '確認刪除',
        CONFIRM_DELETE_MESSAGE: '此操作無法復原。',
        COLUMN_SETTINGS: '欄位設定',
        ADD_NEW: '新增',
        IMPORT: '匯入',
        EXPORT: '匯出',
        RETRY: '重試',
        LOADING: '載入中...',
        OPERATIONS: '操作',
        STATUS: '狀態',
        TYPE: '類型',
        NAME: '名稱',
        DESCRIPTION: '描述',
        OWNER: '擁有者',
        CREATOR: '創建者',
        CREATED_AT: '創建時間',
        UPDATED_AT: '最後更新',
        ENABLED: '啟用',
        DISABLED: '停用',
        ALL: '全部',
        CLOSE: '關閉',
        PREVIOUS_STEP: '上一步',
        NEXT_STEP: '下一步',
        FINISH: '完成',
        ACTIONS: '操作',
        NO_DATA_TO_EXPORT: '沒有可匯出的資料。',
        LOADING_OPTIONS: '載入中...',
        SELECT_OPTION: '請選擇...',
        ALL_STATUSES: '所有狀態',
        NO_RESULTS: '找不到結果',
        SUCCESS: '成功',
        FAILED: '失敗',
        PENDING: '處理中',
        RUNNING: '執行中',
        YES: '是',
        NO: '否',
        NA: 'N/A',
        CLEAR_SELECTION: '取消選擇',
        ITEMS_SELECTED: '已選擇 {count} 項',
    },

    APP: {
        LOAD_ERROR_TITLE: '應用程式載入失敗',
        RELOAD_BUTTON: '重新載入頁面',
    },

    MODAL: {
        DEFAULT_WIDTH: 'w-1/2',
        BASE_CLASSES: 'glass-card rounded-xl border border-slate-700/50 shadow-2xl flex flex-col max-w-4xl max-h-[80vh] animate-fade-in-down',
    },

    // Layouts & Shared Components
    APP_LAYOUT: {
        SIDEBAR_TITLE: 'SRE Platform',
        SEARCH_PLACEHOLDER: 'Search... (Ctrl+K)',
        PROFILE_MENU: {
            SETTINGS: '個人設定',
            HELP_CENTER: '幫助中心',
            LOGOUT: '登出',
        },
        HOME_BREADCRUMB: 'Home',
        TOAST: {
            LOAD_SETTINGS_ERROR: '無法載入平台設定。',
            LOGOUT_SUCCESS: '您已成功登出。',
            HELP_CENTER_NOT_CONFIGURED: '幫助中心 URL 尚未設定。',
        }
    },
    NOTIFICATION_CENTER: {
        TITLE: '通知中心',
        MARK_ALL_AS_READ: '全部標示為已讀',
        NO_NOTIFICATIONS: '沒有新的通知',
        EMPTY_STATE_TITLE: '通知中心沒有新的通知',
        EMPTY_STATE_DESCRIPTION: '保持關注重要告警與事件，當有新的通知時會立即顯示於此。',
        VIEW_DETAILS: '查看詳情',
        MARK_AS_READ_TOOLTIP: '標示為已讀',
        TIME_UNITS: {
            YEAR: '{n} 年前',
            MONTH: '{n} 個月前',
            DAY: '{n} 天前',
            HOUR: '{n} 小時前',
            MINUTE: '{n} 分鐘前',
            JUST_NOW: '剛剛',
        },
        TOAST: {
            LOAD_ERROR: '無法載入通知。',
            MARK_ONE_ERROR: '無法標示為已讀。',
            MARK_ALL_ERROR: '無法將所有通知標示為已讀。',
        }
    },
    PAGE_WITH_TABS: {
        REFRESH: '刷新',
    },
    DASHBOARD_VIEWER: {
        THEME_LABEL: '主題',
        TV_MODE_LABEL: 'TV 模式',
        REFRESH_LABEL: '重新整理頻率',
        TIME_LABEL: '時間範圍',
        THEME: '主題',
        THEME_DARK: '深色',
        THEME_LIGHT: '淺色',
        TV_MODE: 'TV 模式',
        TV_MODE_OFF: '關閉',
        TV_MODE_ON: '開啟',
        REFRESH: '重新整理',
        REFRESH_OFF: '關閉',
        TIME: '時間',
        ZOOM_IN: '放大檢視',
        SHARE_DASHBOARD: '分享儀表板',
        GRAFANA_URL_NOT_CONFIGURED: '尚未設定 Grafana URL，請先完成整合。',
        OPTIONS_ERROR: '無法載入 Grafana 選項。',
    },
    DASHBOARD_VIEW_PAGE: {
        BACK_TO_LIST: '返回儀表板列表',
        REFRESH_LABEL: '重新載入資料',
        OPEN_IN_GRAFANA: '於 Grafana 開啟',
        METADATA_TITLE: '儀表板資訊',
        OWNER_LABEL: '擁有者',
        CATEGORY_LABEL: '分類',
        TYPE_LABEL: '類型',
        UPDATED_AT_LABEL: '最後更新',
        RESOURCE_COUNT_LABEL: '關聯資源',
        RESOURCE_COUNT_BADGE: '{count} 個資源',
        DESCRIPTION_LABEL: '描述',
        EMPTY_DESCRIPTION: '尚未提供描述。',
        EMPTY_VALUE: '—',
        ERROR_TITLE: '無法載入儀表板',
        ERROR_NO_ID: '未提供儀表板識別碼，請回到列表重新選取。',
        ERROR_NOT_FOUND: '找不到對應的儀表板，可能已被移除或權限不足。',
        ERROR_LOAD: '無法載入儀表板資料，請稍後再試一次。',
        RETRY_LABEL: '重新嘗試',
        RETURN_TO_LIST: '返回列表',
        LAST_UPDATED_PREFIX: '最後更新',
        TYPE_BUILT_IN: '內建儀表板',
        TYPE_GRAFANA: 'Grafana 儀表板',
        TYPE_CUSTOM: '自訂儀表板',
        RESOURCE_BADGE_TOOLTIP: '此儀表板綁定 {count} 筆資源',
    },
    COMMAND_PALETTE: {
        TITLE: 'Command Palette',
        SEARCH_PLACEHOLDER: 'Search...',
        PLACEHOLDER_ROOT: 'Search or type `>` for commands...',
        PLACEHOLDER_SILENCE_SEARCH: 'Search for a resource to silence...',
        PLACEHOLDER_SILENCE_DURATION: 'Enter duration (e.g., 30m, 2h, 1d)...',
        PLACEHOLDER_RUN_PLAYBOOK: 'Search for a playbook to run...',
        SILENCE_PREFIX_TEMPLATE: 'Silence {name}',
        RUN_PLAYBOOK_PREFIX: 'Run Playbook',
        NO_RESULTS: 'No results found.',
    },
    UNIFIED_SEARCH: {
        TITLE: '進階搜索與篩選',
        CLEAR_FILTERS: '清除所有篩選',
        SEARCH: '搜尋',
        KEYWORD_SEARCH: '關鍵字搜尋',
        KEYWORD_PLACEHOLDER: '依關鍵字搜尋...',
        ALL_STATUSES: '所有狀態',
        ALL_SEVERITIES: '所有嚴重性',
        ALL_TYPES: '所有類型',
        ALL_PROVIDERS: '所有提供商',
        ALL_REGIONS: '所有區域',
        ALL_IMPACTS: '所有影響層級',
        INCIDENTS: {
            STATUS: '狀態',
            SEVERITY: '嚴重性',
            IMPACT: '影響範圍',
            ASSIGNEE: '處理人',
            TRIGGER_TIME_RANGE: '觸發時間範圍',
        },
        ALERT_RULES: {
            SEVERITY: '嚴重性',
        },
        RESOURCES: {
            PROVIDER: '提供商',
            REGION: '區域',
        },
        TAG_MANAGEMENT: {
            SCOPE: '標籤範圍',
            ALL_SCOPES: '所有範圍',
            KIND: '資料型別',
            ALL_KINDS: '所有型別',
        },
        AUDIT_LOGS: {
            USER: '使用者',
            ACTION: '操作類型',
            TIME_RANGE: '時間範圍',
            ALL_USERS: '所有使用者',
            ALL_ACTIONS: '所有操作',
        },
        DASHBOARDS: {
            CATEGORY: '類別',
            ALL_CATEGORIES: '所有類別',
        },
        AUTOMATION_HISTORY: {
            PLAYBOOK: '腳本',
            ALL_PLAYBOOKS: '所有腳本',
            STATUS: '狀態',
            TIME_RANGE: '時間範圍',
        },
        NOTIFICATION_HISTORY: {
            STATUS: '狀態',
            CHANNEL_TYPE: '管道類型',
            ALL_CHANNEL_TYPES: '所有類型',
            TIME_RANGE: '時間範圍',
        },
    },
    ROLE_EDIT_MODAL: {
        ADD_TITLE: '新增角色',
        EDIT_TITLE: '編輯角色',
        ROLE_NAME: '角色名稱',
        PERMISSION_SETTINGS: '權限設定',
        SELECT_ALL: '全選',
    },
    AUTOMATION_PLAYBOOK_EDIT_MODAL: {
        ADD_TITLE: '新增腳本',
        EDIT_TITLE: '編輯腳本',
        NAME_LABEL: '腳本名稱 *',
        TYPE_LABEL: '類型',
        DESCRIPTION_LABEL: '描述',
        CONTENT_LABEL: '腳本內容',
        CONTENT_PLACEHOLDER: '#!/bin/bash\n# Your script here...\necho "Hello, $1!"',
        GENERATE_WITH_AI_BUTTON: '使用 AI 生成',
        UPLOAD_SCRIPT_BUTTON: '上傳腳本',
        PARAMETERS_TITLE: '參數定義',
        ADD_PARAMETER_BUTTON: '新增參數',
        PARAM_NAME_PLACEHOLDER: 'Name (e.g., pod_name)',
        PARAM_LABEL_PLACEHOLDER: 'Label (e.g., Pod Name)',
        PARAM_REQUIRED_LABEL: 'Required',
        PARAM_DEFAULT_VALUE_LABEL: 'Default Value',
        PARAM_PLACEHOLDER_LABEL: 'Placeholder',
        PARAM_OPTIONS_LABEL: 'Options',
        PARAM_ADD_OPTION_BUTTON: '+ Add Option',
        PARAM_OPTION_VALUE_PLACEHOLDER: 'Value',
        PARAM_OPTION_LABEL_PLACEHOLDER: 'Label',
        BOOLEAN_ENABLED: 'Enabled',
        BOOLEAN_DISABLED: 'Disabled',
    },
    GENERATE_PLAYBOOK_WITH_AI_MODAL: {
        TITLE: '使用 AI 生成腳本',
        APPLY_BUTTON: '套用',
        PROMPT_LABEL: '描述您的自動化需求',
        PROMPT_PLACEHOLDER: '例如: 建立一個 shell 腳本來重啟 Kubernetes pod，需要傳入 namespace 和 pod 名稱...',
        GENERATE_BUTTON: '生成腳本',
        GENERATING_BUTTON: '生成中...',
        LOADING_MESSAGE: '正在生成 AI 分析報告，請稍候...',
        ERROR_MESSAGE: '無法生成腳本。請檢查您的提示或 API 金鑰並再試一次。',
        RESULTS_TITLE: '生成結果',
        SCRIPT_TYPE_LABEL: '腳本類型',
        CONTENT_LABEL: '腳本內容',
        PARAMETERS_LABEL: '偵測到的參數',
        NO_PARAMETERS_DETECTED: '未偵測到參數。',
    },
    EXECUTION_LOG_DETAIL: {
        STATUS: '狀態',
        SCRIPT_NAME: '腳本名稱',
        TRIGGER_SOURCE: '觸發來源',
        DURATION: '耗時',
        PARAMETERS: '執行參數',
        STDOUT: 'Standard Output (stdout)',
        STDERR: 'Standard Error (stderr)',
        TRIGGER_BY_TEMPLATE: '{source} by {by}',
        NO_STDOUT: 'No standard output.',
    },
    IMPORT_MODAL: {
        TITLE_TEMPLATE: '從 CSV 匯入{itemName}',
        INSTRUCTIONS_TITLE: '操作說明',
        DOWNLOAD_LINK: '下載 CSV 範本檔案',
        DRAG_TEXT: '拖曳 CSV 檔案至此',
        OR: '或',
        CLICK_TO_UPLOAD: '點擊此處上傳',
        INVALID_FILE_ERROR: '請上傳有效的 CSV 檔案。',
        IMPORT_SUCCESS_TEMPLATE: '{itemName} 已成功匯入。',
        IMPORT_ERROR_TEMPLATE: '無法匯入 {itemName}。請檢查檔案格式並再試一次。',
        START_IMPORT: '開始匯入',
        IMPORTING: '匯入中...',
        INSTRUCTIONS_STEPS: [
            '下載 CSV 範本檔案',
            '根據範本格式填寫您的資料。',
            '將填寫好的 CSV 檔案拖曳至下方區域或點擊上傳。',
        ],
    },

    // Pages & Modals
    PAGE_LAYOUTS: {
        incidents: {
            title: '事件',
            description: '監控和處理系統異常事件',
            kpi_page_name: '事件'
        },
        resources: {
            title: '資源',
            description: '探索、組織與管理您的所有基礎設施資源',
            kpi_page_name: '資源'
        },
        dashboards: {
            title: '儀表板',
            description: '統一的系統監控與業務洞察儀表板入口',
            kpi_page_name: '儀表板'
        },
        analysis: {
            title: '智慧排查',
            description: '深入了解系統趨勢、效能瓶頸和運營數據',
            kpi_page_name: '智慧排查'
        },
        automation: {
            title: '自動化',
            description: '提供自動化腳本管理、排程配置和執行追蹤功能',
            kpi_page_name: '自動化'
        },
        iam: {
            title: '身份與存取',
            description: '統一管理身份認證、存取權限和組織架構配置',
            kpi_page_name: '身份與存取'
        },
        notification: {
            title: '通知',
            description: '提供統一的通知策略配置、管道管理和歷史記錄查詢功能',
            kpi_page_name: '通知'
        },
        platform_settings: {
            title: '平台',
            description: '提供系統全域配置管理，包含標籤、郵件、身份驗證等功能',
            kpi_page_name: '平台'
        },
        profile: {
            title: '個人設定',
            description: '提供用戶個人資訊管理、偏好設定和安全配置功能',
            kpi_page_name: '個人設定'
        },
    },
    SRE_WAR_ROOM: {
        PAGE_KPI_NAME: "SREWarRoom",
        AI_BRIEFING_TITLE: 'AI 每日簡報',
        STABILITY_SUMMARY: '穩定性摘要',
        KEY_ANOMALY: '關鍵異常',
        RECOMMENDED_ACTION: '建議操作',
        SERVICE_HEALTH_TITLE: '服務健康度總覽',
        SERVICE_HEALTH_DESCRIPTION: '依照區域與服務顯示即時健康度熱圖。',
        RESOURCE_GROUP_STATUS_TITLE: '資源群組狀態',
        RESOURCE_GROUP_DESCRIPTION: '掌握各資源群組的健康狀態分佈與趨勢。',
        GENERATE_BRIEFING_ERROR: '無法生成 AI 簡報。請檢查 API 金鑰或稍後再試。',
        SERVICE_HEALTH_ERROR: '無法載入服務健康度資料。',
        RESOURCE_GROUP_ERROR: '無法載入資源群組狀態資料。',
        REFRESH_TOOLTIP: '重新整理資料',
        REFRESH_BRIEFING_TOOLTIP: '重新生成簡報',
        SERVICE_HEALTH_EMPTY_TITLE: '尚無健康度資料',
        SERVICE_HEALTH_EMPTY_DESCRIPTION: '稍後再試或調整觀測範圍。',
        SERVICE_HEALTH_MONITORED_LABEL: '監控服務 {count} 項',
        SERVICE_HEALTH_RANGE_LABEL: '觀測範圍',
        RESOURCE_GROUP_EMPTY_TITLE: '尚無群組狀態資料',
        RESOURCE_GROUP_EMPTY_DESCRIPTION: '暫無資源群組統計，請稍後再試。',
        RESOURCE_GROUP_RANGE_LABEL: '彙整區間',
        RESOURCE_GROUP_MONITORED_LABEL: '群組 {count} 個',
        SUMMARY_LABEL: '摘要',
        LAST_UPDATED_LABEL: '資料更新',
        TIMEZONE_LABEL: '時區',
    },
    INFRA_INSIGHTS: {
        TITLE: '基礎設施洞察',
        TIME_RANGE: '時間範圍',
        REFRESH: '刷新',
        EXPORT: '匯出',
        AI_RISK_PREDICTION_TITLE: 'AI 風險預測',
        RISK_DISTRIBUTION_TITLE: '風險等級分佈',
        KEY_RISK_RESOURCES_TITLE: '重點風險資源',
        RISK_LEVELS: {
            HIGH: '高風險',
            MEDIUM: '中風險',
            LOW: '低風險',
        },
        RISK_PREDICTION_ERROR: '無法生成 AI 風險預測。API 連線可能發生問題。',
        LOADING_TOPOLOGY: '載入拓撲資料中...',
    },
    CAPACITY_PLANNING: {
        TIME_RANGE_LABEL: '時間範圍',
        TRIGGER_AI_ANALYSIS: '觸發 AI 分析',
        EXPORT_REPORT: '匯出報表',
        TRENDS_CHART_TITLE: '資源使用趨勢 (含預測)',
        FORECAST_CHART_TITLE: 'CPU 容量預測模型',
        SERIES_LABELS: {
            CPU: 'CPU',
            CPU_FORECAST: 'CPU 預測',
            MEMORY: '記憶體',
            MEMORY_FORECAST: '記憶體預測',
            STORAGE: '儲存',
            STORAGE_FORECAST: '儲存預測',
        },
        FORECAST_MODEL_LEGEND: {
            PREDICTION: '預測',
            CONFIDENCE_BAND: '信賴區間',
        },
        AI_SUGGESTIONS_TITLE: 'AI 優化建議',
        SUGGESTION_DETECTED_AT_LABEL: '建議產生時間',
        DETAILED_ANALYSIS_TITLE: '詳細分析',
        TABLE_HEADERS: {
            RESOURCE_NAME: '資源名稱',
            CURRENT_USAGE: '目前用量',
            FORECAST_30D: '30 天預測',
            RECOMMENDATION: '建議',
            COST_ESTIMATE: '成本估算',
        },
        IMPACT: '影響',
        EFFORT: '投入',
        RECOMMENDATION_SEVERITY_LABELS: {
            critical: '緊急',
            warning: '注意',
            info: '建議',
        },
        RECOMMENDATION_ACTION_LABELS: {
            scale_up: '擴展',
            monitor: '觀察',
            optimize: '最佳化',
        },
        LAST_EVALUATED_AT_LABEL: '最後評估時間',
        FETCH_ERROR: '無法獲取容量規劃資料。',
        EXPORT_EMPTY_WARNING: '沒有可匯出的資料。',
        RETRY_BUTTON: '重試',
    },
    DASHBOARD_LIST: {
        SEARCH_PLACEHOLDER: '搜尋儀表板...',
        ADD_DASHBOARD: '新增儀表板',
        DELETE_MODAL_TITLE: '確認刪除',
        DELETE_MODAL_MESSAGE: '您確定要刪除儀表板 {name} 嗎？',
        TABLE_HEADERS: {
            NAME: '名稱',
            TYPE: '類型',
            CATEGORY: '類別',
            OWNER: '擁有者',
            UPDATED_AT: '最後更新',
        },
        ACTIONS: {
            SET_AS_HOME: '設為首頁',
            SETTINGS: '設定',
        },
        HOME_BADGE: '首頁',
        DEFAULT_DASHBOARD_TOOLTIP: '設為首頁儀表板',
        DEFAULT_DASHBOARD_ACTIVE_TOOLTIP: '已設為首頁儀表板',
        BUILT_IN_TOOLTIP: '內建儀表板',
        GRAFANA_TOOLTIP: 'Grafana 儀表板',
        ALL_CATEGORIES: '全部',
        FETCH_ERROR: '無法獲取儀表板。',
        SAVE_ERROR: 'Failed to save dashboard.',
        DELETE_ERROR: 'Failed to delete dashboard.',
        UPDATE_ERROR: 'Failed to update dashboard.',
        BATCH_DELETE_ERROR: 'Failed to delete selected dashboards.',
        COLUMN_CONFIG_SAVE_SUCCESS: '欄位設定已儲存。',
        COLUMN_CONFIG_SAVE_ERROR: '無法儲存欄位設定。',
        COLUMN_CONFIG_MISSING_ERROR: '無法儲存欄位設定：頁面設定遺失。',
    },
    ADD_DASHBOARD_MODAL: {
        STEP1_TITLE: '選擇儀表板類型',
        STEP2_TITLE: '連結 Grafana 儀表板',
        BUILT_IN_TITLE: '建立內建儀表板',
        BUILT_IN_DESC: '使用平台提供的小工具，拖拽組合出新的儀表板。',
        GRAFANA_TITLE: '連結外部 Grafana 儀表板',
        GRAFANA_DESC: '貼上 Grafana URL 或 UID，統一在平台內管理。',
        SELECT_GRAFANA_DASHBOARD: '從 Grafana 選擇儀表板 *',
        DASHBOARD_NAME: '儀表板名稱 *',
        BACK: '返回',
        SAVE_DASHBOARD: '儲存',
        PLACEHOLDER_NAME: 'e.g., Production API Metrics',
        SELECT_PLACEHOLDER: '請選擇一個儀表板...',
    },
    DASHBOARD_EDITOR: {
        EDIT_TITLE: '編輯儀表板:',
        CREATE_TITLE: '建立儀表板:',
        DEFAULT_NAME: '未命名儀表板',
        DEFAULT_DESCRIPTION: '使用者建立的內建儀表板。',
        ADD_WIDGET: '新增小工具',
        SAVE_DASHBOARD: '儲存儀表板',
        EMPTY_STATE_TITLE: '空儀表板',
        EMPTY_STATE_MESSAGE: '點擊「新增小工具」開始建立您的儀表板。',
        ADD_WIDGET_MODAL_TITLE: '新增小工具至儀表板',
        ADD_WIDGET_TITLE: '新增',
        REMOVE_WIDGET_TITLE: '移除小工具',
        NAME_REQUIRED_ERROR: '儀表板名稱為必填。',
        SAVE_SUCCESS: '儀表板 "{name}" 已成功儲存。',
        UPDATE_SUCCESS: '儀表板 "{name}" 已成功更新。',
        SAVE_ERROR: '儲存儀表板失敗。',
        UPDATE_ERROR: '更新儀表板失敗。',
        LOAD_ERROR: '無法載入儀表板資料。',
        EDITOR_LOAD_ERROR: '無法載入編輯器所需資料。',
        CANCEL_BUTTON: '取消',
    },
    DASHBOARD_TEMPLATES: {
        USE_TEMPLATE: '使用此範本',
    },
    INCIDENT_LIST: {
        SEARCH_PLACEHOLDER: '搜索和篩選',
        AI_ANALYSIS: 'AI 分析',
        ACKNOWLEDGE: '認領',
        RESOLVE: '解決',
        SILENCE: '靜音',
        TABLE_HEADERS: {
            SUMMARY: '摘要',
            STATUS: '狀態',
            SEVERITY: '嚴重程度',
            IMPACT: '影響範圍',
            RESOURCE: '資源',
            ASSIGNEE: '處理人',
            TRIGGERED_AT: '觸發時間',
        },
        FETCH_ERROR: '無法獲取事故列表。',
        NO_EXPORT_DATA: '沒有可匯出的資料。',
        ACKNOWLEDGE_ACTION: '認領',
        COLUMN_CONFIG_SAVE_SUCCESS: '欄位設定已儲存。',
        COLUMN_CONFIG_SAVE_ERROR: '無法儲存欄位設定。',
        COLUMN_CONFIG_MISSING_ERROR: '無法儲存欄位設定：頁面設定遺失。',
        SILENCE_RULE_CREATE_ERROR: 'Failed to create silence rule.',
    },
    INCIDENT_DETAIL: {
        TITLE: '事故詳情: {id}',
        LOAD_ERROR_TITLE: '事故載入失敗',
        LOAD_ERROR_MESSAGE: '找不到 ID 為 "{id}" 的事故。',
        DETAILS_TITLE: '詳細資訊',
        AI_ANALYSIS_TITLE: 'AI 自動分析',
        TIMELINE_TITLE: '時間軸',
        NO_AI_ANALYSIS: '此事故尚無 AI 分析報告。',
        NO_AI_ANALYSIS_HINT: '您可以在頂部操作列點擊「AI 分析」來產生報告。',
        STATUS: '狀態',
        SEVERITY: '嚴重性',
        IMPACT: '影響範圍',
        ASSIGNEE: '指派給',
        RESOURCE: '資源',
        RULE: '規則',
        TRIGGER_TIME: '觸發時間',
    },
    ALERT_RULE_LIST: {
        ADD_RULE: '新增規則',
        TABLE_HEADERS: {
            ENABLED: '',
            NAME: '規則名稱',
            TARGET: '監控對象',
            CONDITIONS: '觸發條件',
            SEVERITY: '嚴重程度',
            AUTOMATION: '自動化',
            CREATOR: '創建者',
            UPDATED_AT: '最後更新',
        },
        ACTIONS: {
            EDIT: '編輯',
            TEST: '測試',
            COPY: '複製',
            DELETE: '刪除',
        },
        DELETE_MODAL_MESSAGE: '您確定要刪除告警規則 {name} 嗎？',
        FETCH_ERROR: '無法獲取告警規則。',
        SAVE_ERROR: 'Failed to save rule.',
        DELETE_ERROR: 'Failed to delete rule.',
        TOGGLE_ERROR: 'Failed to toggle rule status.',
        BATCH_ACTION_ERROR: 'Failed to {action} selected rules.',
    },
    ALERT_RULE_EDIT_MODAL: {
        ADD_TITLE: '新增告警規則',
        EDIT_TITLE: '編輯告警規則',
        APPLY_TEMPLATE: '快速套用範本',
        STEP_TITLES: ["基本資訊", "觸發條件", "事件內容", "自動化"],
        TEMPLATES: {
            TITLE: '選擇一個範本',
            SEARCH_PLACEHOLDER: '搜尋範本名稱或關鍵字…',
            TYPE_FILTER: '監控目標類型',
            INTRO: '依資源類型或關鍵字快速鎖定合適範本，系統會自動帶入預設條件、通知與自動化設定。',
            SUMMARY_LABEL: '範本重點',
            SELECTED_BADGE: '已選用',
            EMPTY_STATE: '找不到符合條件的範本。',
            SUMMARIES: {
                'art-001': '適用於監控生產環境的 CPU 使用率，並在持續高於門檻時建議自動擴展。',
                'art-002': '在磁碟剩餘空間過低時觸發，提醒立即釋放空間或擴充容量。',
                'art-003': '偵測資料庫連線錯誤率上升，以利提前排查服務異常或網路問題。',
            },
            PREVIEW_CONDITIONS: '觸發條件摘要',
            PREVIEW_NOTIFICATION: '通知樣板',
            PREVIEW_AUTOMATION: '自動化流程',
        },
        BASIC_INFO: {
            NAME: '規則名稱 *',
            NAME_DESCRIPTION: '顯示於列表與通知內的標題，建議 60 字內並清楚說明影響範圍。',
            DESCRIPTION: '描述',
            DESCRIPTION_DESCRIPTION: '補充規則的目的與適用場景，協助其他成員快速理解。',
            TARGET_TYPE_LABEL: '目標類型',
            SCOPE_TITLE: '監控範圍',
            SCOPE_DESCRIPTION: '定義此告警規則將監控哪些資源，可依類型、群組或特定資源設定。',
            SCOPE_MODE_LABEL: '監控方式',
            SCOPE_MODES: {
                all: '所有資源 (依類型)',
                group: '依資源群組選擇',
                specific: '依特定資源選擇',
            },
            GROUP_LABEL: '資源群組',
            GROUP_PLACEHOLDER: '選擇一個或多個資源群組…',
            RESOURCE_LABEL: '特定資源',
            RESOURCE_PLACEHOLDER: '選擇一個或多個特定資源…',
            FILTER_TITLE: '附加篩選條件 (可選)',
            FILTER_DESCRIPTION: [
                '以逗號分隔可輸入多個值，例如：api,web。',
                '支援使用 `~` 作為前綴撰寫正規表示式，例如：~^prod-。',
            ],
            FILTER_ADD_LABEL: '新增篩選條件',
            FILTER_KEY_PLACEHOLDER: '標籤鍵',
            FILTER_VALUE_PLACEHOLDER: '標籤值或逗號分隔多值',
            PREVIEW_TITLE: '匹配資源預覽',
            PREVIEW_DESCRIPTION: '依據目前設定自動計算符合條件的資源數量。',
            PREVIEW_BADGE_SUFFIX: ' 個資源',
        },
        CONDITIONS: {
            GROUP_TITLE_TEMPLATE: '條件群組 #{index}（以 OR 串接）',
            EVENT_SEVERITY: '事件等級',
            EVENT_SEVERITY_HINT: '設定當群組條件成立時事件應標記的嚴重度。',
            ADD_AND: '新增 AND 條件',
            ADD_OR: '新增 OR 條件群組',
            METRIC_PLACEHOLDER: '選擇指標…',
            OPERATOR_LABEL: '運算子',
            THRESHOLD_PLACEHOLDER: '閾值',
            DURATION_PLACEHOLDER: '持續時間（分鐘）',
        },
        CONTENT: {
            TITLE: '事件標題 *',
            TITLE_DESCRIPTION: '用於通知與事件列表的標題，可插入下方變數保持一致性。',
            CONTENT: '事件內容 *',
            CONTENT_DESCRIPTION: '建議描述指標狀態、影響與建議處置步驟。',
            VARIABLES: '可用的變數',
            VARIABLES_DESCRIPTION: '點擊即可插入至游標位置：',
            VARIABLE_HINTS: [
                { token: '{{severity}}', description: '事件嚴重度，例如 critical。' },
                { token: '{{resource.name}}', description: '資源顯示名稱。' },
                { token: '{{metric}}', description: '觸發的監控指標 ID。' },
                { token: '{{value}}', description: '指標的即時數值。' },
                { token: '{{threshold}}', description: '設定的告警門檻。' },
                { token: '{{duration}}', description: '條件成立的時間長度。' },
            ],
            LABEL_SECTION_TITLE: '規則與事件標籤',
            LABEL_SECTION_DESCRIPTION: '為告警規則及其產生的事件建立分類標籤，支援通知路由、搜尋與報表。',
            LABEL_ADD_LABEL: '新增標籤',
            LABEL_KEY_PLACEHOLDER: '標籤鍵',
            LABEL_VALUE_PLACEHOLDER: '標籤值或逗號分隔多值',
        },
        AUTOMATION: {
            ENABLE: '啟用自動化響應',
            ENABLE_DESCRIPTION: '在規則觸發時自動執行預先配置的腳本，例如擴展資源或開啟工單。',
            SELECT_SCRIPT: '選擇腳本',
            SELECT_SCRIPT_PLACEHOLDER: '選擇一個腳本...',
            SELECT_SCRIPT_DESCRIPTION: '腳本清單同步自自動化腳本管理，可先前往該頁建立或調整內容。',
            SCRIPT_PARAMS: '腳本參數',
            NO_PARAMS: '此腳本無需額外參數。',
            TOGGLE_LABELS: {
                enabled: '已啟用',
                disabled: '未啟用',
            },
            BOOLEAN_PARAM_LABELS: {
                true: '啟用',
                false: '停用',
            },
            PARAM_HINTS: {
                namespace: { description: '輸入 Kubernetes 命名空間，例如 production。' },
                instance_count: { description: '輸入要擴展的實例數量，例如 3 台。', unit: '台' },
            },
        },
    },
    SILENCE_RULE_LIST: {
        ADD_RULE: '新增規則',
        TABLE_HEADERS: {
            ENABLED: '',
            NAME: '規則名稱',
            TYPE: '類型',
            MATCHERS: '靜音條件',
            SCHEDULE: '排程',
            CREATOR: '創建者',
            CREATED_AT: '創建時間',
        },
        DELETE_MODAL_MESSAGE: '您確定要刪除靜音規則 {name} 嗎？',
        FETCH_ERROR: '無法獲取靜音規則。',
        SAVE_ERROR: 'Failed to save rule.',
        DELETE_ERROR: 'Failed to delete rule.',
        TOGGLE_ERROR: 'Failed to toggle rule status.',
        BATCH_ACTION_ERROR: 'Failed to {action} selected rules.',
    },
    SILENCE_RULE_EDIT_MODAL: {
        ADD_TITLE: '新增靜音規則',
        EDIT_TITLE: '編輯靜音規則',
        STEP_TITLES: ["基本資訊", "設定排程", "設定範圍"],
        BASIC_INFO: {
            APPLY_TEMPLATE: '快速套用範本',
            NAME: '規則名稱 *',
            DESCRIPTION: '描述',
        },
        SCHEDULE: {
            TYPE: '排程類型',
            SINGLE: '單次靜音',
            RECURRING: '週期性靜音',
            START_TIME: '開始時間',
            END_TIME: '結束時間',
            FREQUENCY: '重複頻率',
            EXECUTION_TIME: '執行時間',
            SELECT_WEEKDAYS: '選擇星期',
            WEEKDAYS: ['日', '一', '二', '三', '四', '五', '六'],
            CRON_EXPRESSION: 'Cron 表達式',
            CRON_EXAMPLE: "範例: '0 2 * * *' 表示每天凌晨 2 點。",
            RECURRENCE_TYPES: {
                DAILY: '每日',
                WEEKLY: '每週',
                MONTHLY: '每月',
                CUSTOM: '自訂 Cron',
            },
        },
        SCOPE: {
            TITLE: '静音條件',
            DESCRIPTION: '定義符合哪些條件的事件將會被靜音。',
            ADD_MATCHER: '新增匹配條件',
            ENABLE_RULE: '立即啟用此靜音規則',
            SELECT_KEY: '選擇標籤鍵...',
            SELECT_VALUE: '選擇值...',
            VALUE_PLACEHOLDER: '標籤值（例如：api-service）',
        },
    },
    RESOURCE_LIST: {
        SEARCH_PLACEHOLDER: '搜索和篩選',
        ADD_RESOURCE: '新增資源',
        TABLE_HEADERS: {
            STATUS: '狀態',
            NAME: '名稱',
            TYPE: '類型',
            PROVIDER: 'PROVIDER',
            REGION: 'REGION',
            OWNER: '擁有者',
            LAST_CHECK_IN: '最後簽入',
        },
        ACTIONS: {
            VIEW_DETAILS: '查看詳情',
        },
        DELETE_MODAL_MESSAGE: '您確定要刪除資源 {name} 嗎？',
        FETCH_ERROR: '無法獲取資源列表。',
        SAVE_ERROR: 'Failed to save resource.',
        DELETE_ERROR: 'Failed to delete resource.',
        BATCH_DELETE_ERROR: 'Failed to delete selected resources.',
    },
    RESOURCE_DETAIL: {
        LOAD_ERROR_TITLE: '資源載入失敗',
        LOAD_ERROR_MESSAGE: '找不到 ID 為 "{id}" 的資源。',
        CPU_CHART_TITLE: 'CPU Usage (last 30min)',
        MEMORY_CHART_TITLE: 'Memory Usage (last 30min)',
        RELATED_INCIDENTS_TITLE: '相關事件 (最近 3 筆)',
        NO_RELATED_INCIDENTS: '沒有相關的事件。',
        STATUS: '狀態',
        TYPE: '類型',
        PROVIDER_REGION: '提供商 / 區域',
        OWNER: '擁有者',
    },
    AUTOMATION_PLAYBOOKS: {
        ADD_SCRIPT: '新增腳本',
        DELETE_MODAL_MESSAGE: '您確定要刪除腳本 {name} 嗎？',
        FETCH_ERROR: '無法獲取自動化腳本。',
        SAVE_ERROR: 'Failed to save playbook.',
        DELETE_ERROR: 'Failed to delete playbook.',
        BATCH_DELETE_ERROR: 'Failed to delete selected playbooks.',
        RUN_ERROR: 'Failed to run playbook.',
        TABLE_HEADERS: {
            NAME: '腳本名稱',
            TRIGGER: '觸發器',
            LAST_RUN_STATUS: '上次運行狀態',
            LAST_RUN_TIME: '上次運行時間',
            RUN_COUNT: '運行次數',
        },
        ACTIONS: {
            RUN: '運行',
            EDIT: '編輯',
            DELETE: '刪除',
        }
    },
    PERSONNEL_MANAGEMENT: {
        SEARCH_PLACEHOLDER: '依名稱、Email、角色搜尋...',
        INVITE: '邀請人員',
        TABLE_HEADERS: {
            NAME: '名稱',
            ROLE: '角色',
            TEAM: '團隊',
            STATUS: '狀態',
            LAST_LOGIN: '上次登入',
        },
        DELETE_MODAL_MESSAGE: '您確定要刪除使用者 {name} 嗎？',
        FETCH_ERROR: '無法獲取人員列表。',
        INVITE_ERROR: 'Failed to invite user.',
        SAVE_ERROR: 'Failed to save user.',
        DELETE_ERROR: 'Failed to delete user.',
        BATCH_ACTION_ERROR: 'Failed to {action} selected users.',
    },
    TAG_MANAGEMENT: {
        ALL_CATEGORIES_VALUE: 'All',
        ALL_CATEGORIES_LABEL: '所有分類',
    },
    LAYOUT_SETTINGS: {
        INFO_TEXT: '調整各中心頁面的 KPI 卡片及順序。儲存後立即生效。',
        AVAILABLE_WIDGETS: '可選欄位',
        DISPLAYED_WIDGETS: '已顯示欄位',
        EMPTY_AVAILABLE_COLUMNS: '所有欄位皆已顯示。',
        EMPTY_DISPLAYED_COLUMNS: '目前未選擇任何欄位。',
        REORDER_HINT: '拖曳圖示搭配上下箭頭可調整欄位顯示順序。',
        CURRENTLY_DISPLAYED: '目前顯示的卡片：',
        NO_CARDS_DISPLAYED: '此頁面未顯示任何卡片。',
        LAST_UPDATED: '最後更新：{date} 由 {by}',
        EDIT_MODAL_TITLE: 'Edit "{pageName}" KPI Cards',
        FETCH_ERROR: '無法獲取版面配置資料。',
        SAVE_ERROR: 'Failed to save layout configuration.',
        EDIT_BUTTON: 'Edit',
        KPI_CARD_COLOR_LABELS: {
            default: '預設',
            success: '成功',
            warning: '警示',
            error: '錯誤',
            info: '資訊',
            performance: '效能',
            monitoring: '監控',
        },
        PREVIEW_HINT: '顯示選定卡片的實際樣式',
        COLOR_HELPER_TEXT: '建議依據指標狀態選擇對應顏色，例如警示類型使用 Warning、失敗使用 Error。',
    },
    LICENSE_PAGE: {
        TITLE: '社群版',
        DESCRIPTION: '您目前正在使用 SRE Platform 的社群版。升級至商業版以解鎖更多進階功能，並獲得完整的技術支援。',
        COMMERCIAL_FEATURES_TITLE: '商業版功能包含：',
        FEATURES_LIST: [
            '進階 AI 洞察與根因分析',
            '跨團隊協作與權限管理 (SSO/LDAP)',
            '無限制的數據保留時間',
            '客製化報表與儀表板',
            '7x24 小時企業級技術支援',
        ],
        CONTACT_LINK: '聯絡我們以升級',
        CONTACT_EMAIL: 'sales@sre-platform.dev',
    },
};

export type PageContent = typeof PAGE_CONTENT;

const MOCK_METRIC_METADATA: MetricMetadata[] = [
    { id: 'cpu_usage_percent', name: 'CPU Usage', unit: '%' },
    { id: 'memory_usage_percent', name: 'Memory Usage', unit: '%' },
    { id: 'disk_free_percent', name: 'Disk Free Space', unit: '%' },
    { id: 'db_connection_error_rate', name: 'DB Connection Error Rate', unit: '%' },
    { id: 'api_latency_p99_ms', name: 'API p99 Latency', unit: 'ms' },
    { id: 'http_5xx_error_rate', name: 'HTTP 5xx Error Rate', unit: '%' },
    { id: 'queue_depth', name: 'Queue Depth', unit: null },
];

const MOCK_RESOURCE_TYPES: ResourceType[] = [
    { id: 'host', name: 'Host/VM', icon: 'server' },
    { id: 'kubernetes', name: 'Kubernetes Pod', icon: 'box' },
    { id: 'database', name: 'Database', icon: 'database' },
    { id: 'application', name: 'Application', icon: 'app-window' },
    { id: 'network', name: 'Network Device', icon: 'network' },
];

const MOCK_EXPORTER_TYPES = [
    { id: 'none', name: 'None', description: 'No monitoring agent' },
    { id: 'node_exporter', name: 'Node Exporter', description: 'Prometheus node exporter for system metrics' },
    { id: 'snmp_exporter', name: 'SNMP Exporter', description: 'SNMP protocol monitoring' },
    { id: 'modbus_exporter', name: 'Modbus Exporter', description: 'Industrial Modbus protocol monitoring' },
    { id: 'ipmi_exporter', name: 'IPMI Exporter', description: 'Hardware monitoring via IPMI' },
];

const MOCK_SYSTEM_CONFIG = {
    default_dashboard: 'sre-war-room',
    api_base_url: DEFAULT_API_BASE_URL,
    theme: 'dark',
    auto_refresh_interval: 30000,
    max_login_attempts: 5,
    session_timeout: 3600,
};

const MOCK_COMMANDS = [
    { id: 'cmd_new_incident', name: '> New Incident', description: 'Create a new incident report', icon: 'plus-circle', action_key: 'new_incident' },
    { id: 'cmd_silence_resource', name: '> Silence Resource', description: 'Temporarily silence alerts for a specific resource', icon: 'bell-off', action_key: 'silence_resource' },
    { id: 'cmd_run_playbook', name: '> Run Playbook', description: 'Execute an automation playbook', icon: 'play-circle', action_key: 'run_playbook' },
    { id: 'cmd_change_theme', name: '> Change Theme', description: 'Switch between light and dark mode', icon: 'sun-moon', action_key: 'change_theme' },
];

const MOCK_COMMAND_PALETTE_CONTENT = {
    TITLE: 'Command Palette',
    SEARCH_PLACEHOLDER: 'Search...',
    PLACEHOLDER_ROOT: 'Search or type `>` for commands...',
    PLACEHOLDER_SILENCE_SEARCH: 'Search for a resource to silence...',
    PLACEHOLDER_SILENCE_DURATION: 'Enter duration (e.g., 30m, 2h, 1d)...',
    PLACEHOLDER_RUN_PLAYBOOK: 'Search for a playbook to run...',
    SILENCE_PREFIX_TEMPLATE: 'Silence {name}',
    RUN_PLAYBOOK_PREFIX: 'Run Playbook',
    NO_RESULTS: 'No results found.',
};

const MOCK_EXECUTION_LOG_DETAIL_CONTENT = {
    STATUS: '狀態',
    SCRIPT_NAME: '腳本名稱',
    TRIGGER_SOURCE: '觸發來源',
    DURATION: '耗時',
    PARAMETERS: '執行參數',
    STDOUT: 'Standard Output (stdout)',
    STDERR: 'Standard Error (stderr)',
    TRIGGER_BY_TEMPLATE: '{source} by {by}',
    NO_STDOUT: 'No standard output.',
};

const MOCK_IMPORT_MODAL_CONTENT = {
    TITLE_TEMPLATE: '從 CSV 匯入{itemName}',
    INSTRUCTIONS_TITLE: '操作說明',
    DOWNLOAD_LINK: '下載 CSV 範本檔案',
    DRAG_TEXT: '拖曳 CSV 檔案至此',
    OR: '或',
    CLICK_TO_UPLOAD: '點擊此處上傳',
    INVALID_FILE_ERROR: '請上傳有效的 CSV 檔案。',
    IMPORT_SUCCESS_TEMPLATE: '{itemName} 已成功匯入。',
    IMPORT_ERROR_TEMPLATE: '無法匯入 {itemName}。請檢查檔案格式並再試一次。',
    START_IMPORT: '開始匯入',
    IMPORTING: '匯入中...',
    INSTRUCTIONS_STEPS: [
        '下載 CSV 範本檔案',
        '根據範本格式填寫您的資料。',
        '將填寫好的 CSV 檔案拖曳至下方區域或點擊上傳。',
    ],
};

const MOCK_ALL_COLUMNS: Record<string, TableColumn[]> = {
    dashboards: [
        { key: 'name', label: '儀表板名稱' },
        { key: 'type', label: '類型' },
        { key: 'category', label: '分類' },
        { key: 'owner', label: '擁有者' },
        { key: 'updated_at', label: '最後更新' },
    ],
    incidents: [
        { key: 'summary', label: '摘要' },
        { key: 'status', label: '狀態' },
        { key: 'severity', label: '嚴重程度' },
        { key: 'impact', label: '影響範圍' },
        { key: 'resource', label: '資源' },
        { key: 'assignee', label: '處理人' },
        { key: 'tags', label: '標籤' },
        { key: 'occurred_at', label: '發生時間' },
    ],
    resources: [
        { key: 'status', label: '狀態' },
        { key: 'name', label: '名稱' },
        { key: 'type', label: '類型' },
        { key: 'event_count', label: '事件數', sortable: true },
        { key: 'cpu_usage', label: 'CPU 使用率', sortable: true, sort_key: 'metrics.cpu' },
        { key: 'memory_usage', label: '記憶體使用率', sortable: true, sort_key: 'metrics.memory' },
        { key: 'provider', label: '供應商' },
        { key: 'region', label: '地區' },
        { key: 'owner', label: '擁有者' },
        { key: 'last_check_in_at', label: '最後簽入' },
    ],
    resource_groups: [
        { key: 'name', label: '群組名稱' },
        { key: 'owner_team', label: '擁有團隊' },
        { key: 'member_ids', label: '成員數量' },
        { key: 'status_summary', label: '狀態' },
    ],
    alert_rules: [
        { key: 'enabled', label: '啟用' },
        { key: 'name', label: '規則名稱' },
        { key: 'target', label: '監控對象' },
        { key: 'conditions_summary', label: '觸發條件' },
        { key: 'severity', label: '嚴重程度' },
        { key: 'automation_enabled', label: '自動化' },
        { key: 'creator', label: '創建者' },
        { key: 'updated_at', label: '最後更新' },
    ],
    silence_rules: [
        { key: 'enabled', label: '啟用' },
        { key: 'name', label: '規則名稱' },
        { key: 'type', label: '類型' },
        { key: 'matchers', label: '靜音條件' },
        { key: 'schedule', label: '排程' },
        { key: 'creator', label: '創建者' },
        { key: 'created_at', label: '創建時間' },
    ],
    automation_playbooks: [
        { key: 'name', label: '腳本名稱' },
        { key: 'trigger', label: '觸發器' },
        { key: 'last_run_status', label: '上次運行狀態' },
        { key: 'last_run_at', label: '上次運行時間' },
        { key: 'run_count', label: '運行次數' },
    ],
    automation_triggers: [
        { key: 'enabled', label: '啟用' },
        { key: 'name', label: '名稱' },
        { key: 'type', label: '類型' },
        { key: 'target_playbook_id', label: '目標腳本' },
        { key: 'last_triggered_at', label: '上次觸發' },
    ],
    automation_history: [
        { key: 'script_name', label: '腳本名稱' },
        { key: 'status', label: '狀態' },
        { key: 'trigger_source', label: '觸發來源' },
        { key: 'triggered_by', label: '觸發者' },
        { key: 'start_time', label: '開始時間' },
        { key: 'duration_ms', label: '耗時' },
    ],
    personnel: [
        { key: 'name', label: '名稱' },
        { key: 'role', label: '角色' },
        { key: 'team', label: '團隊' },
        { key: 'status', label: '狀態' },
        { key: 'last_login_at', label: '上次登入' },
    ],
    teams: [
        { key: 'name', label: '團隊名稱' },
        { key: 'owner_id', label: '擁有者' },
        { key: 'member_ids', label: '成員數' },
        { key: 'created_at', label: '創建時間' },
    ],
    roles: [
        { key: 'enabled', label: '啟用' },
        { key: 'name', label: '角色名稱' },
        { key: 'user_count', label: '使用者數量' },
        { key: 'created_at', label: '創建時間' },
    ],
    audit_logs: [
        { key: 'timestamp', label: '時間' },
        { key: 'user', label: '使用者' },
        { key: 'action', label: '操作' },
        { key: 'target', label: '目標' },
        { key: 'result', label: '結果' },
        { key: 'ip', label: 'IP 位址' },
    ],
    notification_strategies: [
        { key: 'enabled', label: '啟用' },
        { key: 'name', label: '策略名稱' },
        { key: 'trigger_condition', label: '觸發條件' },
        { key: 'channel_count', label: '管道數' },
        { key: 'severity_levels', label: '嚴重程度' },
        { key: 'impact_levels', label: '影響範圍' },
        { key: 'creator', label: '創建者' },
        { key: 'updated_at', label: '最後更新' },
    ],
    notification_channels: [
        { key: 'enabled', label: '啟用' },
        { key: 'name', label: '管道名稱' },
        { key: 'type', label: '類型' },
        { key: 'last_test_result', label: '最新發送結果' },
        { key: 'last_tested_at', label: '最新發送時間' },
    ],
    notification_history: [
        { key: 'timestamp', label: '時間' },
        { key: 'strategy', label: '策略' },
        { key: 'channel', label: '管道' },
        { key: 'recipient', label: '接收者' },
        { key: 'status', label: '狀態' },
        { key: 'content', label: '內容' },
    ],
    tag_management: [
        { key: 'key', label: '標籤鍵' },
        { key: 'description', label: '說明' },
        { key: 'enum_values', label: '標籤值' },
        { key: 'required', label: '必填' },
        { key: 'scopes', label: '適用範圍' },
        { key: 'writable_roles', label: '可寫入角色' },
    ],
    datasources: [
        { key: 'name', label: '資料來源名稱' },
        { key: 'type', label: '類型' },
        { key: 'status', label: '狀態' },
        { key: 'url', label: '連接位址' },
        { key: 'created_at', label: '建立時間' },
        { key: 'updated_at', label: '最後更新' },
    ],
    autodiscovery: [
        { key: 'name', label: '任務名稱' },
        { key: 'kind', label: '類型' },
        { key: 'status', label: '狀態' },
        { key: 'schedule', label: '排程' },
        { key: 'last_run_at', label: '最後執行' },
        { key: 'created_at', label: '建立時間' },
    ],
};

const MOCK_PAGE_METADATA: Record<string, { column_config_key: string }> = {
    'dashboards': { column_config_key: 'dashboards' },
    'incidents': { column_config_key: 'incidents' },
    'resources': { column_config_key: 'resources' },
    'datasources': { column_config_key: 'datasources' },
    'autodiscovery': { column_config_key: 'autodiscovery' },
    'personnel': { column_config_key: 'personnel' },
    'alert_rules': { column_config_key: 'alert_rules' },
    'silence_rules': { column_config_key: 'silence_rules' },
    'resource_groups': { column_config_key: 'resource_groups' },
    'automation_playbooks': { column_config_key: 'automation_playbooks' },
    'automation_history': { column_config_key: 'automation_history' },
    'automation_triggers': { column_config_key: 'automation_triggers' },
    'teams': { column_config_key: 'teams' },
    'roles': { column_config_key: 'roles' },
    'audit_logs': { column_config_key: 'audit_logs' },
    'tag_management': { column_config_key: 'tag_management' },
    'notification_strategies': { column_config_key: 'notification_strategies' },
    'notification_channels': { column_config_key: 'notification_channels' },
    'notification_history': { column_config_key: 'notification_history' },
    'ResourceOverview': { column_config_key: '' },
};

const MOCK_ICON_MAP: Record<string, string> = {
    'home': 'home',
    'incidents': 'shield-alert',
    'resources': 'database-zap',
    'dashboard': 'layout-dashboard',
    'analyzing': 'activity',
    'automation': 'bot',
    'settings': 'settings',
    'identity-access-management': 'users',
    'notification-management': 'bell',
    'platform-settings': 'sliders-horizontal',
    'MenuFoldOutlined': 'menu',
    'MenuUnfoldOutlined': 'menu',
    'menu-fold': 'align-justify',
    'menu-unfold': 'align-left',
    'deployment-unit': 'box',
};

const MOCK_CHART_COLORS: ChartTheme = {
    palette: ['#38bdf8', '#a78bfa', '#34d399', '#f87171', '#f5f4a9', '#60a5fa'],
    text: {
        primary: '#f8fafc',
        secondary: '#94a3b8',
    },
    grid: {
        axis: '#94a3b8',
        split_line: '#334155',
    },
    background: {
        card: '#0f172a',
        accent: '#1e293b',
    },
    health_gauge: {
        critical: '#dc2626',
        warning: '#f97316',
        healthy: '#10b981',
    },
    event_correlation: ['#dc2626', '#f97316', '#10b981'],
    severity: {
        critical: '#dc2626',
        warning: '#f97316',
        info: '#10b981',
    },
    log_levels: {
        error: '#f87171',
        warning: '#facc15',
        info: '#38bdf8',
        debug: '#94a3b8',
    },
    capacity_planning: {
        cpu: '#38bdf8',
        memory: '#a78bfa',
        storage: '#34d399',
        forecast: '#facc15',
        baseline: '#64748b',
    },
    resource_distribution: {
        primary: '#38bdf8',
        border: '#1e293b',
        axis: '#94a3b8',
    },
    pie: {
        high: '#dc2626',
        medium: '#f97316',
        low: '#10b981',
    },
    topology: {
        node_border: '#f8fafc',
        node_label: '#cbd5e1',
        edge: '#475569',
    },
    heatmap: {
        critical: '#dc2626',
        warning: '#f97316',
        healthy: '#10b981',
    },
} as const;

const MOCK_NAV_ITEMS: NavItem[] = [
    { key: 'home', label: '首頁', icon: 'home' },
    { key: 'incidents', label: '事件', icon: 'shield-alert' },
    { key: 'resources', label: '資源', icon: 'database-zap' },
    { key: 'dashboards', label: '儀表板', icon: 'layout-dashboard' },
    { key: 'analyzing', label: '智慧排查', icon: 'activity' },
    { key: 'automation', label: '自動化', icon: 'bot' },
    {
        key: 'settings',
        label: '設定',
        icon: 'settings',
        children: [
            { key: 'settings/identity-access-management', label: '身份與存取', icon: 'users' },
            { key: 'settings/notification-management', label: '通知', icon: 'bell' },
            { key: 'settings/platform-settings', label: '平台', icon: 'sliders-horizontal' },
        ],
    },
];
const MOCK_DASHBOARDS: Dashboard[] = [
    {
        id: 'sre-war-room',
        name: 'SRE 戰情室',
        type: 'built-in',
        category: '業務與 SLA',
        description: '跨團隊即時戰情看板，聚焦重大事件與 SLA 指標。',
        owner: '事件指揮中心',
        created_at: '2025-09-18T17:15:00Z',
        updated_at: '2025-09-18T17:15:00Z',
        path: '/sre-war-room',
        resource_ids: ['res-001', 'res-002', 'res-003', 'res-007'],
    },
    {
        id: 'infrastructure-insights',
        name: '基礎設施洞察',
        type: 'built-in',
        category: '基礎設施',
        description: '整合多雲與多中心資源健康狀態。',
        owner: 'SRE 平台團隊',
        created_at: '2025-09-18T16:30:00Z',
        updated_at: '2025-09-18T16:30:00Z',
        path: '/dashboard/infrastructure-insights',
        resource_ids: ['res-001', 'res-002', 'res-003', 'res-004'],
    },
    {
        id: 'resource-overview',
        name: '資源總覽儀表板',
        type: 'built-in',
        category: '基礎設施',
        description: '提供所有已納管資源的宏觀視圖，包含類型分佈、提供商分佈等關鍵指標。',
        owner: 'SRE 平台團隊',
        created_at: '2025-09-27T10:00:00Z',
        updated_at: '2025-09-27T10:00:00Z',
        path: '/dashboard/resource-overview',
        resource_ids: ['res-001', 'res-002', 'res-003', 'res-004', 'res-007'],
    },
    {
        id: 'api-service-status',
        name: 'API 服務狀態',
        type: 'grafana',
        category: '業務與 SLA',
        description: 'API 響應時間、錯誤率、吞吐量等服務指標。',
        owner: 'SRE 平台團隊',
        created_at: '2025-09-18T16:45:00Z',
        updated_at: '2025-09-18T16:45:00Z',
        path: '/dashboard/api-service-status',
        grafana_url: `${DEFAULT_GRAFANA_BASE_URL}/d/aead3d54-423b-4a91-b91c-dbdf40d7fff5`,
        grafana_dashboard_uid: 'aead3d54-423b-4a91-b91c-dbdf40d7fff5',
        grafana_folder_uid: 'biz-folder',
        resource_ids: ['res-001', 'res-007'],
    },
    {
        id: 'user-experience-monitoring',
        name: '用戶體驗監控',
        type: 'grafana',
        category: '營運與容量',
        description: '頁面載入時間、用戶行為分析、錯誤追蹤。',
        owner: '前端團隊',
        created_at: '2025-09-18T17:00:00Z',
        updated_at: '2025-09-18T17:00:00Z',
        path: '/dashboard/user-experience-monitoring',
        grafana_url: `${DEFAULT_GRAFANA_BASE_URL}/d/another-dashboard-id-for-ux`,
        grafana_dashboard_uid: 'another-dashboard-id-for-ux',
        grafana_folder_uid: 'ux-folder',
        resource_ids: ['res-004'],
    },
    {
        id: 'custom-built-in-1',
        name: 'My Custom Dashboard',
        type: 'built-in',
        category: '團隊自訂',
        description: 'A custom dashboard created by a user.',
        owner: 'Admin User',
        created_at: '2025-09-20T11:00:00Z',
        updated_at: '2025-09-20T11:00:00Z',
        path: '/dashboard/custom-built-in-1',
        layout: [
            { i: 'sre_pending_incidents', x: 0, y: 0, w: 4, h: 2 },
            { i: 'sre_in_progress', x: 4, y: 0, w: 4, h: 2 },
            { i: 'sre_resolved_today', x: 8, y: 0, w: 4, h: 2 },
            { i: 'sre_automation_rate', x: 0, y: 2, w: 12, h: 2 },
        ],
        resource_ids: ['res-001', 'res-002', 'res-003'],
    },
];
const MOCK_AVAILABLE_GRAFANA_DASHBOARDS = [
    { uid: 'grafana-uid-1', title: 'Service Health', url: `${DEFAULT_GRAFANA_BASE_URL}/d/grafana-uid-1`, folder_title: 'Production', folder_uid: 'prod-folder' },
    { uid: 'grafana-uid-2', title: 'Kubernetes Cluster', url: `${DEFAULT_GRAFANA_BASE_URL}/d/grafana-uid-2`, folder_title: 'Infrastructure', folder_uid: 'infra-folder' },
];
const MOCK_DASHBOARD_TEMPLATES: DashboardTemplate[] = [
    { id: 'tpl-001', name: '微服務健康度', description: '監控單一微服務，包括延遲、流量、錯誤率與資源飽和度。適用於 API 服務、後端服務監控。', icon: 'server', category: '應用程式' },
    { id: 'tpl-002', name: '業務 KPI 總覽', description: '追蹤關鍵業務指標，如用戶註冊數、營收、轉換率等。適用於產品經理、業務團隊使用。', icon: 'briefcase', category: '業務' },
];
const MOCK_INCIDENTS: Incident[] = [
    { id: 'INC-001', summary: 'API 延遲超過閾值', resource: 'api-server-01', resource_id: 'res-001', impact: 'high', priority: 'p1', category: 'application', rule: 'API 延遲規則', rule_id: 'rule-002', status: 'new', severity: 'warning', assignee: '張三', team_id: 'team-001', owner_id: 'usr-001', tags: { team: 'SRE Platform', owner: 'Alice Chen', env: 'production', service: 'api-gateway' }, occurred_at: '2024-01-15T10:30:00Z', created_at: '2024-01-15T10:30:00Z', updated_at: '2024-01-15T10:30:00Z', acknowledged_at: undefined, resolved_at: undefined, silenced_by: undefined, notifications_sent: undefined, history: [{ timestamp: '2024-01-15T10:30:00Z', user: 'System', action: 'Created', details: 'Incident created from rule "API 延遲規則".' }] },
    { id: 'INC-002', summary: '資料庫連接超時', resource: 'db-default', resource_id: 'res-002', impact: 'high', priority: 'p0', category: 'infrastructure', rule: '資料庫連接規則', rule_id: 'rule-db-conn', status: 'acknowledged', severity: 'critical', assignee: '李四', team_id: 'team-002', owner_id: 'usr-002', tags: { team: 'Core Infrastructure', owner: 'Bob Lee', env: 'production', service: 'database' }, occurred_at: '2024-01-15T10:15:00Z', created_at: '2024-01-15T10:15:00Z', updated_at: '2024-01-15T10:15:00Z', acknowledged_at: '2024-01-15T10:20:00Z', resolved_at: undefined, silenced_by: undefined, notifications_sent: undefined, history: [{ timestamp: '2024-01-15T10:15:00Z', user: 'System', action: 'Created', details: 'Incident created from rule "資料庫連接規則".' }] },
    { id: 'INC-003', summary: 'CPU 使用率異常', resource: 'web-prod-12', resource_id: 'res-004', impact: 'medium', priority: 'p2', category: 'application', rule: 'CPU 使用率規則', rule_id: 'rule-cpu', status: 'resolved', severity: 'warning', assignee: '王五', team_id: 'team-003', owner_id: 'usr-003', tags: { team: 'API Services', owner: 'Charlie Wu', env: 'production' }, occurred_at: '2024-01-15T09:45:00Z', created_at: '2024-01-15T09:45:00Z', updated_at: '2024-01-15T09:45:00Z', acknowledged_at: '2024-01-15T10:00:00Z', resolved_at: '2024-01-15T10:05:00Z', silenced_by: undefined, notifications_sent: undefined, history: [{ timestamp: '2024-01-15T09:45:00Z', user: 'System', action: 'Created', details: 'Incident created from rule "CPU 使用率規則".' }] },
    { id: 'INC-004', summary: 'Edge gateway maintenance window', resource: 'edge-gw-1', resource_id: 'res-007', impact: 'low', priority: 'p3', category: 'other', rule: '維運公告', rule_id: 'rule-maint', status: 'silenced', severity: 'info', assignee: undefined, team_id: 'team-001', owner_id: 'usr-001', tags: { team: 'SRE Platform', env: 'staging' }, occurred_at: '2024-01-14T22:00:00Z', created_at: '2024-01-14T21:45:00Z', updated_at: '2024-01-14T21:45:00Z', acknowledged_at: undefined, resolved_at: undefined, silenced_by: 'usr-001', notifications_sent: undefined, history: [{ timestamp: '2024-01-14T21:45:00Z', user: 'System', action: 'Created', details: 'Maintenance notice created for edge gateway.' }, { timestamp: '2024-01-14T21:50:00Z', user: 'Admin User', action: 'Silenced', details: 'Maintenance window approved and incident silenced.' }] },
];
const MOCK_QUICK_SILENCE_DURATIONS = [1, 2, 4, 8, 12, 24]; // hours
const MOCK_ALERT_RULE_DEFAULT: Partial<AlertRule> = {
    name: '',
    description: '',
    target: '',
    enabled: true,
    severity: 'warning',
    automation_enabled: false,
    labels: [],
    condition_groups: [
        {
            logic: 'or',
            severity: 'warning',
            conditions: [
                {
                    metric: 'cpu_usage_percent',
                    operator: '>',
                    threshold: 80,
                    duration_minutes: 5,
                },
            ],
        },
    ],
    title_template: '[{{severity}}] {{resource.name}} is in trouble',
    content_template: 'The metric {{metric}} reached {{value}} which is above the threshold of {{threshold}}.',
    automation: {
        enabled: false,
        parameters: {},
    },
};

const MOCK_ALERT_RULES: AlertRule[] = [
    {
        id: 'rule-001',
        name: 'CPU 使用率過高',
        description: '當任何伺服器的 CPU 使用率連續 5 分鐘超過 90% 時觸發。',
        enabled: true,
        target: '所有伺服器',
        conditions_summary: 'CPU > 90% for 5m',
        severity: 'critical',
        automation_enabled: true,
        creator: 'Admin User',
        created_at: '2025-09-20T10:00:00Z',
        updated_at: '2025-09-22T10:00:00Z',
        automation: { enabled: true, script_id: 'play-002', parameters: { namespace: 'production' } },
        test_payload: {
            metric: 'cpu_usage_percent',
            value: 94,
            resource: 'web-prod-12',
        },
        target_resource_ids: ['res-001', 'res-003', 'res-004'],  // 新增：關聯的資源 ID
        target_scope: 'specific'  // 新增：目標範圍
    },
    {
        id: 'rule-002',
        name: 'API 延遲規則',
        description: 'API Gateway 的 p95 延遲超過 500ms。',
        enabled: true,
        target: 'api-gateway-prod',
        conditions_summary: 'Latency > 500ms',
        severity: 'warning',
        automation_enabled: false,
        creator: 'Emily White',
        created_at: '2025-09-21T15:30:00Z',
        updated_at: '2025-09-21T15:30:00Z',
        automation: { enabled: false },
        test_payload: {
            metric: 'http_request_duration_seconds_p95',
            value: 620,
            resource: 'api-gateway-prod',
        },
        target_resource_ids: ['res-001'],  // 新增：關聯的資源 ID
        target_scope: 'specific'  // 新增：目標範圍
    },
];
const MOCK_ALERT_RULE_TEMPLATES: AlertRuleTemplate[] = [
    {
        id: 'art-001',
        name: 'High CPU Usage',
        description: 'Monitors CPU usage and alerts when it exceeds a threshold for a specified duration.',
        resource_type: 'host',
        data: {
            name: 'High CPU Usage on Prod Hosts',
            description: 'Monitors CPU usage on production hosts and alerts when it exceeds 90% for 5 minutes.',
            condition_groups: [{ logic: 'or', severity: 'warning', conditions: [{ metric: 'cpu_usage_percent', operator: '>', threshold: 90, duration_minutes: 5 }] }],
            title_template: '[{{severity}}] High CPU on {{resource.name}}',
            content_template: 'CPU usage is at {{value}}%, exceeding the threshold of {{threshold}}% for {{duration}} minutes.',
            automation: { enabled: true, script_id: 'play-002' }
        },
        preview: {
            conditions: ['cpu_usage_percent > 90% for 5m'],
            notification: '[warning] High CPU on {{resource.name}}',
            automation: 'Run Playbook: 擴展 Web 層'
        }
    },
    {
        id: 'art-002',
        name: 'Low Disk Space',
        description: 'Alerts when available disk space is critically low.',
        resource_type: 'host',
        data: {
            name: 'Low Disk Space',
            description: 'Alerts when disk space is critically low.',
            condition_groups: [{ logic: 'or', severity: 'critical', conditions: [{ metric: 'disk_free_percent', operator: '<', threshold: 10, duration_minutes: 15 }] }],
            title_template: '[{{severity}}] Low Disk Space on {{resource.name}}',
            content_template: 'Disk space is at {{value}}%, which is below the threshold of {{threshold}}%.'
        },
        preview: {
            conditions: ['disk_free_percent < 10% for 15m'],
            notification: '[critical] Low Disk Space on {{resource.name}}',
        }
    },
    {
        id: 'art-003',
        name: 'DB Connection Error',
        description: 'Alerts when database connection attempts are failing.',
        resource_type: 'database',
        data: {
            name: 'Database Connection Failures',
            description: 'Triggers when the rate of DB connection failures exceeds 5%.',
            condition_groups: [{ logic: 'or', severity: 'critical', conditions: [{ metric: 'db_connection_error_rate', operator: '>', threshold: 5, duration_minutes: 2 }] }],
            title_template: '[{{severity}}] DB Connection Errors on {{resource.name}}',
            content_template: 'Database connection error rate is at {{value}}%, exceeding the threshold of {{threshold}}%.'
        },
        preview: {
            conditions: ['db_connection_error_rate > 5% for 2m'],
            notification: '[critical] DB Connection Errors on {{resource.name}}'
        }
    }
];
const MOCK_SILENCE_RULES: SilenceRule[] = [
    { id: 'sil-001', name: '週末維護窗口', description: '週末例行維護期間静音所有 staging 環境的告警。', enabled: true, type: 'repeat', matchers: [{ key: 'env', operator: '=', value: 'staging' }], schedule: { type: 'recurring', cron: '0 22 * * 5', cron_description: '每週五 22:00', timezone: 'Asia/Taipei' }, creator: 'Admin User', created_at: '2025-09-20T18:00:00Z', updated_at: '2025-09-20T18:00:00Z' },
];
const MOCK_SILENCE_RULE_TEMPLATES: SilenceRuleTemplate[] = [
    { id: 'srt-001', name: 'Staging Maintenance', data: { name: 'Staging Maintenance', description: 'Silence all alerts from the staging environment.', matchers: [{ key: 'env', operator: '=', value: 'staging' }] } },
    { id: 'srt-002', name: 'Weekend Silence', data: { name: 'Weekend Silence', description: 'Silence non-critical alerts over the weekend.', matchers: [{ key: 'severity', operator: '!=', value: 'critical' }], schedule: { type: 'recurring', cron: '0 0 * * 6' } } },
];
const MOCK_SILENCE_RULE_OPTIONS: SilenceRuleOptions = {
    keys: ['severity', 'env', 'service', 'resource_type'],
    values: {
        severity: ['critical', 'warning', 'info'],
        env: ['production', 'staging', 'development'],
    },
    default_matcher: { key: 'env' as const, operator: '=' as const, value: 'staging' },
    weekdays: [
        { value: 0, label: '日' }, { value: 1, label: '一' }, { value: 2, label: '二' },
        { value: 3, label: '三' }, { value: 4, label: '四' }, { value: 5, label: '五' },
        { value: 6, label: '六' }
    ],
    types: [
        { value: 'single', label: '單一事件', class_name: 'bg-blue-950/40 border border-blue-500/40 text-blue-300 backdrop-blur-sm shadow-sm' },
        { value: 'repeat', label: '重複', class_name: 'bg-purple-950/40 border border-purple-500/40 text-purple-300 backdrop-blur-sm shadow-sm' },
        { value: 'condition', label: '條件式', class_name: 'bg-green-950/40 border border-green-500/40 text-green-300 backdrop-blur-sm shadow-sm' }
    ],
    statuses: [
        { value: true, label: '啟用', class_name: 'bg-green-950/40 border border-green-500/40 text-green-300 backdrop-blur-sm shadow-sm' },
        { value: false, label: '停用', class_name: 'bg-slate-950/40 border border-slate-500/40 text-slate-300 backdrop-blur-sm shadow-sm' }
    ],
    recurrence_types: [
        { value: 'daily', label: '每日' },
        { value: 'weekly', label: '每週' },
        { value: 'monthly', label: '每月' },
        { value: 'custom', label: '自訂 Cron' }
    ],
};
const MOCK_RESOURCES: Resource[] = [
    {
        id: 'res-001',
        name: 'api-gateway-prod-01',
        status: 'healthy',
        type: 'API Gateway',
        provider: 'AWS',
        region: 'us-east-1',
        owner: 'SRE Team',
        event_count: 0,
        metrics: { cpu: 42.3, memory: 55.1 },
        last_check_in_at: new Date(Date.now() - 30 * 1000).toISOString(),
        created_at: '2024-01-10T10:00:00Z',
        updated_at: '2024-01-15T11:00:00Z'
    },
    {
        id: 'res-002',
        name: 'rds-prod-main',
        status: 'critical',
        type: 'RDS Database',
        provider: 'AWS',
        region: 'us-east-1',
        owner: 'DBA Team',
        event_count: 4,
        metrics: { cpu: 88.6, memory: 76.4 },
        last_check_in_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        created_at: '2024-01-10T10:00:00Z',
        updated_at: '2024-01-15T11:00:00Z'
    },
    {
        id: 'res-003',
        name: 'k8s-prod-cluster',
        status: 'healthy',
        type: 'EKS Cluster',
        provider: 'AWS',
        region: 'us-west-2',
        owner: 'SRE Team',
        event_count: 1,
        metrics: { cpu: 57.2, memory: 61.3 },
        last_check_in_at: new Date(Date.now() - 60 * 1000).toISOString(),
        created_at: '2024-01-10T10:00:00Z',
        updated_at: '2024-01-15T11:00:00Z'
    },
    {
        id: 'res-004',
        name: 'web-prod-12',
        status: 'healthy',
        type: 'EC2 Instance',
        provider: 'AWS',
        region: 'us-west-2',
        owner: 'Web Team',
        event_count: 0,
        metrics: { cpu: 34.5, memory: 49.2 },
        last_check_in_at: new Date(Date.now() - 45 * 1000).toISOString(),
        created_at: '2024-01-10T10:00:00Z',
        updated_at: '2024-01-15T11:00:00Z'
    },
    {
        id: 'res-007',
        name: 'api-service',
        status: 'warning',
        type: 'Kubernetes',
        provider: 'AWS',
        region: 'us-east-1',
        owner: 'API Services',
        event_count: 2,
        metrics: { cpu: 82.1, memory: 69.5 },
        last_check_in_at: new Date(Date.now() - 60 * 1000).toISOString(),
        created_at: '2024-01-10T10:00:00Z',
        updated_at: '2024-01-15T11:00:00Z'
    },
];
const MOCK_RESOURCE_GROUPS: ResourceGroup[] = [
    { id: 'rg-001', name: '正式環境 Web 伺服器', description: '所有面向正式環境的 Web 伺服器', owner_team: 'Web Team', member_ids: ['res-004'], status_summary: { healthy: 12, warning: 1, critical: 0 }, created_at: '2024-01-12T10:00:00Z', updated_at: '2024-01-12T10:00:00Z' },
    { id: 'rg-002', name: '核心資料庫', description: '核心服務的主資料庫與副本資料庫', owner_team: 'DBA Team', member_ids: ['res-002'], status_summary: { healthy: 8, warning: 0, critical: 1 }, created_at: '2024-01-12T10:00:00Z', updated_at: '2024-01-12T10:00:00Z' },
    { id: 'rg-003', name: 'API 服務', description: '主要 API 的所有微服務', owner_team: 'API Team', member_ids: ['res-007'], status_summary: { healthy: 25, warning: 3, critical: 2 }, created_at: '2024-01-12T10:00:00Z', updated_at: '2024-01-12T10:00:00Z' },
];
const MOCK_RESOURCE_OVERVIEW_DATA: ResourceOverviewData = {
    distribution_by_type: [
        { value: 150, name: 'EC2 Instance' },
        { value: 80, name: 'Kubernetes Pod' },
        { value: 50, name: 'RDS Database' },
        { value: 40, name: 'API Gateway' },
        { value: 25, name: 'Other' },
    ],
    distribution_by_provider: [
        { provider: 'AWS', count: 250 },
        { provider: 'GCP', count: 80 },
        { provider: 'Azure', count: 15 },
    ],
    recently_discovered: [
        { id: 'disc-001', name: '10.1.5.23', type: 'VM', discovered_at: '5m ago', job_id: 'dj-003' },
        { id: 'disc-002', name: 'redis-cache-xyz', type: 'Kubernetes Pod', discovered_at: '1h ago', job_id: 'dj-001' },
    ],
    groups_with_most_alerts: [
        { id: 'rg-003', name: 'API Services', criticals: 2, warnings: 3 },
        { id: 'rg-002', name: 'Core Databases', criticals: 1, warnings: 0 },
        { id: 'rg-001', name: 'Production Web Servers', criticals: 0, warnings: 1 },
    ]
};
const MOCK_PLAYBOOKS: AutomationPlaybook[] = [
    { id: 'play-001', name: '重啟故障 Pod', description: '自動重啟處於 CrashLoopBackOff 狀態的 Pod。', trigger: 'K8s 告警', last_run_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), last_run_status: 'success', run_count: 12, type: 'shell', content: '#!/bin/bash...', parameters: [{ name: 'namespace', label: '命名空間', type: 'string', required: true }], created_at: '2025-09-20T10:00:00Z', updated_at: '2025-09-23T12:00:00Z' },
    { id: 'play-002', name: '擴展 Web 層', description: '向 Web 伺服器自動擴展組增加更多 EC2 實例。', trigger: '高 CPU', last_run_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(), last_run_status: 'success', run_count: 3, type: 'python', content: 'import boto3...', parameters: [{ name: 'instance_count', label: '實例數量', type: 'number', required: true, default_value: 2 }], created_at: '2025-09-21T11:00:00Z', updated_at: '2025-09-22T13:00:00Z' },
];
const MOCK_AUTOMATION_EXECUTIONS: AutomationExecution[] = [
    {
        id: 'exec-001',
        playbook_id: 'play-001',
        playbook_name: '重啟故障 Pod',
        status: 'success',
        trigger_source: 'event',
        triggered_by: 'Alert Rule: K8s 告警',
        start_time: '2025-09-23T14:05:10Z',
        end_time: '2025-09-23T14:05:15Z',
        duration_ms: 5000,
        parameters: { namespace: 'production' },
        logs: { stdout: 'Successfully restarted pod.', stderr: '' },
        incident_id: 'INC-002',           // 新增：關聯事件 ID
        alert_rule_id: 'rule-002',          // 新增：關聯規則 ID
        target_resource_id: 'res-002'      // 新增：關聯資源 ID
    },
    {
        id: 'exec-002',
        playbook_id: 'play-002',
        playbook_name: '擴展 Web 層',
        status: 'cancelled',
        trigger_source: 'manual',
        triggered_by: 'User: Admin User',
        start_time: '2025-09-23T12:00:00Z',
        end_time: '2025-09-23T12:00:10Z',
        duration_ms: 10000,
        parameters: { instance_count: 2 },
        logs: { stdout: 'Execution cancelled before completion.', stderr: '' },
        incident_id: undefined,
        alert_rule_id: undefined,
        target_resource_id: 'res-003'
    },
    {
        id: 'exec-003',
        playbook_id: 'play-002',
        playbook_name: '擴展 Web 層',
        status: 'running',
        trigger_source: 'schedule',
        triggered_by: 'Automation Trigger: 每日日誌歸檔',
        start_time: '2025-09-24T08:00:00Z',
        parameters: { instance_count: 4 },
        logs: { stdout: 'Scaling workflow in progress...', stderr: '' },
        incident_id: undefined,
        alert_rule_id: undefined,
        target_resource_id: 'res-004'
    },
    {
        id: 'exec-004',
        playbook_id: 'play-001',
        playbook_name: '重啟故障 Pod',
        status: 'pending',
        trigger_source: 'webhook',
        triggered_by: 'Webhook: GitOps pipeline',
        start_time: '2025-09-24T07:45:00Z',
        parameters: { namespace: 'staging' },
        logs: { stdout: 'Webhook received. Waiting for executor.', stderr: '' },
        incident_id: 'INC-005',
        alert_rule_id: undefined,
        target_resource_id: 'res-007'
    },
    {
        id: 'exec-005',
        playbook_id: 'play-002',
        playbook_name: '擴展 Web 層',
        status: 'failed',
        trigger_source: 'custom',
        triggered_by: 'Custom Dashboard Action',
        start_time: '2025-09-23T05:15:00Z',
        end_time: '2025-09-23T05:15:12Z',
        duration_ms: 12000,
        parameters: { instance_count: 3 },
        logs: { stdout: 'Custom action started...', stderr: 'Grafana datasource unreachable.' },
        incident_id: undefined,
        alert_rule_id: 'rule-004',
        target_resource_id: 'res-003'
    },
    {
        id: 'exec-006',
        playbook_id: 'play-001',
        playbook_name: '重啟故障 Pod',
        status: 'success',
        trigger_source: 'grafana',
        triggered_by: 'Grafana Runbook Panel',
        start_time: '2025-09-22T22:10:00Z',
        end_time: '2025-09-22T22:10:05Z',
        duration_ms: 5000,
        parameters: { namespace: 'production', pod_name: 'api-server-01' },
        logs: { stdout: 'Restart issued from Grafana integration.', stderr: '' },
        incident_id: 'INC-001',
        alert_rule_id: 'rule-001',
        target_resource_id: 'res-002'
    },
];
const MOCK_AUTOMATION_TRIGGERS: AutomationTrigger[] = [
    { id: 'trig-001', name: '每日日誌歸檔', description: '在每天凌晨 3 點運行「歸檔舊日誌」腳本。', type: 'schedule', enabled: true, target_playbook_id: 'play-005', retry_policy: 'none', config: { cron: '0 3 * * *', cron_description: '每日 03:00' }, last_triggered_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), creator: 'Admin User', created_at: '2025-09-19T08:00:00Z', updated_at: '2025-09-19T08:00:00Z' },
];
const MOCK_USERS: User[] = [
    { id: 'usr-001', name: 'Admin User', email: 'admin@sre.platform', role: 'admin', team: 'SRE Platform', status: 'active', last_login_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(), created_at: '2024-01-01T09:00:00Z', updated_at: '2024-01-15T10:00:00Z' },
    { id: 'usr-002', name: 'Emily White', email: 'emily.w@example.com', role: 'sre', team: 'Core Infrastructure', status: 'active', last_login_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(), created_at: '2024-01-02T09:00:00Z', updated_at: '2024-01-14T10:00:00Z' },
    { id: 'usr-003', name: 'John Doe', email: 'john.d@example.com', role: 'developer', team: 'API Services', status: 'active', last_login_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), created_at: '2024-01-03T09:00:00Z', updated_at: '2024-01-13T10:00:00Z' },
    { id: 'usr-004', name: 'Sarah Connor', email: 'sarah.c@example.com', role: 'viewer', team: 'Marketing', status: 'inactive', last_login_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), created_at: '2024-01-04T09:00:00Z', updated_at: '2024-01-12T10:00:00Z' },
    { id: 'usr-005', name: 'pending.invite@example.com', email: 'pending.invite@example.com', role: 'developer', team: 'API Services', status: 'invited', last_login_at: null, created_at: '2024-01-15T09:00:00Z', updated_at: '2024-01-15T09:00:00Z' },
];
const MOCK_USER_STATUSES: User['status'][] = ['active', 'invited', 'inactive'];
const MOCK_TEAMS: Team[] = [
    { id: 'team-001', name: 'SRE Platform', description: 'Manages the SRE platform itself.', owner_id: 'usr-001', member_ids: ['usr-001'], created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z' },
    { id: 'team-002', name: 'Core Infrastructure', description: 'Maintains core infrastructure services.', owner_id: 'usr-002', member_ids: ['usr-002'], created_at: '2024-01-02T11:00:00Z', updated_at: '2024-01-02T11:00:00Z' },
    { id: 'team-003', name: 'API Services', description: 'Develops and maintains all public APIs.', owner_id: 'usr-003', member_ids: ['usr-003', 'usr-005'], created_at: '2024-01-03T12:00:00Z', updated_at: '2024-01-03T12:00:00Z' },
];
const MOCK_ROLES: Role[] = [
    {
        id: 'role-001', name: 'Administrator', description: '擁有所有權限', user_count: 1, enabled: true, created_at: '2024-01-01T09:00:00Z', updated_at: '2024-01-01T09:00:00Z', permissions: [
            { module: 'Incidents', actions: ['read', 'create', 'update', 'delete'] },
            { module: 'Resources', actions: ['read', 'create', 'update', 'delete'] },
            { module: 'Automation', actions: ['read', 'create', 'update', 'delete', 'execute'] },
            { module: 'Settings', actions: ['read', 'update'] },
        ]
    },
    {
        id: 'role-002', name: 'SRE Engineer', description: '擁有事件、資源、自動化管理權限', user_count: 1, enabled: true, created_at: '2024-01-01T09:00:00Z', updated_at: '2024-01-01T09:00:00Z', permissions: [
            { module: 'Incidents', actions: ['read', 'update'] },
            { module: 'Resources', actions: ['read', 'update'] },
            { module: 'Automation', actions: ['read', 'execute'] },
        ]
    },
    {
        id: 'role-003', name: 'Developer', description: '擁有應用程式開發相關權限', user_count: 2, enabled: true, created_at: '2024-01-01T09:00:00Z', updated_at: '2024-01-01T09:00:00Z', permissions: [
            { module: 'Incidents', actions: ['read'] },
            { module: 'Resources', actions: ['read'] },
        ]
    },
];
const AVAILABLE_PERMISSIONS: { module: string; description: string; actions: { key: RolePermission['actions'][0], label: string }[] }[] = [
    { module: 'Incidents', description: '管理事件和警報', actions: [{ key: 'read', label: '讀取' }, { key: 'create', label: '建立' }, { key: 'update', label: '更新' }, { key: 'delete', label: '刪除' }] },
    { module: 'Resources', description: '管理基礎設施資源', actions: [{ key: 'read', label: '讀取' }, { key: 'create', label: '建立' }, { key: 'update', label: '更新' }, { key: 'delete', label: '刪除' }] },
    { module: 'Automation', description: '管理和執行自動化腳本', actions: [{ key: 'read', label: '讀取' }, { key: 'create', label: '建立' }, { key: 'update', label: '更新' }, { key: 'delete', label: '刪除' }, { key: 'execute', label: '執行' }] },
    { module: 'Settings', description: '管理平台設定', actions: [{ key: 'read', label: '讀取' }, { key: 'update', label: '更新' }] },
];
const MOCK_AUDIT_LOGS: AuditLog[] = [
    { id: 'log-001', timestamp: '2024-01-15T11:05:00Z', user: { id: 'usr-001', name: 'Admin User' }, action: 'login', target: { type: 'System', name: 'Authentication' }, result: 'success', ip: '192.168.1.10', details: { client: 'WebApp' } },
];
const MOCK_TAG_DEFINITIONS: TagDefinition[] = createTagDefinitions();

const MOCK_TAG_BULK_IMPORT_JOBS: TagBulkImportJob[] = [
    {
        id: 'tag-import-001',
        filename: 'tags-prod.csv',
        status: 'success',
        total_records: 24,
        imported_records: 22,
        failed_records: 2,
        error_log: ['第 12 行: scope 欄位為空', '第 18 行: writable_roles 無效值'],
        uploaded_by: 'usr-admin',
        created_at: '2025-09-10T02:10:00Z',
        completed_at: '2025-09-10T02:11:30Z'
    }
];
const MOCK_NOTIFICATIONS: NotificationItem[] = [
    { id: 'notif-1', title: 'Critical: DB CPU > 95%', description: 'The production database is under heavy load.', severity: 'critical', status: 'unread', created_at: new Date(Date.now() - 60000 * 5).toISOString(), link_url: '/incidents/INC-002' },
];
const MOCK_NOTIFICATION_STRATEGIES: NotificationStrategy[] = [
    {
        id: 'strat-1',
        name: 'Critical Database Alerts',
        enabled: true,
        trigger_condition: 'severity = critical AND service = api-gateway',
        channel_count: 2,
        severity_levels: ['critical'],
        impact_levels: ['high'],
        creator: 'Admin',
        created_at: '2025-09-20T10:00:00Z',
        updated_at: '2025-09-20T10:00:00Z'
    }
];
const MOCK_NOTIFICATION_STRATEGY_OPTIONS: NotificationStrategyOptions = {
    severity_levels: ['critical', 'warning', 'info'],
    impact_levels: ['high', 'medium', 'low'],
    default_condition: 'severity = critical',
    condition_keys: {
        severity: ['critical', 'warning', 'info'],
        impact: ['high', 'medium', 'low'],
        service: ['api-gateway', 'payment-service']
    },
    tag_keys: ['env', 'service'],
    tag_values: {
        env: ['production', 'staging', 'development'],
        service: ['api-gateway', 'payment-service']
    },
    step_titles: ["基本資訊", "通知管道", "匹配條件"],
};
const MOCK_NOTIFICATION_CHANNELS: NotificationChannel[] = [
    {
        id: 'chan-1',
        name: 'SRE On-call Email',
        type: 'email',
        enabled: true,
        config: {
            to: 'sre-oncall@example.com',
            cc: 'sre-manager@example.com,dev-lead@example.com',
            bcc: 'audit@example.com'
        },
        last_test_result: 'success',
        last_tested_at: '2025-09-22T11:00:00Z',
        created_at: '2025-09-21T09:00:00Z',
        updated_at: '2025-09-22T11:00:00Z'
    },
];
const MOCK_NOTIFICATION_OPTIONS: NotificationOptions = {
    severities: [
        { value: 'critical', label: '嚴重', class_name: 'bg-red-950/40 border border-red-500/40 text-red-300 backdrop-blur-sm shadow-sm' },
        { value: 'warning', label: '警告', class_name: 'bg-amber-950/40 border border-amber-500/40 text-amber-300 backdrop-blur-sm shadow-sm' },
        { value: 'info', label: '資訊', class_name: 'bg-sky-950/40 border border-sky-500/40 text-sky-300 backdrop-blur-sm shadow-sm' },
        { value: 'success', label: '成功', class_name: 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 backdrop-blur-sm shadow-sm' },
    ],
};
const MOCK_NOTIFICATION_CHANNEL_ICONS = {
    'Email': { icon: 'mail', color: 'text-red-400' },
    'Slack': { icon: 'slack', color: 'text-purple-400' },
    'Webhook (通用)': { icon: 'globe', color: 'text-sky-400' },
    'LINE Notify': { icon: 'message-circle', color: 'text-green-400' },
    'SMS': { icon: 'smartphone', color: 'text-blue-400' },
    'Default': { icon: 'bell', color: 'text-slate-400' }
};
const MOCK_NOTIFICATION_HISTORY: NotificationHistoryRecord[] = [
    { id: 'nh-1', timestamp: '2025-09-23T14:05:10Z', strategy: 'Critical Database Alerts', channel: 'SRE On-call Email', channel_type: 'email', recipient: 'sre-team@example.com', status: 'sent', content: 'DB CPU > 95%' },
];
const MOCK_LOGIN_HISTORY: LoginHistoryRecord[] = [
    { id: 'lh-1', timestamp: '2025-09-23T10:00:00Z', ip: '192.168.1.1', device: 'Chrome on macOS', status: 'success' },
];
const MOCK_LOGS: LogEntry[] = [
    { id: 'log-1', timestamp: new Date().toISOString(), level: 'error', service: 'payment-service', message: 'Failed to process payment', details: { transaction_id: 'txn-123' } },
    { id: 'log-2', timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), level: 'warning', service: 'api-gateway', message: 'High latency detected on /checkout endpoint', details: { latency_ms: 920 } },
    { id: 'log-3', timestamp: new Date(Date.now() - 70 * 60 * 1000).toISOString(), level: 'error', service: 'order-service', message: 'Circuit breaker opened due to downstream failures', details: { failure_count: 27 } },
    { id: 'log-4', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), level: 'info', service: 'deployment-service', message: 'Blue/green deployment completed successfully', details: { version: 'v2025.09.24.1' } },
    { id: 'log-5', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), level: 'warning', service: 'database', message: 'Connection pool saturation exceeded 85%', details: { pool: 'default-read' } },
    { id: 'log-6', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), level: 'error', service: 'billing-service', message: 'Recurring invoice generation timeout', details: { job_id: 'billing-7821' } },
];
const MOCK_LOG_TIME_OPTIONS: { label: string, value: string }[] = [
    { label: '最近 15 分鐘', value: '15m' },
    { label: '最近 1 小時', value: '1h' },
    { label: '最近 4 小時', value: '4h' },
    { label: '最近 1 天', value: '1d' },
    { label: '最近 7 天', value: '7d' },
    { label: '最近 30 天', value: '30d' },
];
const MOCK_MAIL_SETTINGS: MailSettings = { smtp_server: 'smtp.example.com', port: 587, username: 'noreply@sre.platform', sender_name: 'SRE Platform', sender_email: 'noreply@sre.platform', encryption: 'tls' };
const MOCK_GRAFANA_SETTINGS: GrafanaSettings = { enabled: true, url: DEFAULT_GRAFANA_BASE_URL, api_key: 'glsa_xxxxxxxxxxxxxxxxxxxxxxxx', org_id: 1 };
const MOCK_GRAFANA_OPTIONS: GrafanaOptions = {
    time_options: [
        { label: '最近 6 小時', value: 'from=now-6h&to=now' },
        { label: '最近 24 小時', value: 'from=now-24h&to=now' },
        { label: '最近 7 天', value: 'from=now-7d&to=now' },
    ],
    refresh_options: [
        { label: '關閉', value: '' },
        { label: '每 1 分鐘', value: '1m' },
        { label: '每 5 分鐘', value: '5m' },
        { label: '每 15 分鐘', value: '15m' },
    ],
    tv_mode_options: [
        { label: '關閉', value: 'off' },
        { label: '全螢幕 TV 模式', value: 'on' },
    ],
    theme_options: [
        { label: '深色', value: 'dark' },
        { label: '淺色', value: 'light' },
    ],
    theme_label: '主題',
    tv_mode_label: 'TV 模式',
    refresh_label: '重新整理頻率',
    time_label: '時間範圍',
};
const MOCK_AUTH_SETTINGS: AuthSettings = { provider: 'keycloak', enabled: true, client_id: 'sre-platform-client', client_secret: '...', realm: 'sre', auth_url: '...', token_url: '...', user_info_url: '...', idp_admin_url: DEFAULT_IDP_ADMIN_URL };
const LAYOUT_WIDGETS: LayoutWidget[] = [
    // Incident Management
    { id: 'incident_pending_count', name: '待處理事件', description: '顯示目前狀態為「新」的事件總數。', supported_pages: ['事件'] },
    { id: 'incident_in_progress', name: '處理中事件', description: '顯示目前狀態為「已認領」的事件總數。', supported_pages: ['事件'] },
    { id: 'incident_resolved_today', name: '今日已解決', description: '顯示今天已解決的事件總數。', supported_pages: ['事件'] },
    // SREWarRoom
    { id: 'sre_pending_incidents', name: '待處理事件', description: '', supported_pages: ['SREWarRoom'] },
    { id: 'sre_in_progress', name: '處理中', description: '顯示正在處理中的事件。', supported_pages: ['SREWarRoom'] },
    { id: 'sre_resolved_today', name: '今日已解決', description: '顯示今日已解決的事件。', supported_pages: ['SREWarRoom'] },
    { id: 'sre_automation_rate', name: '自動化率', description: '顯示自動化處理的事件比例。', supported_pages: ['SREWarRoom'] },
    // InfrastructureInsights
    { id: 'infra_total_resources', name: '總資源數', description: '顯示所有監控的資源總數。', supported_pages: ['InfrastructureInsights'] },
    { id: 'infra_running', name: '運行中', description: '顯示當前運行中的資源數量。', supported_pages: ['InfrastructureInsights'] },
    { id: 'infra_anomalies', name: '異常', description: '顯示存在異常狀態的資源數量。', supported_pages: ['InfrastructureInsights'] },
    { id: 'infra_offline', name: '離線', description: '顯示當前離線的資源數量。', supported_pages: ['InfrastructureInsights'] },

    // NEW WIDGETS START HERE
    // Resource Management
    { id: 'resource_total_count', name: '資源總數', description: '顯示所有已註冊的資源總數。', supported_pages: ['資源', 'ResourceOverview'] },
    { id: 'resource_health_rate', name: '資源健康率', description: '處於健康狀態的資源百分比。', supported_pages: ['資源', 'ResourceOverview'] },
    { id: 'resource_alerting', name: '告警中資源', description: '目前處於警告或嚴重狀態的資源數。', supported_pages: ['資源', 'ResourceOverview'] },
    { id: 'resource_group_count', name: '資源群組總數', description: '平台中所有資源群組的數量。', supported_pages: ['ResourceOverview'] },

    // Dashboard Management
    { id: 'dashboard_total_count', name: '儀表板總數', description: '平台中所有儀表板的數量。', supported_pages: ['儀表板'] },
    { id: 'dashboard_custom_count', name: '自訂儀表板', description: '使用者自訂的內建儀表板數量。', supported_pages: ['儀表板'] },
    { id: 'dashboard_grafana_count', name: 'Grafana 儀表板', description: '從 Grafana 連結的儀表板數量。', supported_pages: ['儀表板'] },

    // Analysis Center
    { id: 'analysis_critical_anomalies', name: '嚴重異常 (24H)', description: '過去 24 小時内偵測到的嚴重異常事件。', supported_pages: ['智慧排查'] },
    { id: 'analysis_log_volume', name: '日誌量 (24H)', description: '過去 24 小時的總日誌量。', supported_pages: ['智慧排查'] },
    { id: 'analysis_trace_errors', name: '追蹤錯誤率', description: '包含錯誤的追蹤佔比。', supported_pages: ['智慧排查'] },

    // Automation Center
    { id: 'automation_runs_today', name: '今日運行次數', description: '所有自動化腳本今日的總運行次數。', supported_pages: ['自動化'] },
    { id: 'automation_success_rate', name: '成功率', description: '自動化腳本的整體執行成功率。', supported_pages: ['自動化'] },
    { id: 'automation_suppressed_alerts', name: '已抑制告警', description: '因自動化成功執行而抑制的告警數。', supported_pages: ['自動化'] },

    // IAM
    { id: 'iam_total_users', name: '使用者總數', description: '平台中的總使用者帳號數。', supported_pages: ['身份與存取'] },
    { id: 'iam_active_users', name: '活躍使用者', description: '過去 7 天内有登入活動的使用者。', supported_pages: ['身份與存取'] },
    { id: 'iam_login_failures', name: '登入失敗 (24H)', description: '過去 24 小時內的登入失敗次數。', supported_pages: ['身份與存取'] },

    // Notification Management
    { id: 'notification_sent_today', name: '今日已發送', description: '今日透過所有管道發送的通知總數。', supported_pages: ['通知'] },
    { id: 'notification_failure_rate', name: '發送失敗率', description: '通知發送的整體失敗率。', supported_pages: ['通知'] },
    { id: 'notification_channels', name: '啟用中管道', description: '目前已啟用並可用的通知管道數。', supported_pages: ['通知'] },

    // Platform Settings
    { id: 'platform_tags_defined', name: '標籤總數', description: '平台中定義的標籤鍵總數。', supported_pages: ['平台'] },
    { id: 'platform_auth_provider', name: '認證提供商', description: '目前使用的身份驗證提供商。', supported_pages: ['平台'] },
    { id: 'platform_mail_status', name: '郵件服務狀態', description: '郵件發送服務的健康狀態。', supported_pages: ['平台'] },

    // Personal Settings
    { id: 'profile_login_count_7d', name: '最近 7 日登入次數', description: '過去 7 天內的成功登入次數。', supported_pages: ['個人設定'] },
    { id: 'profile_last_password_change', name: '上次密碼變更', description: '您的密碼上次更新的時間。', supported_pages: ['個人設定'] },
    { id: 'profile_mfa_status', name: 'MFA 狀態', description: '多因素驗證 (MFA) 的啟用狀態。', supported_pages: ['個人設定'] },
];
const DEFAULT_LAYOUTS: Record<string, { widget_ids: string[]; updated_at: string; updated_by: string; }> = {
    "SREWarRoom": { widget_ids: ['sre_pending_incidents', 'sre_in_progress', 'sre_resolved_today', 'sre_automation_rate'], updated_at: '2025-09-24T10:30:00Z', updated_by: 'Admin User' },
    "InfrastructureInsights": { widget_ids: ['infra_total_resources', 'infra_running', 'infra_anomalies', 'infra_offline'], updated_at: '2025-09-24T10:30:00Z', updated_by: 'Admin User' },
    "事件": { widget_ids: ['incident_pending_count', 'incident_in_progress', 'incident_resolved_today'], updated_at: '2025-09-24T10:30:00Z', updated_by: 'Admin User' },
    "資源": { widget_ids: ['resource_total_count', 'resource_health_rate', 'resource_alerting'], updated_at: '2025-09-24T10:30:00Z', updated_by: 'Admin User' },
    "ResourceOverview": { widget_ids: ['resource_total_count', 'resource_health_rate', 'resource_alerting', 'resource_group_count'], updated_at: '2025-09-24T10:30:00Z', updated_by: 'Admin User' },
    "儀表板": { widget_ids: ['dashboard_total_count', 'dashboard_custom_count', 'dashboard_grafana_count'], updated_at: '2025-09-24T10:30:00Z', updated_by: 'Admin User' },
    "智慧排查": { widget_ids: ['analysis_critical_anomalies', 'analysis_log_volume', 'analysis_trace_errors'], updated_at: '2025-09-24T10:30:00Z', updated_by: 'Admin User' },
    "自動化": { widget_ids: ['automation_runs_today', 'automation_success_rate', 'automation_suppressed_alerts'], updated_at: '2025-09-24T10:30:00Z', updated_by: 'Admin User' },
    "身份與存取": { widget_ids: ['iam_total_users', 'iam_active_users', 'iam_login_failures'], updated_at: '2025-09-24T10:30:00Z', updated_by: 'Admin User' },
    "通知": { widget_ids: ['notification_sent_today', 'notification_failure_rate', 'notification_channels'], updated_at: '2025-09-24T10:30:00Z', updated_by: 'Admin User' },
    "平台": { widget_ids: ['platform_tags_defined', 'platform_auth_provider', 'platform_mail_status'], updated_at: '2025-09-24T10:30:00Z', updated_by: 'Admin User' },
    "profile": { widget_ids: ['profile_login_count_7d', 'profile_last_password_change', 'profile_mfa_status'], updated_at: '2025-09-24T10:30:00Z', updated_by: 'Admin User' },
};
const KPI_DATA: Record<string, KpiDataEntry> = {
    'incident_pending_count': { value: '5', description: '2 嚴重', color: 'error', trend: 'up', change: '+2 件' },
    'incident_in_progress': { value: '3', description: '↓15% vs yesterday', color: 'warning', trend: 'down', change: '15%' },
    'incident_resolved_today': { value: '12', description: '↑8% vs yesterday', color: 'success', trend: 'up', change: '8%' },
    'sre_pending_incidents': { value: '5', description: '2 嚴重', color: 'error', trend: 'up', change: '+2 件' },
    'sre_in_progress': { value: '3', description: '↓15% vs yesterday', color: 'warning', trend: 'down', change: '15%' },
    'sre_resolved_today': { value: '12', description: '↑8% vs yesterday', color: 'success', trend: 'up', change: '8%' },
    'sre_automation_rate': { value: '35.2%', description: '4 事件自動解決', color: 'default', trend: 'up', change: '4 次' },
    'infra_total_resources': { value: '120', description: '跨雲供應商', color: 'default' },
    'infra_running': { value: '115', description: '95.8% 健康', color: 'success' },
    'infra_anomalies': { value: '5', description: '4.2% 需要關注', color: 'warning', trend: 'up', change: '4.2%' },
    'infra_offline': { value: '0', description: '0% 離線', color: 'default' },

    'resource_total_count': { value: '345', description: '↑2% vs last week', color: 'default', trend: 'up', change: '2%' },
    'resource_health_rate': { value: '98.5%', description: '340 健康', color: 'success' },
    'resource_alerting': { value: '5', description: '3 critical, 2 warning', color: 'warning', trend: 'up', change: '5 項' },
    'resource_group_count': { value: '15', description: '↑2 vs last month', color: 'default', trend: 'up', change: '2' },

    'dashboard_total_count': { value: '28', description: '↑3 vs last month', color: 'default', trend: 'up', change: '3' },
    'dashboard_custom_count': { value: '12', description: '使用者自訂的內建儀表板數量。', color: 'default' },
    'dashboard_grafana_count': { value: '16', description: '從 Grafana 連結的儀表板數量。', color: 'success' },

    'analysis_critical_anomalies': { value: '3', description: '↑1 vs yesterday', color: 'error', trend: 'up', change: '+1' },
    'analysis_log_volume': { value: '25.1 GB', description: '↓5% vs yesterday', color: 'warning', trend: 'down', change: '5%' },
    'analysis_trace_errors': { value: '1.2%', description: '↑0.3% vs last hour', color: 'error', trend: 'up', change: '0.3%' },

    'automation_runs_today': { value: '1,283', description: '↑10% vs yesterday', color: 'default', trend: 'up', change: '10%' },
    'automation_success_rate': { value: '99.8%', description: '2 failures', color: 'success', trend: 'down', change: '2 次' },
    'automation_suppressed_alerts': { value: '45', description: 'Saved 2 hours of toil', color: 'default' },

    'iam_total_users': { value: '124', description: '↑5 new users this month', color: 'default', trend: 'up', change: '5 人' },
    'iam_active_users': { value: '98', description: '79% active rate', color: 'success' },
    'iam_login_failures': { value: '8', description: 'From 3 unique IPs', color: 'error', trend: 'up', change: '3 個 IP' },

    'notification_sent_today': { value: '342', description: '25 critical alerts', color: 'default', trend: 'up', change: '25 次' },
    'notification_failure_rate': { value: '0.5%', description: '2 failed sends', color: 'warning', trend: 'down', change: '2 次失敗' },
    'notification_channels': { value: '8', description: 'Email, Slack, Webhook', color: 'default' },

    'platform_tags_defined': { value: '42', description: '12 required tags', color: 'default' },
    'platform_auth_provider': { value: 'Keycloak', description: 'OIDC Enabled', color: 'default' },
    'platform_mail_status': { value: 'Healthy', description: 'SMTP service is operational', color: 'success' },

    'profile_login_count_7d': { value: '8', description: '來自 2 個不同 IP', color: 'default' },
    'profile_last_password_change': { value: '3 天前', description: '建議每 90 天更新一次', color: 'warning' },
    'profile_mfa_status': { value: '已啟用', description: '您的帳戶受到保護', color: 'success' },
};
const MOCK_AI_BRIEFING = {
    "stability_summary": "系統整體穩定，但支付 API 錯誤率略高於正常水平，需持續關注。",
    "key_anomaly": { "description": "支付 API 的錯誤率達到 5%，可能影響交易成功率。", "resource_name": "支付 API", "resource_path": "/dashboard/api-service-status" },
    "recommendation": { "action_text": "由於錯誤率上升，建議立即檢視支付 API 的日誌以找出根本原因。", "button_text": "查看日誌", "button_link": "/analyzing/logs" }
};
const MOCK_LINKS = [{ source: 'res-001', target: 'res-003' }];

// 新增 ResourceLink 和 ConfigVersion 的 mock 數據
const MOCK_RESOURCE_LINKS: ResourceLink[] = [
    {
        id: 'rl-001',
        source_resource_id: 'res-001',  // api-gateway-prod-01
        target_resource_id: 'res-003',  // k8s-prod-cluster
        link_type: 'connects_to',
        metadata: { protocol: 'HTTP', port: 8080 },
        created_at: '2025-09-20T10:00:00Z',
        updated_at: '2025-09-20T10:00:00Z'
    },
    {
        id: 'rl-002',
        source_resource_id: 'res-003',  // k8s-prod-cluster
        target_resource_id: 'res-002',  // rds-prod-main
        link_type: 'depends_on',
        metadata: { connection_type: 'JDBC', timeout: 30 },
        created_at: '2025-09-21T11:00:00Z',
        updated_at: '2025-09-21T11:00:00Z'
    },
    {
        id: 'rl-003',
        source_resource_id: 'res-007',  // api-service
        target_resource_id: 'res-003',  // k8s-prod-cluster
        link_type: 'manages',
        metadata: { namespace: 'production', deployment: 'api-service-deployment' },
        created_at: '2025-09-22T12:00:00Z',
        updated_at: '2025-09-22T12:00:00Z'
    }
];

const MOCK_CONFIG_VERSIONS: ConfigVersion[] = [
    {
        id: 'cv-001',
        entity_type: 'alertrule',
        entity_id: 'rule-001',
        version: 1,
        config_snapshot: MOCK_ALERT_RULES[0],
        change_summary: 'Initial creation of CPU usage alert rule',
        changed_by: 'usr-001',
        created_at: '2025-09-20T10:00:00Z'
    },
    {
        id: 'cv-002',
        entity_type: 'alertrule',
        entity_id: 'rule-001',
        version: 2,
        config_snapshot: { ...MOCK_ALERT_RULES[0], threshold: 95 },
        change_summary: 'Increased threshold to 95%',
        changed_by: 'usr-002',
        created_at: '2025-09-22T14:00:00Z'
    },
    {
        id: 'cv-003',
        entity_type: 'automationplaybook',
        entity_id: 'play-001',
        version: 1,
        config_snapshot: MOCK_PLAYBOOKS[0],
        change_summary: 'Initial creation of pod restart playbook',
        changed_by: 'usr-001',
        created_at: '2025-09-20T10:00:00Z'
    }
];
const MOCK_USER_PREFERENCES: UserPreferences = {
    theme: 'dark',
    language: 'zh-TW',
    timezone: 'Asia/Taipei',
    default_page: 'sre-war-room',
    last_exported_at: '2025-09-12T12:00:05Z',
    last_export_format: 'json'
};

const MOCK_USER_PREFERENCE_EXPORT_JOBS: UserPreferenceExportJob[] = [
    {
        id: 'pref-export-001',
        user_id: 'usr-admin',
        format: 'json',
        status: 'success',
        download_url: `${DEFAULT_API_BASE_URL}/downloads/preferences/pref-export-001.json`,
        expires_at: '2025-09-13T00:00:00Z',
        created_at: '2025-09-12T12:00:00Z',
        completed_at: '2025-09-12T12:00:05Z'
    }
];

// New AI Mock Data
const MOCK_AI_RISK_PREDICTION = {
    summary: "預計 API 閘道因延遲尖峰與部署失敗，可能在接下來的 24 小時內發生服務降級。資料庫資源因高記憶體使用率也存在風險。",
    risk_breakdown: { low: 60, medium: 30, high: 10 },
    top_risky_resources: [
        { name: "api-gateway-prod-01", risk: "服務降級或中斷" },
        { name: "user-service", risk: "因部署失敗導致功能異常" },
        { name: "rds-prod-main", risk: "資料庫效能緩慢或無回應" }
    ]
};

const MOCK_SINGLE_INCIDENT_ANALYSIS: IncidentAnalysis = {
    summary: '此事件由 API 延遲規則觸發，根本原因可能與最近的 `api-server-01` 部署有關。',
    root_causes: ['`api-server-01` 最近的程式碼變更引入了效能迴歸。', '下游 `user-service` 回應緩慢。'],
    recommendations: [{ description: '建議回滾 `api-server-01` 的部署。', action_text: '執行回滾腳本', playbook_id: 'play-003' }]
};

const MOCK_MULTI_INCIDENT_ANALYSIS: MultiIncidentAnalysis = {
    summary: '多個事件均指向 `db-default` 資料庫效能問題。',
    common_patterns: ['所有事件都在高流量時段發生。', '皆涉及資料庫讀取密集型操作。'],
    group_actions: [{ description: '建議對 `db-default` 進行緊急擴容。', action_text: '執行資料庫擴容', playbook_id: 'play-004' }]
};

const MOCK_ALERT_RULE_ANALYSIS: RuleAnalysisReport = {
    report_type: 'alert',
    summary: '所選告警規則涵蓋關鍵 API 與基礎設施資源，其中 1 項規則被標記為高風險，建議調整閾值並加入額外指標交叉驗證。',
    evaluated_rules: [
        { id: 'rule-001', name: 'CPU 使用率過高', status: '已啟用', severity: 'high' },
        { id: 'rule-002', name: 'API 延遲規則', status: '已啟用', severity: 'medium' },
    ],
    metrics: [
        { label: '高風險規則', value: '1', description: '閾值過於敏感，導致誤報可能性增加。' },
        { label: '平均誤報率', value: '7%', description: '最近 30 天內共產生 9 次誤報事件。' },
        { label: '自動化覆蓋率', value: '50%', description: '僅半數規則啟用自動化處理流程。' },
    ],
    insights: [
        {
            title: 'CPU 規則誤報偏高',
            detail: '近 7 天內有 5 次因短暫尖峰而觸發的告警，建議改用 p95 指標或延長觀察窗口。',
            severity: 'medium',
        },
        {
            title: '缺少關聯指標',
            detail: 'API 延遲規則僅監控延遲，未同時檢查錯誤率，可能無法篩出真正故障。',
            severity: 'low',
        },
    ],
    recommendations: [
        {
            action: '調整 CPU 閾值與條件',
            description: '將觸發條件改為 p95 > 90% 且持續 10 分鐘，並加入 CPU steal time 指標佐證。',
            priority: 'high',
        },
        {
            action: '補強 API 告警條件',
            description: '為 API 延遲規則增加 5xx 錯誤率條件，並設定階梯式告警通知以減少噪音。',
            priority: 'medium',
        },
        {
            action: '擴充自動化腳本',
            description: '為尚未啟用自動化的規則建立 runbook，提升修復效率。',
            priority: 'medium',
        },
    ],
};

const MOCK_SILENCE_RULE_ANALYSIS: RuleAnalysisReport = {
    report_type: 'silence',
    summary: '靜音規則涵蓋週末維護窗口，但缺少針對緊急維護與例外條件的防護，建議補強覆蓋範圍並加入自動過期檢查。',
    evaluated_rules: [
        { id: 'sil-001', name: '週末維護窗口', status: '已啟用', type: 'recurring' },
    ],
    metrics: [
        { label: '覆蓋時間', value: '48 小時', description: '每週五 22:00 至週日 22:00 對 staging 環境靜音。' },
        { label: '受影響服務', value: '12', description: '含 API、批次與資料處理等服務。' },
        { label: '例外事件', value: '2', description: '過去一季有 2 次靜音期間發生未預期的重大告警。' },
    ],
    insights: [
        {
            title: '缺少緊急維護例外',
            detail: '靜音規則無法針對突發維護或重大事件做即時調整，可能延遲關鍵告警曝光。',
            severity: 'high',
        },
        {
            title: '條件過於寬鬆',
            detail: '目前僅依照 env=staging 篩選，建議加入服務標籤避免影響生產影像。',
            severity: 'medium',
        },
    ],
    recommendations: [
        {
            action: '新增臨時靜音審核流程',
            description: '建立額外 API 以建立緊急靜音並強制設定過期時間，避免長期沉默。',
            priority: 'high',
        },
        {
            action: '細化靜音條件',
            description: '增加 service 或 team 標籤條件，只針對維護中的服務靜音。',
            priority: 'medium',
        },
        {
            action: '加入自動化巡檢',
            description: '排程檢查靜音規則是否符合最新維護計畫，過期自動通知負責人。',
            priority: 'low',
        },
    ],
};

const MOCK_GENERATED_PLAYBOOK = {
    type: 'shell',
    content: '#!/bin/bash\n\nNAMESPACE=$1\nPOD_NAME=$2\n\nif [ -z "$NAMESPACE" ] || [ -z "$POD_NAME" ]; then\n  echo "Error: Both namespace and pod_name are required."\n  exit 1\nfi\n\necho "Attempting to restart pod $POD_NAME in namespace $NAMESPACE..."\nkubectl delete pod $POD_NAME -n $NAMESPACE\n\nif [ $? -eq 0 ]; then\n  echo "Pod $POD_NAME successfully deleted. It will be restarted by its controller."\nelse\n  echo "Error: Failed to delete pod $POD_NAME."\n  exit 1\nfi',
    parameters: [
        { name: 'namespace', label: 'Namespace', type: 'string', required: true, placeholder: 'e.g., production' },
        { name: 'pod_name', label: 'Pod Name', type: 'string', required: true, placeholder: 'e.g., api-gateway-xyz' }
    ]
};

const MOCK_LOG_ANALYSIS: LogAnalysis = {
    summary: '在過去 15 分鐘內，系統偵測到大量與支付服務相關的錯誤日誌。主要問題似乎與資料庫連線逾時有關，導致交易處理失敗。同時，API 閘道出現了少量的警告，可能是上游問題的連鎖反應。',
    patterns: [
        { description: '`payment-service`: Database connection timeout', count: 42, level: 'error' },
        { description: '`api-gateway`: Upstream service unavailable', count: 15, level: 'warning' },
        { description: '`auth-service`: Successful login', count: 120, level: 'info' },
    ],
    recommendations: [
        '立即檢查 `payment-service` 與 `payment-db` 之間的網路連線與防火牆規則。',
        '檢視 `payment-db` 的連線池設定，確認是否已滿。',
        '考慮為 `payment-service` 的資料庫查詢增加重試機制與超時控制。',
    ]
};

const MOCK_RESOURCE_ANALYSIS: ResourceAnalysis = {
    summary: '對選定的 5 個資源進行分析後，發現 2 個高風險資源，主要與潛在的容量瓶頸和過時的配置有關。此外，有 1 個資源存在成本優化機會。',
    risk_analysis: [
        {
            resource_id: 'res-002',
            resource_name: 'rds-prod-main',
            risk_level: 'high',
            reason: '記憶體使用率連續 3 天超過 90%，且慢查詢日誌數量增加。',
            recommendation: '建議立即升級資料庫實例類型，並分析慢查詢。'
        },
        {
            resource_id: 'res-007',
            resource_name: 'api-service',
            risk_level: 'medium',
            reason: '副本數 (3) 在流量高峰期可能不足，CPU Throttling 指標上升。',
            recommendation: '建議將 HPA 的最小副本數調整為 5。'
        }
    ],
    optimization_suggestions: [
        {
            resource_id: 'res-004',
            resource_name: 'web-prod-12',
            suggestion: '此 EC2 實例的平均 CPU 使用率低於 10%。建議將實例類型從 `t3.large` 降級為 `t3.medium` 以節省成本。',
            type: 'cost'
        }
    ]
};

const MOCK_EVENT_CORRELATION_DATA = {
    nodes: [
        { id: 'INC-002', name: '資料庫連線逾時', value: 10, symbol_size: 60, category: 0 },
        { id: 'INC-001', name: 'API 延遲激增', value: 8, symbol_size: 50, category: 1 },
        { id: 'Deployment-XYZ', name: '系統部署', value: 5, symbol_size: 35, category: 2 },
        { id: 'INC-003', name: '5xx 錯誤', value: 9, symbol_size: 55, category: 1 },
        { id: 'res-002', name: 'RDS 資料庫', value: 6, symbol_size: 40, category: 0 },
        { id: 'res-001', name: 'API 閘道', value: 6, symbol_size: 40, category: 1 },
    ],
    links: [
        { source: 'res-002', target: 'INC-002' },
        { source: 'Deployment-XYZ', target: 'INC-001' },
        { source: 'res-001', target: 'INC-001' },
        { source: 'INC-001', target: 'INC-003' },
        { source: 'INC-002', target: 'INC-003', lineStyle: { type: 'dashed' } },
    ],
    categories: [
        { name: '資料庫事件' },
        { name: 'API 事件' },
        { name: '基礎設施變更' },
    ],
};
const MOCK_CAPACITY_SUGGESTIONS = [
    {
        id: 'cap-sug-001',
        title: '擴展 Kubernetes 生產集群',
        impact: '高' as const,
        effort: '中' as const,
        details: '`k8s-prod-cluster` 的 CPU 預計在 15 天內達到 95%。建議增加 2 個節點以避免效能下降。',
        detected_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        resource_id: 'res-1001',
    },
    {
        id: 'cap-sug-002',
        title: '升級 RDS 資料庫實例類型',
        impact: '中' as const,
        effort: '高' as const,
        details: '`rds-prod-main` 的記憶體使用率持續增長。建議從 `db.t3.large` 升級至 `db.t3.xlarge`。',
        detected_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        resource_id: 'res-1024',
    },
    {
        id: 'cap-sug-003',
        title: '清理舊的 S3 儲存桶日誌',
        impact: '低' as const,
        effort: '低' as const,
        details: '`s3-log-archive` 儲存桶已超過 5TB。建議設定生命週期規則以降低成本。',
        detected_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        resource_id: 'res-1077',
    },
];
const MOCK_CAPACITY_RESOURCE_ANALYSIS = [
    {
        id: 'cap-resource-001',
        resource_id: 'res-201',
        resource_name: 'api-gateway-prod-01',
        current_utilization: 55,
        forecast_utilization: 75,
        recommendation: {
            label: '擴展',
            action: 'scale_up' as const,
            severity: 'warning' as const,
        },
        cost_impact: {
            label: '+$150/月',
            monthly_delta: 150,
            currency: 'USD',
        },
        last_evaluated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
        id: 'cap-resource-002',
        resource_id: 'res-305',
        resource_name: 'rds-prod-main',
        current_utilization: 62,
        forecast_utilization: 68,
        recommendation: {
            label: '觀察',
            action: 'monitor' as const,
            severity: 'info' as const,
        },
        cost_impact: {
            label: '-',
            monthly_delta: null,
            currency: null,
        },
        last_evaluated_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
    {
        id: 'cap-resource-003',
        resource_id: 'res-415',
        resource_name: 'k8s-prod-cluster-node-1',
        current_utilization: 85,
        forecast_utilization: 98,
        recommendation: {
            label: '緊急擴展',
            action: 'scale_up' as const,
            severity: 'critical' as const,
        },
        cost_impact: {
            label: '+$200/月',
            monthly_delta: 200,
            currency: 'USD',
        },
        last_evaluated_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    },
    {
        id: 'cap-resource-004',
        resource_id: 'res-522',
        resource_name: 'elasticache-prod-03',
        current_utilization: 40,
        forecast_utilization: 45,
        recommendation: {
            label: '觀察',
            action: 'monitor' as const,
            severity: 'info' as const,
        },
        cost_impact: {
            label: '-',
            monthly_delta: null,
            currency: null,
        },
        last_evaluated_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    },
];
const MOCK_CAPACITY_TIME_OPTIONS = [
    { label: '最近 30 天 + 預測 15 天', value: '30_15', default: false },
    { label: '最近 60 天 + 預測 30 天', value: '60_30', default: true },
    { label: '最近 90 天 + 預測 45 天', value: '90_45', default: false },
];
const MOCK_SERVICE_HEALTH_DATA = {
    heatmap_data: [
        [0, 0, 98], [0, 1, 100], [0, 2, 95], [0, 3, 99],
        [1, 0, 100], [1, 1, 100], [1, 2, 92], [1, 3, 98],
        [2, 0, 85], [2, 1, 90], [2, 2, 88], [2, 3, 91],
        [3, 0, 99], [3, 1, 99], [3, 2, 97], [3, 3, 100],
    ],
    x_axis_labels: ['us-east-1', 'us-west-2', 'eu-central-1', 'ap-northeast-1'],
    y_axis_labels: ['API Gateway', 'RDS Database', 'EKS Cluster', 'Kubernetes'],
    metadata: {
        refreshed_at: '2025-10-12T01:20:00+08:00',
        timezone: 'UTC+8',
        sampling_window: '過去 1 小時',
        coverage: 16,
        summary: 'API Gateway 在 us-east-1 的成功率略有下降，建議關注對應資源。',
        status_tone: 'warning',
        status_counts: {
            healthy: 14,
            warning: 2,
            critical: 0,
        },
    },
};

const MOCK_RESOURCE_GROUP_STATUS_DATA: ResourceGroupStatusData = {
    group_names: ['Production Web Servers', 'Core Databases', 'Cache Cluster', 'Logging Stack', 'API Services'],
    series: [
        { key: 'healthy', label: '健康', data: [12, 8, 5, 10, 22] },
        { key: 'warning', label: '警告', data: [1, 0, 1, 2, 3] },
        { key: 'critical', label: '嚴重', data: [0, 1, 0, 0, 1] },
    ],
    metadata: {
        refreshed_at: '2025-10-12T01:18:00+08:00',
        timezone: 'UTC+8',
        summary: '核心資料庫存在 1 項嚴重告警，請優先處理以避免服務中斷。',
        groups_total: 5,
        status_counts: {
            healthy: 57,
            warning: 7,
            critical: 2,
        },
        status_tone: 'danger',
    },
};

const MOCK_ANALYSIS_OVERVIEW_DATA = {
    health_score: { score: 75, summary: "系統因 API 延遲與錯誤率上升而處於警告狀態，但關鍵基礎設施尚屬穩定。" },
    anomalies: [
        { severity: 'critical', description: 'API Latency p99 has spiked to 1200ms.', timestamp: '5 minutes ago' },
        { severity: 'warning', description: 'Error rate increased to 5.2% after `api-service` deployment.', timestamp: '2 hours ago' },
        { severity: 'warning', description: 'Database connection pool is at 95% capacity.', timestamp: '15 minutes ago' },
    ],
    suggestions: [
        { title: '擴展 Kubernetes API 服務', impact: '高' as '高', effort: '中' as '中', details: '`api-service` 的 CPU 使用率持續偏高，建議增加副本數以應對流量。', action_button_text: '查看資源', action_link: '/resources/res-007' },
    ],
    event_correlation_data: MOCK_EVENT_CORRELATION_DATA,
    recent_logs: MOCK_LOGS.slice(0, 10),
};

const MOCK_INCIDENT_ANALYSIS_REPORT = {
    summary: '根據目前監控數據，此事件由 `api-service` 的後端佇列堆積導致延遲與逾時。',
    root_cause: '資料庫連接池耗盡導致 API 服務等待時間暴增。',
    impact_assessment: '影響約 18% 的登入請求，平均延遲提升 3.2 秒。',
    recommended_actions: [
        '立即擴充資料庫連接池並重啟連線池。',
        '啟用自動化回滾腳本以降低 API 壓力。',
        '通知資料庫團隊檢查慢查詢並調整索引。',
    ],
    related_incidents: ['INC-032', 'INC-045'],
    confidence_score: 0.87,
    analysis_time: '2024-01-15T10:35:00Z',
};

const MOCK_MULTI_INCIDENT_ANALYSIS_REPORT = {
    incident_ids: ['INC-001', 'INC-004', 'INC-010'],
    correlation_found: true,
    correlation_summary: '所有事件皆與 `db-default` 在流量高峰時的性能下降相關。',
    common_root_cause: '`db-default` 寫入延遲在尖峰期間飆升，導致下游服務堆積。',
    timeline: [
        { timestamp: '2024-01-15T08:15:00Z', incident_id: 'INC-001', event: 'API latency alert triggered' },
        { timestamp: '2024-01-15T08:21:00Z', incident_id: 'INC-004', event: 'Database connection timeout detected' },
        { timestamp: '2024-01-15T08:32:00Z', incident_id: 'INC-010', event: 'Error rate breached 5% threshold' },
    ],
    recommended_actions: [
        '將資料庫流量分散至只讀節點並啟用查詢快取。',
        '安排離峰維護以優化索引並重新調整連線池設定。',
    ],
    confidence_score: 0.79,
};

const MOCK_RESOURCE_ANALYSIS_REPORT_V2 = {
    resource_id: 'res-001',
    resource_name: 'web-server-01',
    risk_level: 'high',
    risk_analysis: 'CPU 使用率在過去 72 小時內平均達到 82%，併發請求增加導致排程等待時間拉長。',
    optimization_suggestions: [
        {
            type: 'performance',
            priority: 'high',
            suggestion: '增加部署副本數並調整自動擴縮策略以在 CPU 超過 65% 時提前擴容。',
            estimated_impact: '預計可降低 CPU 使用率 30%，縮短平均回應時間 45%。',
        },
        {
            type: 'reliability',
            priority: 'medium',
            suggestion: '為 `api-service` 加入熔斷與重試機制，避免單一節點過載。',
            estimated_impact: '可減少 20% 的逾時錯誤。',
        },
    ],
    predicted_issues: [
        {
            issue_type: 'capacity',
            probability: 0.72,
            timeframe: '未來 7 天內',
            description: 'CPU 使用率可能在高峰期超過 95%，導致服務降速。',
        },
        {
            issue_type: 'cost',
            probability: 0.41,
            timeframe: '未來 30 天內',
            description: '長時間的過度配置可能造成 18% 的資源浪費。',
        },
    ],
    confidence_score: 0.82,
    analysis_time: '2024-01-15T10:40:00Z',
};

const MOCK_BATCH_RESOURCE_ANALYSIS_REPORT = {
    analyses: [
        { ...MOCK_RESOURCE_ANALYSIS_REPORT_V2 },
        {
            resource_id: 'res-005',
            resource_name: 'payment-service',
            risk_level: 'medium',
            risk_analysis: '資料庫連線延遲在流量尖峰時上升 220ms，可能影響交易成功率。',
            optimization_suggestions: [
                {
                    type: 'performance',
                    priority: 'medium',
                    suggestion: '對熱點查詢新增索引並啟用查詢結果快取。',
                    estimated_impact: '預計可降低查詢延遲 35%。',
                },
            ],
            predicted_issues: [
                {
                    issue_type: 'capacity',
                    probability: 0.58,
                    timeframe: '未來 14 天內',
                    description: '尖峰流量可能導致交易失敗率超過 4%。',
                },
            ],
            confidence_score: 0.76,
            analysis_time: '2024-01-15T10:42:00Z',
        },
        {
            resource_id: 'res-010',
            resource_name: 'cache-cluster',
            risk_level: 'low',
            risk_analysis: '快取命中率維持在 93%，無重大風險。',
            optimization_suggestions: [
                {
                    type: 'cost',
                    priority: 'low',
                    suggestion: '考慮調整節點大小以降低 10% 運算成本。',
                    estimated_impact: '每月可節省約 USD 320。',
                },
            ],
            predicted_issues: [],
            confidence_score: 0.69,
            analysis_time: '2024-01-15T10:45:00Z',
        },
    ],
    summary: {
        total_resources: 3,
        high_risk_count: 1,
        recommendations_count: 7,
    },
};

const MOCK_LOG_ANALYSIS_REPORT_V2 = {
    query: 'error AND service:api',
    time_range: {
        start: '2024-01-15T00:00:00Z',
        end: '2024-01-15T23:59:59Z',
    },
    total_logs: 15420,
    error_count: 234,
    warning_count: 1567,
    patterns_found: [
        { pattern: 'Connection timeout', count: 89, severity: 'error' },
        { pattern: 'Slow query detected', count: 145, severity: 'warning' },
    ],
};

const MOCK_BACKTESTING_RESULTS = {
    'task-001': {
        task_id: 'task-001',
        status: 'completed',
        requested_at: '2025-10-02T10:00:00Z',
        completed_at: '2025-10-02T10:02:30Z',
        duration_seconds: 150,
        rule_results: [
            {
                rule_id: 'rule-001',
                rule_name: 'API Response Time Alert',
                triggered_count: 12,
                trigger_points: [
                    { timestamp: '2025-09-25T14:30:00Z', value: 95, condition_summary: 'CPU usage > 80% for 5 minutes' },
                    { timestamp: '2025-09-26T09:15:00Z', value: 88, condition_summary: 'CPU usage > 80% for 5 minutes' },
                    { timestamp: '2025-09-27T16:45:00Z', value: 92, condition_summary: 'CPU usage > 80% for 5 minutes' },
                ],
                metric_series: [
                    { timestamp: '2025-09-25T10:00:00Z', value: 45 },
                    { timestamp: '2025-09-25T11:00:00Z', value: 48 },
                    { timestamp: '2025-09-25T12:00:00Z', value: 52 },
                    { timestamp: '2025-09-25T13:00:00Z', value: 89 },
                    { timestamp: '2025-09-25T14:00:00Z', value: 95 },
                    { timestamp: '2025-09-25T15:00:00Z', value: 78 },
                    { timestamp: '2025-09-26T08:00:00Z', value: 42 },
                    { timestamp: '2025-09-26T09:00:00Z', value: 88 },
                    { timestamp: '2025-09-26T10:00:00Z', value: 65 },
                    { timestamp: '2025-09-27T15:00:00Z', value: 58 },
                    { timestamp: '2025-09-27T16:00:00Z', value: 92 },
                    { timestamp: '2025-09-27T17:00:00Z', value: 72 },
                ].map(point => ({ ...point, threshold: 80, baseline: 50 })),
                actual_events: [
                    { label: 'Database maintenance', start_time: '2025-09-25T14:00:00Z', end_time: '2025-09-25T15:00:00Z' },
                    { label: 'Traffic spike', start_time: '2025-09-26T09:00:00Z', end_time: '2025-09-26T10:00:00Z' },
                    { label: 'Service deployment', start_time: '2025-09-27T16:00:00Z', end_time: '2025-09-27T17:00:00Z' },
                ],
                recommendations: [
                    {
                        type: 'threshold',
                        title: '調整 CPU 使用率門檻',
                        description: '將門檻從 80% 調整為 85% 可減少 20% 的誤報',
                        suggested_threshold: 85,
                    },
                    {
                        type: 'duration',
                        title: '延長持續時間檢查',
                        description: '將持續時間從 5 分鐘增加到 8 分鐘可提升準確度',
                        suggested_duration_minutes: 8,
                    },
                ],
                suggested_threshold: 82,
                suggested_duration_minutes: 7,
                execution_time_ms: 2500,
            },
        ],
    },
};

const MOCK_CAPACITY_PREDICTION_REPORT = {
    resource_id: 'res-001',
    resource_name: 'web-server-01',
    predictions: [
        {
            metric: 'cpu_usage',
            current_value: 68.5,
            predicted_values: [
                { date: '2024-02-15', value: 78.2, confidence: 0.85 },
                { date: '2024-03-01', value: 83.4, confidence: 0.78 },
                { date: '2024-03-15', value: 87.9, confidence: 0.72 },
            ],
            threshold_breach_date: '2024-03-10',
            recommendation: '建議在 2024-03-01 前增加 CPU 資源或重新分配工作負載。',
        },
        {
            metric: 'memory_usage',
            current_value: 58.1,
            predicted_values: [
                { date: '2024-02-15', value: 64.3, confidence: 0.81 },
                { date: '2024-03-01', value: 69.5, confidence: 0.75 },
                { date: '2024-03-15', value: 73.2, confidence: 0.7 },
            ],
            threshold_breach_date: null,
            recommendation: '持續監控記憶體使用率，暫無需立即調整。',
        },
    ],
};

const MOCK_INCIDENT_PREDICTION_REPORT = {
    predictions: [
        {
            resource_id: 'res-001',
            resource_name: 'web-server-01',
            predicted_issue: 'CPU 使用率可能超過 90%',
            probability: 0.82,
            estimated_time: '2024-01-16T14:30:00Z',
            severity: 'warning',
            preventive_actions: ['考慮增加 CPU 資源', '檢查是否有異常進程'],
        },
        {
            resource_id: 'res-003',
            resource_name: 'payment-service',
            predicted_issue: '支付錯誤率可能上升至 5%',
            probability: 0.74,
            estimated_time: '2024-01-16T16:00:00Z',
            severity: 'critical',
            preventive_actions: ['提前擴大資料庫連線池', '預先啟用備援節點'],
        },
    ],
    analysis_timestamp: '2024-01-15T10:00:00Z',
};

const MOCK_ANOMALY_DETECTION_REPORT = {
    anomalies: [
        {
            resource_id: 'res-001',
            resource_name: 'web-server-01',
            metric: 'cpu_usage',
            timestamp: '2024-01-15T15:23:00Z',
            actual_value: 95.3,
            expected_range: { min: 30, max: 70 },
            severity: 'high',
            description: 'CPU 使用率異常飆升，超出預期範圍。',
        },
        {
            resource_id: 'res-002',
            resource_name: 'db-default',
            metric: 'latency_ms',
            timestamp: '2024-01-15T15:28:00Z',
            actual_value: 420,
            expected_range: { min: 80, max: 180 },
            severity: 'high',
            description: '資料庫查詢延遲提升，可能與磁碟 IO 飽和有關。',
        },
        {
            resource_id: 'res-005',
            resource_name: 'payment-service',
            metric: 'error_rate',
            timestamp: '2024-01-15T15:34:00Z',
            actual_value: 4.8,
            expected_range: { min: 0, max: 1.5 },
            severity: 'medium',
            description: '支付 API 錯誤率上升，建議檢查與資料庫的連線品質。',
        },
    ],
    summary: {
        total_anomalies: 3,
        high_severity_count: 2,
    },
};

const MOCK_PLATFORM_SETTINGS: PlatformSettings = {
    help_url: 'https://docs.sre-platform.dev/help-center'
};

const MOCK_PREFERENCE_OPTIONS: PreferenceOptions = {
    defaults: {
        theme: 'dark',
        language: 'zh-TW',
        timezone: 'Asia/Taipei',
        default_page: 'sre-war-room',
    },
    timezones: ['Asia/Taipei', 'UTC', 'America/New_York', 'Europe/London'],
    languages: [{ value: 'en', label: 'English' }, { value: 'zh-TW', label: '繁體中文' }],
    themes: [{ value: 'dark', label: '深色' }, { value: 'light', label: '淺色' }, { value: 'system', label: '跟隨系統' }],
};

const MOCK_TAB_CONFIGS: TabConfigMap = {
    incidents: [
        { label: '事件列表', path: '/incidents', icon: 'list' },
        { label: '告警規則', path: '/incidents/rules', icon: 'settings-2' },
        { label: '靜音規則', path: '/incidents/silence', icon: 'bell-off' },
    ],
    resources: [
        { label: '資源列表', path: '/resources/list', icon: 'database' },
        { label: '資源群組', path: '/resources/groups', icon: 'layout-grid' },
        { label: '資料源管理', path: '/resources/datasources', icon: 'database-zap' },
        { label: '自動掃描', path: '/resources/discovery', icon: 'scan-search' },
        { label: '拓撲視圖', path: '/resources/topology', icon: 'share-2' },
    ],
    dashboards: [
        { label: '儀表板列表', path: '/dashboards', icon: 'layout-dashboard' },
        { label: '範本市集', path: '/dashboards/templates', icon: 'album' },
    ],
    analysis: [
        { label: '日誌探索', path: '/analyzing/logs', icon: 'search' },
        { label: '容量規劃', path: '/analyzing/capacity', icon: 'bar-chart-big' },
        { label: '歷史數據回放', path: '/analyzing/backtesting', icon: 'history' },
    ],
    automation: [
        { label: '腳本庫', path: '/automation', icon: 'notebook-tabs' },
        { label: '觸發器', path: '/automation/triggers', icon: 'zap' },
        { label: '執行日誌', path: '/automation/history', icon: 'history' },
    ],
    iam: [
        { label: '人員管理', path: '/settings/identity-access-management', icon: 'users' },
        { label: '團隊管理', path: '/settings/identity-access-management/teams', icon: 'users-2' },
        { label: '角色管理', path: '/settings/identity-access-management/roles', icon: 'shield' },
        { label: '審計日誌', path: '/settings/identity-access-management/audit-logs', icon: 'file-text' },
    ],
    notification: [
        { label: '通知策略', path: '/settings/notification-management', icon: 'list-checks' },
        { label: '通知管道', path: '/settings/notification-management/channels', icon: 'share-2' },
        { label: '發送歷史', path: '/settings/notification-management/history', icon: 'history' },
    ],
    platform_settings: [
        { label: '標籤管理', path: '/settings/platform-settings', icon: 'tags' },
        { label: '版面管理', path: '/settings/platform-settings/layout', icon: 'layout' },
        { label: '郵件設定', path: '/settings/platform-settings/mail', icon: 'mail' },
        { label: '身份驗證', path: '/settings/platform-settings/auth', icon: 'key' },
        { label: 'Grafana 設定', path: '/settings/platform-settings/grafana', icon: 'area-chart' },
        { label: 'License', path: '/settings/platform-settings/license', icon: 'award' },
    ],
    profile: [
        { label: '基本資訊', path: '/profile', icon: 'user' },
        { label: '安全設定', path: '/profile/security', icon: 'lock' },
        { label: '偏好設定', path: '/profile/preferences', icon: 'sliders-horizontal' },
    ]
};

const INCIDENT_STATUS_STYLES: Record<Incident['status'], { label: string; class_name: string }> = {
    new: { label: '新事件', class_name: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border border-amber-400/30 shadow-sm' },
    acknowledged: { label: '已認領', class_name: 'bg-gradient-to-r from-sky-500 to-blue-500 text-white border border-sky-400/30 shadow-sm' },
    resolved: { label: '已解決', class_name: 'bg-gradient-to-r from-emerald-500 to-green-500 text-white border border-emerald-400/30 shadow-sm' },
    silenced: { label: '已靜音', class_name: 'bg-gradient-to-r from-slate-600 to-slate-500 text-slate-200 border border-slate-500/30 shadow-sm' },
};

const INCIDENT_SEVERITY_STYLES: Record<string, { label: string; class_name: string }> = {
    info: { label: '資訊', class_name: 'bg-sky-950/40 border border-sky-500/40 text-sky-300 backdrop-blur-sm shadow-sm' },
    warning: { label: '警告', class_name: 'bg-amber-950/40 border border-amber-500/40 text-amber-300 backdrop-blur-sm shadow-sm' },
    critical: { label: '嚴重', class_name: 'bg-red-950/40 border border-red-500/40 text-red-300 backdrop-blur-sm shadow-sm' },
};

const INCIDENT_IMPACT_STYLES: Record<string, { label: string; class_name: string }> = {
    high: { label: '高', class_name: 'bg-red-950/40 border border-red-500/40 text-red-300 backdrop-blur-sm shadow-sm' },
    medium: { label: '中', class_name: 'bg-amber-950/40 border border-amber-500/40 text-amber-300 backdrop-blur-sm shadow-sm' },
    low: { label: '低', class_name: 'bg-yellow-950/40 border border-yellow-500/40 text-yellow-300 backdrop-blur-sm shadow-sm' },
};

const INCIDENT_PRIORITY_STYLES: Record<IncidentPriority, { label: string; class_name: string }> = {
    p0: { label: 'P0 (最高)', class_name: 'bg-red-950/40 border border-red-500/40 text-red-300 backdrop-blur-sm shadow-sm' },
    p1: { label: 'P1 (高)', class_name: 'bg-orange-950/40 border border-orange-500/40 text-orange-300 backdrop-blur-sm shadow-sm' },
    p2: { label: 'P2 (中)', class_name: 'bg-amber-950/40 border border-amber-500/40 text-amber-300 backdrop-blur-sm shadow-sm' },
    p3: { label: 'P3 (低)', class_name: 'bg-sky-950/40 border border-sky-500/40 text-sky-300 backdrop-blur-sm shadow-sm' },
};

const INCIDENT_CATEGORY_STYLES: Record<IncidentCategory, { label: string; class_name: string }> = {
    infrastructure: { label: '基礎設施', class_name: 'bg-slate-950/40 border border-slate-500/40 text-slate-300 backdrop-blur-sm shadow-sm' },
    application: { label: '應用程式', class_name: 'bg-purple-950/40 border border-purple-500/40 text-purple-300 backdrop-blur-sm shadow-sm' },
    network: { label: '網路', class_name: 'bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 backdrop-blur-sm shadow-sm' },
    security: { label: '安全', class_name: 'bg-rose-950/40 border border-rose-500/40 text-rose-300 backdrop-blur-sm shadow-sm' },
    other: { label: '其他', class_name: 'bg-stone-950/40 border border-stone-500/40 text-stone-300 backdrop-blur-sm shadow-sm' },
};

const buildIncidentStyleOptions = <T extends string>(values: T[], styleMap: Record<string, { label: string; class_name: string }>): StyleDescriptor<T>[] =>
    values.map((value: T) => ({
        value,
        label: styleMap[value]?.label ?? value,
        class_name: styleMap[value]?.class_name ?? 'bg-slate-800/60 border border-slate-600 text-slate-200',
    }));

const MOCK_INCIDENT_OPTIONS: IncidentOptions = {
    statuses: buildIncidentStyleOptions(getEnumValuesForTag('status') as Incident['status'][], INCIDENT_STATUS_STYLES),
    severities: buildIncidentStyleOptions(getEnumValuesForTag('severity') as Incident['severity'][], INCIDENT_SEVERITY_STYLES),
    impacts: buildIncidentStyleOptions(getEnumValuesForTag('impact') as Incident['impact'][], INCIDENT_IMPACT_STYLES),
    priorities: buildIncidentStyleOptions(getEnumValuesForTag('priority') as IncidentPriority[], INCIDENT_PRIORITY_STYLES),
    categories: buildIncidentStyleOptions(getEnumValuesForTag('category') as IncidentCategory[], INCIDENT_CATEGORY_STYLES),
    quick_silence_durations: [
        { label: '1 小時', value: 1 },
        { label: '4 小時', value: 4 },
        { label: '8 小時', value: 8 },
        { label: '12 小時', value: 12 },
        { label: '1 天', value: 24 },
        { label: '3 天', value: 72 },
    ],
};

const ALERT_RULE_SEVERITY_DESCRIPTORS: Record<AlertRule['severity'], { label: string; class_name: string }> = {
    critical: { label: '嚴重', class_name: 'bg-red-950/40 border border-red-500/40 text-red-300 backdrop-blur-sm shadow-sm' },
    warning: { label: '警告', class_name: 'bg-amber-950/40 border border-amber-500/40 text-amber-300 backdrop-blur-sm shadow-sm' },
    info: { label: '資訊', class_name: 'bg-sky-950/40 border border-sky-500/40 text-sky-300 backdrop-blur-sm shadow-sm' },
};

const MOCK_ALERT_RULE_OPTIONS: AlertRuleOptions = {
    severities: (['critical', 'warning', 'info'] as AlertRule['severity'][]).map(value => ({
        value,
        label: ALERT_RULE_SEVERITY_DESCRIPTORS[value].label,
        class_name: ALERT_RULE_SEVERITY_DESCRIPTORS[value].class_name,
    })),
    statuses: [
        { value: true, label: '啟用' },
        { value: false, label: '停用' }
    ],
    operators: ['>', '<', '>=', '<='],
    scope_modes: [
        { value: 'all', label: '所有資源（按類型）' },
        { value: 'group', label: '按資源群組' },
        { value: 'specific', label: '特定資源' },
    ],
    variables: ['{{severity}}', '{{resource.name}}', '{{metric}}', '{{value}}', '{{threshold}}', '{{duration}}'],
    step_titles: ["選擇監控目標", "設定基本資訊", "定義觸發條件", "事件定義與通知", "設定自動化響應"],
};

const MOCK_RESOURCE_OPTIONS: ResourceOptions = {
    statuses: [
        { value: 'healthy', label: '正常', class_name: 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 backdrop-blur-sm shadow-sm' },
        { value: 'warning', label: '警告', class_name: 'bg-amber-950/40 border border-amber-500/40 text-amber-300 backdrop-blur-sm shadow-sm' },
        { value: 'critical', label: '嚴重', class_name: 'bg-red-950/40 border border-red-500/40 text-red-300 backdrop-blur-sm shadow-sm' },
        { value: 'offline', label: '離線', class_name: 'bg-slate-950/40 border border-slate-500/40 text-slate-300 backdrop-blur-sm shadow-sm' },
        { value: 'unknown', label: '未知', class_name: 'bg-slate-800/40 border border-slate-600/40 text-slate-200 backdrop-blur-sm shadow-sm' },
    ],
    status_colors: [
        { value: 'healthy', label: '正常', color: '#10b981' },
        { value: 'warning', label: '警告', color: '#f97316' },
        { value: 'critical', label: '嚴重', color: '#dc2626' },
        { value: 'offline', label: '離線', color: '#64748b' },
        { value: 'unknown', label: '未知', color: '#94a3b8' },
    ],
    types: [
        { value: 'API Gateway', label: 'API Gateway', class_name: 'bg-blue-950/40 border border-blue-500/40 text-blue-300 backdrop-blur-sm shadow-sm' },
        { value: 'RDS Database', label: 'RDS Database', class_name: 'bg-green-950/40 border border-green-500/40 text-green-300 backdrop-blur-sm shadow-sm' },
        { value: 'EKS Cluster', label: 'EKS Cluster', class_name: 'bg-purple-950/40 border border-purple-500/40 text-purple-300 backdrop-blur-sm shadow-sm' },
        { value: 'EC2 Instance', label: 'EC2 Instance', class_name: 'bg-orange-950/40 border border-orange-500/40 text-orange-300 backdrop-blur-sm shadow-sm' },
        { value: 'Kubernetes', label: 'Kubernetes', class_name: 'bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 backdrop-blur-sm shadow-sm' }
    ],
    providers: ['AWS', 'GCP', 'Azure', 'On-Premise'],
    regions: ['us-east-1', 'us-west-2', 'eu-central-1', 'ap-northeast-1'],
    owners: ['SRE Team', 'DBA Team', 'Web Team', 'API Services'],
};

const MOCK_AUTOMATION_SCRIPT_OPTIONS: AutomationScriptOptions = {
    playbook_types: [
        { value: 'shell', label: 'Shell 腳本' },
        { value: 'python', label: 'Python 腳本' },
        { value: 'ansible', label: 'Ansible 劇本' },
        { value: 'terraform', label: 'Terraform 配置' }
    ],
    parameter_types: [
        { value: 'string', label: '字串' },
        { value: 'number', label: '數字' },
        { value: 'enum', label: '枚舉' },
        { value: 'boolean', label: '布林值' }
    ]
};

const MOCK_AUTOMATION_EXECUTION_OPTIONS: AutomationExecutionOptions = {
    statuses: [
        { value: 'success', label: '成功', class_name: 'bg-green-500/20 text-green-400' },
        { value: 'failed', label: '失敗', class_name: 'bg-red-500/20 text-red-400' },
        { value: 'running', label: '執行中', class_name: 'bg-sky-500/20 text-sky-400' },
        { value: 'pending', label: '等待中', class_name: 'bg-yellow-500/20 text-yellow-400' },
        { value: 'cancelled', label: '已取消', class_name: 'bg-slate-500/20 text-slate-300' },
    ],
    trigger_sources: [
        { value: 'event', label: '事件觸發', class_name: 'bg-red-950/40 border border-red-500/40 text-red-300 backdrop-blur-sm shadow-sm' },
        { value: 'manual', label: '手動執行', class_name: 'bg-blue-950/40 border border-blue-500/40 text-blue-300 backdrop-blur-sm shadow-sm' },
        { value: 'schedule', label: '排程觸發', class_name: 'bg-green-950/40 border border-green-500/40 text-green-300 backdrop-blur-sm shadow-sm' },
        { value: 'webhook', label: 'Webhook', class_name: 'bg-purple-950/40 border border-purple-500/40 text-purple-300 backdrop-blur-sm shadow-sm' },
        { value: 'custom', label: '自定義觸發', class_name: 'bg-amber-950/40 border border-amber-500/40 text-amber-300 backdrop-blur-sm shadow-sm' },
        { value: 'grafana', label: 'Grafana 儀表板', class_name: 'bg-orange-950/40 border border-orange-500/40 text-orange-300 backdrop-blur-sm shadow-sm' },
    ],
};

const MOCK_NOTIFICATION_CHANNEL_OPTIONS: NotificationChannelOptions = {
    channel_types: [
        { value: 'email', label: '郵件', class_name: 'bg-blue-950/40 border border-blue-500/40 text-blue-300 backdrop-blur-sm shadow-sm' },
        { value: 'webhook', label: 'Webhook (通用)', class_name: 'bg-green-950/40 border border-green-500/40 text-green-300 backdrop-blur-sm shadow-sm' },
        { value: 'slack', label: 'Slack', class_name: 'bg-purple-950/40 border border-purple-500/40 text-purple-300 backdrop-blur-sm shadow-sm' },
        { value: 'line', label: 'LINE 通知', class_name: 'bg-green-950/40 border border-green-500/40 text-green-300 backdrop-blur-sm shadow-sm' },
        { value: 'sms', label: '簡訊', class_name: 'bg-orange-950/40 border border-orange-500/40 text-orange-300 backdrop-blur-sm shadow-sm' }
    ],
    http_methods: ['get', 'post', 'put', 'patch', 'delete']
};

const MOCK_AUTOMATION_TRIGGER_SEVERITY_OPTIONS = MOCK_ALERT_RULE_OPTIONS.severities.map(({ value, label }) => ({ value, label }));

const MOCK_AUTOMATION_TRIGGER_OPTIONS: AutomationTriggerOptions = {
    trigger_types: [
        { value: 'schedule', label: '排程' },
        { value: 'webhook', label: 'Webhook' },
        { value: 'event', label: '事件' }
    ],
    condition_keys: ['severity', 'resource.type', 'tag.env'],
    severity_options: MOCK_AUTOMATION_TRIGGER_SEVERITY_OPTIONS,
    default_configs: {
        'schedule': { cron: '0 * * * *' },
        'webhook': { webhook_url: 'https://sre.platform/api/v1/webhooks/hook-generated-id' },
        'event': { event_conditions: `severity = ${MOCK_AUTOMATION_TRIGGER_SEVERITY_OPTIONS[0]?.value ?? 'critical'}` }
    },
    retry_policies: [
        { value: 'none', label: '不重試' },
        { value: 'fixed', label: '固定間隔重試' },
        { value: 'exponential', label: '指數回退重試' },
    ]
};

const MOCK_PERSONNEL_OPTIONS: PersonnelOptions = {
    statuses: [
        { value: 'active', label: '活躍', class_name: 'bg-green-500/20 text-green-400' },
        { value: 'invited', label: '已邀請', class_name: 'bg-yellow-500/20 text-yellow-400' },
        { value: 'inactive', label: '非活躍', class_name: 'bg-slate-500/20 text-slate-400' },
    ],
};

const MOCK_DASHBOARD_OPTIONS: DashboardOptions = {
    categories: [
        { value: '業務與 SLA', label: '業務與 SLA', class_name: 'bg-blue-950/40 border border-blue-500/40 text-blue-300 backdrop-blur-sm shadow-sm' },
        { value: '基礎設施', label: '基礎設施', class_name: 'bg-green-950/40 border border-green-500/40 text-green-300 backdrop-blur-sm shadow-sm' },
        { value: '營運與容量', label: '營運與容量', class_name: 'bg-purple-950/40 border border-purple-500/40 text-purple-300 backdrop-blur-sm shadow-sm' },
        { value: '團隊自訂', label: '團隊自訂', class_name: 'bg-orange-950/40 border border-orange-500/40 text-orange-300 backdrop-blur-sm shadow-sm' }
    ],
    owners: ['事件指揮中心', 'SRE 平台團隊', '前端團隊', 'Admin User'],
};

const MOCK_AUDIT_LOG_OPTIONS: AuditLogOptions = {
    action_types: ['login', 'update', 'create', 'delete'],
};

const MOCK_LOG_OPTIONS: LogOptions = {
    time_range_options: MOCK_LOG_TIME_OPTIONS,
};

const MOCK_INFRA_INSIGHTS_OPTIONS: InfraInsightsOptions = {
    time_options: MOCK_GRAFANA_OPTIONS.time_options,
    risk_levels: [
        { value: 'high', label: '高風險', color: '#dc2626' },
        { value: 'medium', label: '中風險', color: '#f97316' },
        { value: 'low', label: '低風險', color: '#10b981' },
    ],
    refresh_options: MOCK_GRAFANA_OPTIONS.refresh_options,
    tv_mode_options: MOCK_GRAFANA_OPTIONS.tv_mode_options,
    theme_options: MOCK_GRAFANA_OPTIONS.theme_options,
};

const MOCK_TAG_MANAGEMENT_OPTIONS: TagManagementOptions = {
    scopes: TAG_SCOPE_OPTIONS,
    kinds: [
        { value: 'enum', label: '列舉 (Enum)', description: '使用者需從預先定義的值域中選擇。' },
        { value: 'text', label: '文字 (Text)', description: '允許自由輸入並支援欄位驗證。' },
        { value: 'boolean', label: '布林 (Boolean)', description: '以是/否形式呈現，適用於開關設定。' },
        { value: 'reference', label: '參考 (Reference)', description: '由系統依據其他實體自動帶入，不可編輯。' },
    ],
    writable_roles: ['platform_admin', 'sre_lead', 'compliance_officer'],
    governance_notes: '標籤鍵須符合治理規範：鍵名使用小寫與底線、枚舉值需在登錄處定義、不得於頁面臨時建立新鍵。',
};

const MOCK_TOPOLOGY_OPTIONS: TopologyOptions = {
    layouts: [
        { value: 'force', label: '力導向' },
        { value: 'circular', label: '環狀' },
    ]
};

const MOCK_NOTIFICATION_HISTORY_OPTIONS: NotificationHistoryOptions = {
    statuses: [
        { value: 'sent', label: '已發送' },
        { value: 'failed', label: '發送失敗' },
    ],
    channel_types: [
        { value: 'email', label: '郵件' },
        { value: 'webhook', label: 'Webhook (通用)' },
        { value: 'slack', label: 'Slack' },
        { value: 'line', label: 'LINE 通知' },
        { value: 'sms', label: '簡訊' },
    ],
};

const MOCK_DATASOURCE_OPTIONS: DatasourceOptions = {
    types: [
        { value: 'victoriametrics', label: 'VictoriaMetrics', class_name: 'bg-blue-950/40 border border-blue-500/40 text-blue-300 backdrop-blur-sm shadow-sm' },
        { value: 'grafana', label: 'Grafana', class_name: 'bg-orange-950/40 border border-orange-500/40 text-orange-300 backdrop-blur-sm shadow-sm' },
        { value: 'elasticsearch', label: 'Elasticsearch', class_name: 'bg-green-950/40 border border-green-500/40 text-green-300 backdrop-blur-sm shadow-sm' },
        { value: 'prometheus', label: 'Prometheus', class_name: 'bg-purple-950/40 border border-purple-500/40 text-purple-300 backdrop-blur-sm shadow-sm' },
        { value: 'custom', label: '自訂', class_name: 'bg-slate-950/40 border border-slate-500/40 text-slate-300 backdrop-blur-sm shadow-sm' }
    ],
    auth_methods: [
        { value: 'token', label: 'Token', class_name: 'bg-blue-950/40 border border-blue-500/40 text-blue-300 backdrop-blur-sm shadow-sm' },
        { value: 'basic_auth', label: '基本認證', class_name: 'bg-green-950/40 border border-green-500/40 text-green-300 backdrop-blur-sm shadow-sm' },
        { value: 'keycloak_integration', label: 'Keycloak 整合', class_name: 'bg-purple-950/40 border border-purple-500/40 text-purple-300 backdrop-blur-sm shadow-sm' },
        { value: 'none', label: '無', class_name: 'bg-slate-950/40 border border-slate-500/40 text-slate-300 backdrop-blur-sm shadow-sm' }
    ],
};

const MOCK_AUTO_DISCOVERY_OPTIONS: AutoDiscoveryOptions = {
    job_kinds: [
        { value: 'k8s', label: 'Kubernetes', class_name: 'bg-blue-950/40 border border-blue-500/40 text-blue-300 backdrop-blur-sm shadow-sm' },
        { value: 'snmp', label: 'SNMP', class_name: 'bg-green-950/40 border border-green-500/40 text-green-300 backdrop-blur-sm shadow-sm' },
        { value: 'cloud_provider', label: '雲提供商', class_name: 'bg-purple-950/40 border border-purple-500/40 text-purple-300 backdrop-blur-sm shadow-sm' },
        { value: 'static_range', label: '靜態範圍', class_name: 'bg-orange-950/40 border border-orange-500/40 text-orange-300 backdrop-blur-sm shadow-sm' },
        { value: 'custom_script', label: '自訂腳本', class_name: 'bg-slate-950/40 border border-slate-500/40 text-slate-300 backdrop-blur-sm shadow-sm' }
    ],
    exporter_templates: [
        { id: 'none', name: '不部署 Exporter', description: '僅建立資源資料，不自動綁定監控代理。' },
        { id: 'node_exporter', name: 'Node Exporter', description: '適用於 Linux/Windows 主機的系統監控。', supports_overrides: true },
        { id: 'snmp_exporter', name: 'SNMP Exporter', description: '適用於網路設備與 OT 設備，支援 MIB Profile。', supports_mib_profile: true },
        { id: 'modbus_exporter', name: 'Modbus Exporter', description: '用於 PLC 或工業設備，支援 YAML 覆寫。', supports_overrides: true },
        { id: 'ipmi_exporter', name: 'IPMI Exporter', description: '收集裸機 BMC 感測資料。', supports_overrides: true },
    ],
    mib_profiles: [
        { id: 'snmp-default', name: '通用 SNMP Profile', description: '涵蓋 CPU/記憶體/網路等基礎 OID。', template_id: 'snmp_exporter' },
        { id: 'snmp-cisco', name: 'Cisco 網路設備', description: '針對 Cisco 路由/交換器的延伸指標。', template_id: 'snmp_exporter' },
        { id: 'modbus-energy', name: '能源表計', description: '量測溫度、電流、電壓等欄位。', template_id: 'modbus_exporter' },
    ],
    edge_gateways: [
        { id: 'edge-gw-1', name: 'IDC Edge Gateway', location: '台北 IDC', description: '連線至資料中心網段，提供 SNMP/Modbus 掃描。' },
        { id: 'edge-gw-2', name: 'Factory OT Gateway', location: '台中廠房', description: '工廠產線專用，支援隔離網段的 OT 探測。' },
    ],
};

const MOCK_ALL_OPTIONS: AllOptions = {
    incidents: MOCK_INCIDENT_OPTIONS,
    alert_rules: MOCK_ALERT_RULE_OPTIONS,
    silence_rules: MOCK_SILENCE_RULE_OPTIONS,
    resources: MOCK_RESOURCE_OPTIONS,
    automation_scripts: MOCK_AUTOMATION_SCRIPT_OPTIONS,
    notification_channels: MOCK_NOTIFICATION_CHANNEL_OPTIONS,
    automation_triggers: MOCK_AUTOMATION_TRIGGER_OPTIONS,
    personnel: MOCK_PERSONNEL_OPTIONS,
    dashboards: MOCK_DASHBOARD_OPTIONS,
    notification_strategies: MOCK_NOTIFICATION_STRATEGY_OPTIONS,
    grafana: MOCK_GRAFANA_OPTIONS,
    audit_logs: MOCK_AUDIT_LOG_OPTIONS,
    logs: MOCK_LOG_OPTIONS,
    infra_insights: MOCK_INFRA_INSIGHTS_OPTIONS,
    tag_management: MOCK_TAG_MANAGEMENT_OPTIONS,
    topology: MOCK_TOPOLOGY_OPTIONS,
    automation_executions: MOCK_AUTOMATION_EXECUTION_OPTIONS,
    notification_history: MOCK_NOTIFICATION_HISTORY_OPTIONS,
    datasources: MOCK_DATASOURCE_OPTIONS,
    auto_discovery: MOCK_AUTO_DISCOVERY_OPTIONS,
};

const MOCK_DATASOURCES: Datasource[] = [
    {
        id: 'ds-001',
        name: 'Prometheus-A',
        type: 'prometheus',
        status: 'ok',
        created_at: '2025-09-01T12:30:00Z',
        updated_at: '2025-09-14T03:45:00Z',
        url: 'http://prometheus-a.internal:9090',
        auth_method: 'none',
        tags: [{ id: 'tag-1', key: 'env', value: 'production' }]
    },
    {
        id: 'ds-002',
        name: 'VM-Cluster-1',
        type: 'victoriametrics',
        status: 'error',
        created_at: '2025-09-10T09:22:00Z',
        updated_at: '2025-09-15T07:18:00Z',
        url: 'http://vm-cluster-1.internal:8428',
        auth_method: 'token',
        tags: [{ id: 'tag-2', key: 'env', value: 'production' }, { id: 'tag-3', key: 'cluster', value: '1' }]
    },
    {
        id: 'ds-003',
        name: 'Main Grafana',
        type: 'grafana',
        status: 'pending',
        created_at: '2025-09-11T15:00:00Z',
        updated_at: '2025-09-13T09:05:00Z',
        url: 'http://grafana.internal',
        auth_method: 'keycloak_integration',
        tags: []
    }
];

const MOCK_DATASOURCE_CONNECTION_TESTS: DatasourceConnectionTestLog[] = [
    {
        id: 'ds-test-001',
        datasource_id: 'ds-001',
        status: 'ok',
        result: 'success',
        latency_ms: 95,
        message: '成功連線至 Prometheus-A。',
        tested_by: 'usr-admin',
        tested_at: '2025-09-12T08:00:00Z'
    },
    {
        id: 'ds-test-002',
        datasource_id: 'ds-002',
        status: 'error',
        result: 'failed',
        latency_ms: 210,
        message: '無法連線至 VM-Cluster-1，請確認憑證。',
        tested_by: 'usr-admin',
        tested_at: '2025-09-12T09:15:00Z'
    }
];

const MOCK_DISCOVERY_JOBS: DiscoveryJob[] = [
    {
        id: 'dj-001',
        name: 'K8s Cluster A',
        kind: 'k8s',
        schedule: '0 9 * * *', // 每天 09:00
        last_run_at: '2025-09-23T09:00:15Z',
        status: 'success',
        target_config: { kubeconfig: '...' },
        exporter_binding: { template_id: 'node_exporter' },
        edge_gateway: { enabled: false },
        tags: [{ id: 'tag-4', key: 'cluster', value: 'A' }],
        created_at: '2025-09-01T09:00:00Z',
        updated_at: '2025-09-23T09:00:15Z',
    },
    {
        id: 'dj-002',
        name: 'IDC-SNMP-Scan',
        kind: 'snmp',
        schedule: '30 * * * *', // 每小時 30 分
        last_run_at: '2025-09-23T10:30:05Z',
        status: 'failed',
        target_config: { community: 'public', ip_range: '10.1.1.1/24' },
        exporter_binding: { template_id: 'snmp_exporter', mib_profile_id: 'snmp-default' },
        edge_gateway: { enabled: true, gateway_id: 'edge-gw-1' },
        tags: [{ id: 'tag-5', key: 'datacenter', value: 'IDC-1' }],
        created_at: '2025-09-02T10:00:00Z',
        updated_at: '2025-09-23T10:30:05Z',
    },
    {
        id: 'dj-003',
        name: 'Cloud Provider Sync',
        kind: 'cloud_provider',
        schedule: '0 0 * * *', // 每天
        last_run_at: '2025-09-23T00:00:10Z',
        status: 'running',
        target_config: { api_key: '***masked***' },
        exporter_binding: { template_id: 'node_exporter' },
        edge_gateway: { enabled: false },
        tags: [],
        created_at: '2025-09-03T11:00:00Z',
        updated_at: '2025-09-23T00:00:10Z',
    }
];

const MOCK_DISCOVERED_RESOURCES: DiscoveredResource[] = [
    { id: 'd-res-1', name: 'web-server-new-01', ip: '10.1.2.10', type: 'VM', tags: [{ id: 't1', key: 'os', value: 'linux' }], status: 'new' },
    { id: 'd-res-2', name: 'redis-cache-xyz', ip: '10.1.3.15', type: 'Kubernetes Pod', tags: [{ id: 't2', key: 'app', value: 'redis' }], status: 'new' },
    { id: 'd-res-3', name: 'prod-db-replica-2', ip: '10.1.2.11', type: 'VM', tags: [{ id: 't3', key: 'role', value: 'database' }], status: 'imported' },
    { id: 'd-res-4', name: 'old-test-server', ip: '10.1.2.12', type: 'VM', tags: [], status: 'ignored' },
];


function createInitialDB() {
    // Deep clone to make it mutable
    return {
        metric_metadata: JSON.parse(JSON.stringify(MOCK_METRIC_METADATA)),
        resource_types: JSON.parse(JSON.stringify(MOCK_RESOURCE_TYPES)),
        exporter_types: JSON.parse(JSON.stringify(MOCK_EXPORTER_TYPES)),
        system_config: JSON.parse(JSON.stringify(MOCK_SYSTEM_CONFIG)),
        commands: JSON.parse(JSON.stringify(MOCK_COMMANDS)),
        page_metadata: JSON.parse(JSON.stringify(MOCK_PAGE_METADATA)),
        icon_map: JSON.parse(JSON.stringify(MOCK_ICON_MAP)),
        chart_colors: JSON.parse(JSON.stringify(MOCK_CHART_COLORS)),
        nav_items: JSON.parse(JSON.stringify(MOCK_NAV_ITEMS)),
        dashboards: JSON.parse(JSON.stringify(MOCK_DASHBOARDS)),
        available_grafana_dashboards: JSON.parse(JSON.stringify(MOCK_AVAILABLE_GRAFANA_DASHBOARDS)),
        dashboard_templates: JSON.parse(JSON.stringify(MOCK_DASHBOARD_TEMPLATES)),
        incidents: JSON.parse(JSON.stringify(MOCK_INCIDENTS)),
        quick_silence_durations: JSON.parse(JSON.stringify(MOCK_QUICK_SILENCE_DURATIONS)),
        alert_rule_default: JSON.parse(JSON.stringify(MOCK_ALERT_RULE_DEFAULT)),
        alert_rules: JSON.parse(JSON.stringify(MOCK_ALERT_RULES)),
        alert_rule_templates: JSON.parse(JSON.stringify(MOCK_ALERT_RULE_TEMPLATES)),
        silence_rules: JSON.parse(JSON.stringify(MOCK_SILENCE_RULES)),
        silence_rule_templates: JSON.parse(JSON.stringify(MOCK_SILENCE_RULE_TEMPLATES)),
        silence_rule_options: JSON.parse(JSON.stringify(MOCK_SILENCE_RULE_OPTIONS)),
        resources: JSON.parse(JSON.stringify(MOCK_RESOURCES)),
        resource_groups: JSON.parse(JSON.stringify(MOCK_RESOURCE_GROUPS)),
        resource_links: JSON.parse(JSON.stringify(MOCK_RESOURCE_LINKS)),
        config_versions: JSON.parse(JSON.stringify(MOCK_CONFIG_VERSIONS)),
        resource_overview_data: JSON.parse(JSON.stringify(MOCK_RESOURCE_OVERVIEW_DATA)),
        playbooks: JSON.parse(JSON.stringify(MOCK_PLAYBOOKS)),
        automation_executions: JSON.parse(JSON.stringify(MOCK_AUTOMATION_EXECUTIONS)),
        automation_triggers: JSON.parse(JSON.stringify(MOCK_AUTOMATION_TRIGGERS)),
        users: JSON.parse(JSON.stringify(MOCK_USERS)),
        user_statuses: JSON.parse(JSON.stringify(MOCK_USER_STATUSES)),
        teams: JSON.parse(JSON.stringify(MOCK_TEAMS)),
        roles: JSON.parse(JSON.stringify(MOCK_ROLES)),
        available_permissions: JSON.parse(JSON.stringify(AVAILABLE_PERMISSIONS)),
        audit_logs: JSON.parse(JSON.stringify(MOCK_AUDIT_LOGS)),
        tag_definitions: JSON.parse(JSON.stringify(MOCK_TAG_DEFINITIONS)),
        notifications: JSON.parse(JSON.stringify(MOCK_NOTIFICATIONS)),
        notification_strategies: JSON.parse(JSON.stringify(MOCK_NOTIFICATION_STRATEGIES)),
        notification_strategy_options: JSON.parse(JSON.stringify(MOCK_NOTIFICATION_STRATEGY_OPTIONS)),
        notification_channels: JSON.parse(JSON.stringify(MOCK_NOTIFICATION_CHANNELS)),
        notification_channel_icons: JSON.parse(JSON.stringify(MOCK_NOTIFICATION_CHANNEL_ICONS)),
        notification_options: JSON.parse(JSON.stringify(MOCK_NOTIFICATION_OPTIONS)),
        notification_history: JSON.parse(JSON.stringify(MOCK_NOTIFICATION_HISTORY)),
        login_history: JSON.parse(JSON.stringify(MOCK_LOGIN_HISTORY)),
        logs: JSON.parse(JSON.stringify(MOCK_LOGS)),
        log_time_options: JSON.parse(JSON.stringify(MOCK_LOG_TIME_OPTIONS)),
        mail_settings: JSON.parse(JSON.stringify(MOCK_MAIL_SETTINGS)),
        grafana_settings: JSON.parse(JSON.stringify(MOCK_GRAFANA_SETTINGS)),
        grafana_options: JSON.parse(JSON.stringify(MOCK_GRAFANA_OPTIONS)),
        auth_settings: JSON.parse(JSON.stringify(MOCK_AUTH_SETTINGS)),
        user_preferences: JSON.parse(JSON.stringify(MOCK_USER_PREFERENCES)),
        layouts: JSON.parse(JSON.stringify(DEFAULT_LAYOUTS)),
        layout_widgets: JSON.parse(JSON.stringify(LAYOUT_WIDGETS)),
        kpi_data: JSON.parse(JSON.stringify(KPI_DATA)),
        all_columns: JSON.parse(JSON.stringify(MOCK_ALL_COLUMNS)),
        column_configs: {
            dashboards: ['name', 'type', 'category', 'owner', 'updated_at'],
            incidents: ['summary', 'status', 'severity', 'impact', 'resource', 'assignee', 'occurred_at'],
            resources: ['status', 'name', 'type', 'event_count', 'cpu_usage', 'memory_usage'],
            personnel: ['name', 'role', 'team', 'status', 'last_login_at'],
            alert_rules: ['enabled', 'name', 'target', 'conditions_summary', 'severity', 'automation_enabled', 'creator', 'updated_at'],
            silence_rules: ['enabled', 'name', 'type', 'matchers', 'schedule', 'creator', 'created_at'],
            resource_groups: ['name', 'owner_team', 'member_ids', 'status_summary'],
            automation_playbooks: ['name', 'trigger', 'last_run_status', 'last_run_at', 'run_count'],
            automation_history: ['script_name', 'status', 'trigger_source', 'triggered_by', 'start_time', 'duration_ms'],
            automation_triggers: ['enabled', 'name', 'type', 'target_playbook_id', 'last_triggered_at'],
            teams: ['name', 'owner_id', 'member_ids', 'created_at'],
            roles: ['enabled', 'name', 'user_count', 'created_at'],
            audit_logs: ['timestamp', 'user', 'action', 'target', 'result'],
            tag_management: ['key', 'description', 'enum_values', 'required', 'writable_roles'],
            notification_strategies: ['enabled', 'name', 'trigger_condition', 'channel_count', 'severity_levels', 'impact_levels', 'creator', 'updated_at'],
            datasources: ['name', 'type', 'status', 'url', 'created_at', 'updated_at'],
            autodiscovery: ['name', 'kind', 'status', 'schedule', 'last_run_at', 'created_at'],
            notification_channels: ['enabled', 'name', 'type', 'last_test_result', 'last_tested_at'],
            notification_history: ['timestamp', 'strategy', 'channel', 'recipient', 'status', 'content'],
        },
        // NEW DYNAMIC UI CONFIGS
        tab_configs: JSON.parse(JSON.stringify(MOCK_TAB_CONFIGS)),
        platform_settings: JSON.parse(JSON.stringify(MOCK_PLATFORM_SETTINGS)),
        preference_options: JSON.parse(JSON.stringify(MOCK_PREFERENCE_OPTIONS)),
        page_content: JSON.parse(JSON.stringify(PAGE_CONTENT)),
        command_palette_content: JSON.parse(JSON.stringify(MOCK_COMMAND_PALETTE_CONTENT)),
        execution_log_detail_content: JSON.parse(JSON.stringify(MOCK_EXECUTION_LOG_DETAIL_CONTENT)),
        import_modal_content: JSON.parse(JSON.stringify(MOCK_IMPORT_MODAL_CONTENT)),
        // AI DATA
        ai_briefing: JSON.parse(JSON.stringify(MOCK_AI_BRIEFING)),
        ai_risk_prediction: JSON.parse(JSON.stringify(MOCK_AI_RISK_PREDICTION)),
        single_incident_analysis: JSON.parse(JSON.stringify(MOCK_SINGLE_INCIDENT_ANALYSIS)),
        multi_incident_analysis: JSON.parse(JSON.stringify(MOCK_MULTI_INCIDENT_ANALYSIS)),
        alert_rule_analysis: JSON.parse(JSON.stringify(MOCK_ALERT_RULE_ANALYSIS)),
        silence_rule_analysis: JSON.parse(JSON.stringify(MOCK_SILENCE_RULE_ANALYSIS)),
        generated_playbook: JSON.parse(JSON.stringify(MOCK_GENERATED_PLAYBOOK)),
        log_analysis: JSON.parse(JSON.stringify(MOCK_LOG_ANALYSIS)),
        resource_analysis: JSON.parse(JSON.stringify(MOCK_RESOURCE_ANALYSIS)),
        capacity_suggestions: JSON.parse(JSON.stringify(MOCK_CAPACITY_SUGGESTIONS)),
        capacity_resource_analysis: JSON.parse(JSON.stringify(MOCK_CAPACITY_RESOURCE_ANALYSIS)),
        capacity_time_options: JSON.parse(JSON.stringify(MOCK_CAPACITY_TIME_OPTIONS)),
        service_health_data: JSON.parse(JSON.stringify(MOCK_SERVICE_HEALTH_DATA)),
        resource_group_status_data: JSON.parse(JSON.stringify(MOCK_RESOURCE_GROUP_STATUS_DATA)),
        analysis_overview_data: JSON.parse(JSON.stringify(MOCK_ANALYSIS_OVERVIEW_DATA)),
        analysis_incident_report: JSON.parse(JSON.stringify(MOCK_INCIDENT_ANALYSIS_REPORT)),
        analysis_multi_incident_report: JSON.parse(JSON.stringify(MOCK_MULTI_INCIDENT_ANALYSIS_REPORT)),
        analysis_resource_report: JSON.parse(JSON.stringify(MOCK_RESOURCE_ANALYSIS_REPORT_V2)),
        analysis_batch_resource_report: JSON.parse(JSON.stringify(MOCK_BATCH_RESOURCE_ANALYSIS_REPORT)),
        analysis_log_report: JSON.parse(JSON.stringify(MOCK_LOG_ANALYSIS_REPORT_V2)),
        analysis_capacity_prediction: JSON.parse(JSON.stringify(MOCK_CAPACITY_PREDICTION_REPORT)),
        analysis_incident_prediction: JSON.parse(JSON.stringify(MOCK_INCIDENT_PREDICTION_REPORT)),
        analysis_anomaly_detection: JSON.parse(JSON.stringify(MOCK_ANOMALY_DETECTION_REPORT)),
        backtesting_results: JSON.parse(JSON.stringify(MOCK_BACKTESTING_RESULTS)),
        // Consolidated UI Options
        all_options: JSON.parse(JSON.stringify(MOCK_ALL_OPTIONS)),
        // New Datasource/Discovery data
        datasources: JSON.parse(JSON.stringify(MOCK_DATASOURCES)),
        datasource_connection_tests: JSON.parse(JSON.stringify(MOCK_DATASOURCE_CONNECTION_TESTS)),
        discovery_jobs: JSON.parse(JSON.stringify(MOCK_DISCOVERY_JOBS)),
        discovered_resources: JSON.parse(JSON.stringify(MOCK_DISCOVERED_RESOURCES)),
        tag_bulk_import_jobs: JSON.parse(JSON.stringify(MOCK_TAG_BULK_IMPORT_JOBS)),
        user_preference_export_jobs: JSON.parse(JSON.stringify(MOCK_USER_PREFERENCE_EXPORT_JOBS)),
    };
}

// Create and export the database as a constant to ensure it's initialized on module load.
export const DB = createInitialDB();
