/**
 * 將相對時間字符串（如 "30s ago", "5m ago"）轉換為中文格式
 * @param relativeTime - 相對時間字符串（英文格式）
 * @returns 中文格式的相對時間字符串
 */
export function formatRelativeTime(relativeTime: string | undefined | null): string {
    if (!relativeTime) return '';

    // 匹配 "數字 + 單位 + ago" 格式
    const match = relativeTime.match(/^(\d+)([smhd])\s*ago$/i);
    if (!match) return relativeTime;

    const [, value, unit] = match;
    const num = parseInt(value, 10);

    const unitMap: Record<string, string> = {
        's': '秒',
        'm': '分鐘',
        'h': '小時',
        'd': '天'
    };

    const unitName = unitMap[unit.toLowerCase()] || unit;
    return `${num} ${unitName}前`;
}

/**
 * 將毫秒轉換為人類可讀的時間格式
 * @param ms - 毫秒數
 * @returns 格式化後的時間字符串（如 "5 秒"、"2 分鐘"、"1 小時"）
 */
export function formatDuration(ms: number | undefined | null): string {
    if (ms === undefined || ms === null) return 'N/A';

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days} 天`;
    } else if (hours > 0) {
        return `${hours} 小時`;
    } else if (minutes > 0) {
        return `${minutes} 分鐘`;
    } else if (seconds > 0) {
        return `${seconds} 秒`;
    } else {
        return `${ms} 毫秒`;
    }
}

/**
 * 格式化時間戳為本地化日期時間字符串
 * @param timestamp - ISO 格式的時間戳或日期字符串
 * @param options - 格式化選項
 * @returns 格式化後的日期時間字符串
 */
export function formatTimestamp(
    timestamp: string | undefined | null,
    options: {
        showTime?: boolean;
        showSeconds?: boolean;
    } = {}
): string {
    if (!timestamp) return '';

    const { showTime = true, showSeconds = true } = options;

    try {
        const date = new Date(timestamp);

        if (isNaN(date.getTime())) {
            return timestamp;
        }

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        let result = `${year}-${month}-${day}`;

        if (showTime) {
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');

            result += ` ${hours}:${minutes}`;

            if (showSeconds) {
                const seconds = String(date.getSeconds()).padStart(2, '0');
                result += `:${seconds}`;
            }
        }

        return result;
    } catch (error) {
        return timestamp;
    }
}