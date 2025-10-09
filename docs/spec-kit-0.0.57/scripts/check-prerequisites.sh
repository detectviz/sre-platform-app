#!/usr/bin/env bash
# =============================================================================
# Spec Kit - 先決條件檢查腳本 (check-prerequisites.sh)
# =============================================================================
# 此腳本為 Spec-Driven Development 工作流程提供統一的先決條件檢查
# 它取代了以前分散在多個腳本中的功能，提供集中式的狀態驗證
# =============================================================================

# =============================================================================
# 腳本說明和使用方式
# =============================================================================
#
# 使用方式：./check-prerequisites.sh [選項]
#
# 選項說明：
#   --json              以 JSON 格式輸出（適用於程式化呼叫）
#   --require-tasks     要求 tasks.md 必須存在（用於實作階段）
#   --include-tasks     在 AVAILABLE_DOCS 清單中包含 tasks.md
#   --paths-only        僅輸出路徑變數（無驗證，僅顯示路徑）
#   --help, -h          顯示說明訊息
#
# 輸出格式：
#   JSON 模式：{"FEATURE_DIR":"...", "AVAILABLE_DOCS":["..."]}
#   文字模式：FEATURE_DIR:... \n AVAILABLE_DOCS: \n ✓/✗ file.md
#   僅路徑：REPO_ROOT: ... \n BRANCH: ... \n FEATURE_DIR: ... 等

# =============================================================================
# 腳本初始化
# =============================================================================

# 遇到錯誤立即退出，提高腳本可靠性
set -e

# =============================================================================
# 參數解析區塊
# =============================================================================

# 初始化旗標變數
JSON_MODE=false      # 是否以 JSON 格式輸出
REQUIRE_TASKS=false  # 是否要求 tasks.md 必須存在
INCLUDE_TASKS=false  # 是否在文檔清單中包含 tasks.md
PATHS_ONLY=false     # 是否僅輸出路徑（跳過驗證）

# 循環處理所有命令列參數
for arg in "$@"; do
    case "$arg" in
        --json)
            # 啟用 JSON 輸出模式，用於其他工具整合
            JSON_MODE=true
            ;;
        --require-tasks)
            # 要求 tasks.md 必須存在（用於實作階段的檢查）
            REQUIRE_TASKS=true
            ;;
        --include-tasks)
            # 在可用文檔清單中包含 tasks.md
            INCLUDE_TASKS=true
            ;;
        --paths-only)
            # 僅輸出路徑變數，跳過所有先決條件驗證
            PATHS_ONLY=true
            ;;
        --help|-h)
            # 顯示詳細幫助資訊並退出
            cat << 'EOF'
使用方式：check-prerequisites.sh [選項]

Spec-Driven Development 工作流程的整合式先決條件檢查。

選項說明：
  --json              以 JSON 格式輸出（適用於腳本整合）
  --require-tasks     要求 tasks.md 必須存在（用於實作階段）
  --include-tasks     在 AVAILABLE_DOCS 清單中包含 tasks.md
  --paths-only        僅輸出路徑變數（無驗證）
  --help, -h          顯示此說明訊息

範例：
  # 檢查任務先決條件（需要 plan.md）
  ./check-prerequisites.sh --json

  # 檢查實作先決條件（需要 plan.md + tasks.md）
  ./check-prerequisites.sh --json --require-tasks --include-tasks

  # 僅取得功能路徑（無驗證）
  ./check-prerequisites.sh --paths-only

EOF
            exit 0
            ;;
        *)
            # 處理未知參數，顯示錯誤並退出
            echo "錯誤：未知選項 '$arg'。使用 --help 取得使用說明。" >&2
            exit 1
            ;;
    esac
done

# =============================================================================
# 環境初始化區塊
# =============================================================================

# 載入共用的工具函數和變數定義
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# =============================================================================
# 路徑解析和分支驗證區塊
# =============================================================================

# 取得功能相關的所有路徑和環境變數
# 這會設定 FEATURE_DIR, IMPL_PLAN, TASKS 等變數
eval $(get_feature_paths)

# 檢查我們是否在正確的功能分支上
# 這確保我們不會意外在錯誤的分支上操作
check_feature_branch "$CURRENT_BRANCH" "$HAS_GIT" || exit 1

# =============================================================================
# 僅路徑模式處理區塊
# =============================================================================

