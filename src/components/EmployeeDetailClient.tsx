'use client';

import { useState } from 'react';
import { History, TrendingUp, Plus } from 'lucide-react';
import WageModal from '@/components/WageModal';
import { safeParseDate, formatDate } from '@/utils/date';

interface EmployeeDetailClientProps {
    employee: any;
}

export default function EmployeeDetailClient({ employee }: EmployeeDetailClientProps) {
    const [isWageModalOpen, setIsWageModalOpen] = useState(false);
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalize 'now' to start of day for comparison

    // 現在有効な時給のインデックスを探す（適用開始日が「今日以前」の中で最も新しいもの）
    // Sort wages by effectiveFrom in descending order to find the most recent past/current wage
    const sortedWages = [...employee.wages].sort((a: any, b: any) => safeParseDate(b.effectiveFrom).getTime() - safeParseDate(a.effectiveFrom).getTime());

    let activeWage = null;
    for (const wage of sortedWages) {
        const effectiveFromDate = safeParseDate(wage.effectiveFrom);
        effectiveFromDate.setHours(0, 0, 0, 0);
        if (effectiveFromDate <= now) {
            activeWage = wage;
            break;
        }
    }

    const currentWage = activeWage;

    return (
        <>
            <div className="p-8 border-b border-card-border flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <History className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                    <span>時給・交通費履歴</span>
                </h2>
                <button
                    onClick={() => setIsWageModalOpen(true)}
                    className="flex items-center gap-1 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors font-bold text-sm"
                >
                    <Plus className="w-4 h-4" />
                    <span>昇給・変更</span>
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-background">
                            <th className="px-8 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">適用開始日</th>
                            <th className="px-8 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">基本時給</th>
                            <th className="px-8 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">交通費</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-card-border">
                        {employee.wages.map((wage: any, i: number) => {
                            const effectiveFromDate = safeParseDate(wage.effectiveFrom);
                            effectiveFromDate.setHours(0, 0, 0, 0);
                            const isFuture = effectiveFromDate > now;
                            const isActive = activeWage && wage.id === activeWage.id;

                            return (
                                <tr key={wage.id} className={isActive ? 'bg-indigo-50/30' : ''}>
                                    <td className="px-8 py-5">
                                        <div className="font-bold text-gray-900">
                                            {formatDate(wage.effectiveFrom)}
                                            {isActive && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700">現在</span>}
                                            {isFuture && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">予定</span>}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-1 font-extrabold text-foreground">
                                            <span className="text-lg">{wage.hourlyWage.toLocaleString()}</span>
                                            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">円</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-1 font-bold text-gray-600 dark:text-gray-400">
                                            <span>{wage.transportationFee.toLocaleString()}</span>
                                            <span className="text-xs font-medium">円</span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {isWageModalOpen && (
                <WageModal
                    employeeId={employee.id}
                    currentWage={currentWage?.hourlyWage || 0}
                    currentFee={currentWage?.transportationFee || 0}
                    onClose={() => setIsWageModalOpen(false)}
                />
            )}
        </>
    );
}
