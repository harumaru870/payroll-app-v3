export function safeParseDate(dateInput: any): Date {
    if (!dateInput) return new Date();

    const date = new Date(dateInput);

    if (isNaN(date.getTime())) {
        // Handle SQLite CURRENT_TIMESTAMP format "YYYY-MM-DD HH:MM:SS"
        if (typeof dateInput === 'string') {
            const isoStr = dateInput.replace(' ', 'T');
            const isoDate = new Date(isoStr);
            if (!isNaN(isoDate.getTime())) return isoDate;
        }
        return new Date(); // Fallback to now
    }

    return date;
}

export function formatDate(dateInput: any): string {
    return safeParseDate(dateInput).toLocaleDateString('ja-JP');
}

/**
 * 日本標準時 (JST) での「現在時刻」を取得する
 * サーバー(UTC)上でも正しい日本時間を扱うためのユーティリティ
 */
export function getJSTNow(): Date {
    const now = new Date();
    // UTC時間に9時間を足したDateオブジェクトを返す（簡易的なJST化）
    const jstOffset = 9 * 60 * 60 * 1000;
    return new Date(now.getTime() + jstOffset);
}