# 如果是僅路徑模式，輸出路徑資訊並退出（支援 JSON + paths-only 組合）
if $PATHS_ONLY; then
    if $JSON_MODE; then
        # 最小的 JSON 路徑載荷（不執行驗證）
        printf '{"REPO_ROOT":"%s","BRANCH":"%s","FEATURE_DIR":"%s","FEATURE_SPEC":"%s","IMPL_PLAN":"%s","TASKS":"%s"}\n' \
            "$REPO_ROOT" "$CURRENT_BRANCH" "$FEATURE_DIR" "$FEATURE_SPEC" "$IMPL_PLAN" "$TASKS"
    else
        # 人類可讀的格式輸出路徑資訊
        echo "儲存庫根目錄：$REPO_ROOT"
        echo "目前分支：$CURRENT_BRANCH"
        echo "功能目錄：$FEATURE_DIR"
        echo "功能規格文件：$FEATURE_SPEC"
        echo "實作計劃文件：$IMPL_PLAN"
        echo "任務清單文件：$TASKS"
    fi
    exit 0
fi

# =============================================================================
# 先決條件驗證區塊
# =============================================================================

# 驗證必要的功能目錄是否存在
if [[ ! -d "$FEATURE_DIR" ]]; then
    echo "錯誤：找不到功能目錄：$FEATURE_DIR" >&2
    echo "請先執行 /speckit.specify 來建立功能結構。" >&2
    exit 1
fi

# 驗證必要的實作計劃文件是否存在
if [[ ! -f "$IMPL_PLAN" ]]; then
    echo "錯誤：在 $FEATURE_DIR 中找不到 plan.md" >&2
    echo "請先執行 /speckit.plan 來建立實作計劃。" >&2
    exit 1
fi

# 如果需要，檢查任務清單文件是否存在
if $REQUIRE_TASKS && [[ ! -f "$TASKS" ]]; then
    echo "錯誤：在 $FEATURE_DIR 中找不到 tasks.md" >&2
    echo "請先執行 /speckit.tasks 來建立任務清單。" >&2
    exit 1
fi

# =============================================================================
# 可用文檔清單建置區塊
# =============================================================================

# 初始化可用文檔陣列
docs=()

# 總是檢查這些可選文檔
# research.md - 研究文件
[[ -f "$RESEARCH" ]] && docs+=("research.md")

# data-model.md - 資料模型文件
[[ -f "$DATA_MODEL" ]] && docs+=("data-model.md")

# 檢查契約目錄（僅在目錄存在且有檔案時）
if [[ -d "$CONTRACTS_DIR" ]] && [[ -n "$(ls -A "$CONTRACTS_DIR" 2>/dev/null)" ]]; then
    docs+=("contracts/")
fi

# quickstart.md - 快速入門文件
[[ -f "$QUICKSTART" ]] && docs+=("quickstart.md")

# 如果請求且存在，包含任務清單文件
if $INCLUDE_TASKS && [[ -f "$TASKS" ]]; then
    docs+=("tasks.md")
fi

# =============================================================================
# 結果輸出區塊
# =============================================================================

# 根據輸出模式顯示結果
if $JSON_MODE; then
    # 建置文檔的 JSON 陣列
    if [[ ${#docs[@]} -eq 0 ]]; then
        json_docs="[]"  # 空陣列
    else
        # 將文檔名稱格式化為 JSON 字串陣列
        json_docs=$(printf '"%s",' "${docs[@]}")
        json_docs="[${json_docs%,}]"  # 移除末尾逗號並加上括號
    fi

    # 輸出完整的 JSON 結果
    printf '{"FEATURE_DIR":"%s","AVAILABLE_DOCS":%s}\n' "$FEATURE_DIR" "$json_docs"
else
    # 文字模式輸出
    echo "功能目錄：$FEATURE_DIR"
    echo "可用文檔："

    # 顯示每個潛在文檔的狀態（✓ 表示存在，✗ 表示不存在）
    check_file "$RESEARCH" "research.md"
    check_file "$DATA_MODEL" "data-model.md"
    check_dir "$CONTRACTS_DIR" "contracts/"
    check_file "$QUICKSTART" "quickstart.md"

    # 如果請求包含任務文件，也檢查它
    if $INCLUDE_TASKS; then
        check_file "$TASKS" "tasks.md"
    fi
fi