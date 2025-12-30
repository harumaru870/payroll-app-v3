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

/**
 * 入力された日付をJSTの「日付」として解釈し、正規化する。
 * UTCの 2024-01-01 00:00:00 (JST 09:00) のような形、
 * あるいは JSTでの日付が変わらないような安全な時刻（正午など）に変換して返す。
 * ここではシンプルに「JSTでの年月日」を取得し、その年月日の 00:00:00 UTC を作成して返す。
 */
export function toJSTDate(dateInput: any): Date {
    // 1. まずDateオブジェクト化
    const d = safeParseDate(dateInput);

    // 2. これが "JSTの0時" (つまりUTCの前日15時) だったり、
    //    "UTCの0時" (つまりJSTの9時) だったりする。
    //    もしクライアント(JST)から "2025-01-01 00:00:00" が送られてくると、
    //    ISO文字列は "2024-12-31T15:00:00.000Z" になる。
    //    サーバー(UTC)でそのまま getDay() すると 31日になってしまう。

    // なので、9時間足して「JSTでの時刻」に戻してから年月日を取り出す。
    const jstOffset = 9 * 60 * 60 * 1000;
    const jstTime = new Date(d.getTime() + jstOffset);

    const year = jstTime.getUTCFullYear();
    const month = jstTime.getUTCMonth();
    const day = jstTime.getUTCDate();

    // 3. その年月日の UTC 00:00:00 を返す (これをDBに保存すれば日付はズレない)
    return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
}

/**
 * 年、月、締め日に基づいて給与計算期間の開始日と終了日を算出する
 * @param year 対象年
 * @param month 対象月 (1-12)
 * @param closingDate 締め日 (1-31, 31は末日)
 */
export function getPayrollPeriod(year: number, month: number, closingDate: number) {
    let start: Date;
    let end: Date;

    if (closingDate >= 31) {
        // 末日締めの場合：該当月の1日〜末日
        start = new Date(year, month - 1, 1, 0, 0, 0, 0);
        end = new Date(year, month, 0, 23, 59, 59, 999);
    } else {
        // 例：締め日が20日の場合、前月21日〜当月20日
        start = new Date(year, month - 2, closingDate + 1, 0, 0, 0, 0);
        end = new Date(year, month - 1, closingDate, 23, 59, 59, 999);
    }

    return { start, end };
}

/**
 * 現在の締め日に基づいて、今現在含まれている給与計算期間（およびその「〇月分」という指定）を返す
 */
export function getCurrentPayrollPeriod(closingDate: number) {
    const now = getJSTNow();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1-12
    const day = now.getDate();

    if (closingDate >= 31) {
        return { ...getPayrollPeriod(year, month, closingDate), year, month };
    } else {
        if (day > closingDate) {
            // 今日の日付が締め日を超えている場合、翌月分の期間にいる
            // 例：12/21 は 1/20締め（1月分）の期間
            const nextMonthDate = new Date(year, month, 1);
            const targetYear = nextMonthDate.getFullYear();
            const targetMonth = nextMonthDate.getMonth() + 1;
            return { ...getPayrollPeriod(targetYear, targetMonth, closingDate), year: targetYear, month: targetMonth };
        } else {
            // 締め日以前の場合、当月分の期間
            return { ...getPayrollPeriod(year, month, closingDate), year, month };
        }
    }
}

/**
 * 特定の日付が属する「給与計算月」の情報を返す
 * 例：締め日が20日で、12/25 の場合 -> { year: 2026, month: 1 } (1月分)
 */
export function getPayrollInfoDate(dateInput: any, closingDate: number) {
    const date = safeParseDate(dateInput);
    const day = date.getDate();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    if (closingDate >= 31) {
        return { year, month };
    } else {
        if (day > closingDate) {
            const nextMonth = new Date(year, month, 1);
            return { year: nextMonth.getFullYear(), month: nextMonth.getMonth() + 1 };
        } else {
            return { year, month };
        }
    }
}
