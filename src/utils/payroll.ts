import { differenceInMinutes, isBefore, isAfter, startOfDay, parse } from 'date-fns';

export type ShiftWithWage = {
    id?: number;
    employeeId: string;
    date: Date;
    startTime: string; // HH:mm
    endTime: string;   // HH:mm
    breakMinutes: number;
    note?: string | null;
    hourlyWage: number;
    transportationFee: number;
};

export type CalculatedShift = ShiftWithWage & {
    totalMinutes: number;
    normalMinutes: number;
    nightMinutes: number;
    salary: number;
};

// 深夜時間帯 (22:00 - 05:00)
const NIGHT_START_TIME = 22 * 60; // 1320 min
const NIGHT_END_TIME = 5 * 60;    // 300 min

export function calculateShiftPay(shift: ShiftWithWage): CalculatedShift {
    const [startH, startM] = shift.startTime.split(':').map(Number);
    const [endH, endM] = shift.endTime.split(':').map(Number);

    let startMin = startH * 60 + startM;
    let endMin = endH * 60 + endM;

    // 日またぎ対応 (0時以降)
    if (endMin <= startMin) {
        endMin += 24 * 60;
    }

    let totalGrossMinutes = endMin - startMin;
    let nightMinutes = 0;

    // 1分ごとに深夜時間か判定
    for (let m = startMin; m < endMin; m++) {
        const currentDayMin = m % (24 * 60);
        if (currentDayMin >= NIGHT_START_TIME || currentDayMin < NIGHT_END_TIME) {
            nightMinutes++;
        }
    }

    // 休憩時間を差し引く（まず通常時間から引き、足りなければ深夜から引く）
    const netTotalMinutes = Math.max(0, totalGrossMinutes - shift.breakMinutes);

    // 休憩時間の案分（単純化のため、全時間に対する深夜の割合で引くか、
    // 実運用に合わせて「通常時間から優先的に引く」などのルールが必要だが、
    // ここでは深夜時間の割合に応じて引く形にする）
    const nightRatio = nightMinutes / totalGrossMinutes;
    const netNightMinutes = Math.max(0, nightMinutes - (shift.breakMinutes * nightRatio));
    const netNormalMinutes = netTotalMinutes - netNightMinutes;

    const salary = Math.floor(
        (netNormalMinutes / 60) * shift.hourlyWage +
        (netNightMinutes / 60) * shift.hourlyWage * 1.25
    );

    return {
        ...shift,
        totalMinutes: netTotalMinutes,
        normalMinutes: netNormalMinutes,
        nightMinutes: netNightMinutes,
        salary,
    };
}

/**
 * 特定の日付において有効な時給を履歴から検索する
 */
export function getEffectiveWage(wages: any[], date: Date) {
    const targetDate = startOfDay(date);

    // 適用開始日が現在日以前のもののうち、最も新しいものを探す
    const sortedWages = [...wages].sort((a, b) =>
        new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime()
    );

    const effective = sortedWages.find(w =>
        !isAfter(startOfDay(new Date(w.effectiveFrom)), targetDate)
    );

    // もし該当がなければ、一番古いものを返す（初期設定忘れ対策）
    return effective || sortedWages[sortedWages.length - 1];
}
