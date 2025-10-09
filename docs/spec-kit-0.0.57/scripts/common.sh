#!/usr/bin/env bash
# =============================================================================
# Spec Kit - 共用工具函數 (common.sh)
# =============================================================================
# 此文件包含所有 Spec Kit 腳本使用的共用函數和變數定義
# 這些函數處理儲存庫檢測、路徑解析和狀態檢查等常見操作
# =============================================================================

# =============================================================================
# 儲存庫根目錄解析函數
# =============================================================================

# 取得儲存庫根目錄，包含非 git 儲存庫的後備方案
# 優先使用 git 命令，如果不可用則基於腳本位置推斷
get_repo_root() {
    # 嘗試使用 git 命令取得儲存庫根目錄
    if git rev-parse --show-toplevel >/dev/null 2>&1; then
        git rev-parse --show-toplevel
    else
        # 對於非 git 儲存庫，後備到腳本位置
        # 假設腳本在 scripts/ 子目錄中，因此向上三級到達根目錄
        local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
        (cd "$script_dir/../../.." && pwd)
    fi
}

# =============================================================================
# 分支和環境檢測函數
# =============================================================================

# 取得目前分支名稱，包含多種後備方案
# 優先順序：環境變數 -> git 分支 -> 最新功能目錄 -> main
get_current_branch() {
    # 首先檢查 SPECIFY_FEATURE 環境變數是否已設定
    # 這允許腳本直接指定要處理的功能
    if [[ -n "${SPECIFY_FEATURE:-}" ]]; then
        echo "$SPECIFY_FEATURE"
        return
    fi

    # 然後檢查 git（如果可用且在儲存庫中）
    if git rev-parse --abbrev-ref HEAD >/dev/null 2>&1; then
        git rev-parse --abbrev-ref HEAD
        return
    fi

    # 對於非 git 儲存庫，嘗試找到最新的功能目錄
    # 這是為了在沒有 git 的情況下也能運作
    local repo_root=$(get_repo_root)
    local specs_dir="$repo_root/specs"

    if [[ -d "$specs_dir" ]]; then
        local latest_feature=""
        local highest=0

        # 遍歷所有功能目錄，尋找編號最高的
        for dir in "$specs_dir"/*; do
            if [[ -d "$dir" ]]; then
                local dirname=$(basename "$dir")
                # 匹配形如 "001-feature-name" 的目錄名稱
                if [[ "$dirname" =~ ^([0-9]{3})- ]]; then
                    local number=${BASH_REMATCH[1]}
                    number=$((10#$number))  # 處理前導零
                    if [[ "$number" -gt "$highest" ]]; then
                        highest=$number
                        latest_feature=$dirname
                    fi
                fi
            fi
        done

        if [[ -n "$latest_feature" ]]; then
            echo "$latest_feature"
            return
        fi
    fi

    # 最終後備方案：假設在 main 分支上
    echo "main"
}

# =============================================================================
# 狀態檢查函數
# =============================================================================

# 檢查是否有 git 可用且在 git 儲存庫中
# 返回值：0 表示有 git，1 表示沒有
has_git() {
    git rev-parse --show-toplevel >/dev/null 2>&1
}

# =============================================================================
# 分支驗證函數
# =============================================================================

# 檢查目前是否在有效的功能分支上
# 功能分支應該命名為 "001-feature-name" 的格式
check_feature_branch() {
    local branch="$1"          # 分支名稱
    local has_git_repo="$2"    # 是否為 git 儲存庫

    # 對於非 git 儲存庫，我們無法強制分支命名但仍提供輸出
    if [[ "$has_git_repo" != "true" ]]; then
        echo "[specify] 警告：未偵測到 Git 儲存庫；跳過分支驗證" >&2
        return 0  # 不視為錯誤，允許繼續
    fi

    # 檢查分支名稱是否符合功能分支格式
    # 必須以三位數字開頭，後跟連字號
    if [[ ! "$branch" =~ ^[0-9]{3}- ]]; then
        echo "錯誤：不在功能分支上。目前分支：$branch" >&2
        echo "功能分支應該命名為：001-feature-name" >&2
        return 1  # 錯誤：不符合規範
    fi

    return 0  # 成功：分支名稱正確
}

# =============================================================================
# 路徑解析函數
# =============================================================================

# 根據儲存庫根目錄和分支名稱構造功能目錄路徑
# 參數：$1=儲存庫根目錄, $2=分支名稱
get_feature_dir() {
    echo "$1/specs/$2"
}

# =============================================================================
# 功能路徑導出函數
# =============================================================================

# 取得並導出所有功能相關的路徑變數
# 這個函數會輸出 shell 變數定義，可以用 eval 來設定
get_feature_paths() {
    local repo_root=$(get_repo_root)      # 儲存庫根目錄
    local current_branch=$(get_current_branch)  # 目前分支
    local has_git_repo="false"            # 預設為非 git 儲存庫

    # 檢查是否實際為 git 儲存庫
    if has_git; then
        has_git_repo="true"
    fi

    # 構造功能目錄路徑
    local feature_dir=$(get_feature_dir "$repo_root" "$current_branch")

    # 使用 here document 輸出所有變數定義
    # 這樣呼叫者可以通過 eval 來設定這些變數
    cat <<EOF
REPO_ROOT='$repo_root'           # 儲存庫根目錄路徑
CURRENT_BRANCH='$current_branch' # 目前分支名稱
HAS_GIT='$has_git_repo'          # 是否為 Git 儲存庫 (true/false)
FEATURE_DIR='$feature_dir'       # 功能規格目錄路徑
FEATURE_SPEC='$feature_dir/spec.md'         # 功能規格文件
IMPL_PLAN='$feature_dir/plan.md'            # 實作計劃文件
TASKS='$feature_dir/tasks.md'               # 任務清單文件
RESEARCH='$feature_dir/research.md'         # 研究文件
DATA_MODEL='$feature_dir/data-model.md'     # 資料模型文件
QUICKSTART='$feature_dir/quickstart.md'     # 快速入門文件
CONTRACTS_DIR='$feature_dir/contracts'      # API 契約目錄
EOF
}

# =============================================================================
# 狀態檢查助手函數
# =============================================================================

# 檢查文件是否存在，如果存在顯示 ✓，否則顯示 ✗
# 參數：$1=文件路徑, $2=顯示名稱
check_file() {
    [[ -f "$1" ]] && echo "  ✓ $2" || echo "  ✗ $2"
}

# 檢查目錄是否存在且不為空，如果是顯示 ✓，否則顯示 ✗
# 參數：$1=目錄路徑, $2=顯示名稱
check_dir() {
    [[ -d "$1" && -n $(ls -A "$1" 2>/dev/null) ]] && echo "  ✓ $2" || echo "  ✗ $2"
}
