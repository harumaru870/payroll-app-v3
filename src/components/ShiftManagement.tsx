'use client';

import { useState, useEffect, useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, startOfMonth, endOfMonth, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Plus, Clock, Save, Trash2, User as UserIcon, AlertCircle, Loader2, FileText } from 'lucide-react';
import { upsertShift, deleteShift, getShifts, getSystemSettings } from '@/app/actions';
import { calculateShiftPay, getEffectiveWage, type CalculatedShift } from '@/utils/payroll';
import dynamic from 'next/dynamic';

const PayrollPDFButton = dynamic(() => import('./PayrollPDFButton'), { ssr: false });

interface ShiftManagementProps {
    employees: any[];
}

export default function ShiftManagement({ employees }: ShiftManagementProps) {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(employees[0]?.id || '');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [shifts, setShifts] = useState<any[]>([]);
    const [isPending, setIsPending] = useState(false);
    const [isLoadingShifts, setIsLoadingShifts] = useState(false);
    const [systemSettings, setSystemSettings] = useState<any>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        getSystemSettings().then(setSystemSettings);
    }, []);

    const [formData, setFormData] = useState({
        startTime: '09:00',
        endTime: '18:00',
        breakMinutes: 60,
        note: ''
    });

    const selectedEmployee = useMemo(() =>
        employees.find(e => e.id === selectedEmployeeId),
        [selectedEmployeeId, employees]
    );

    const fetchShifts = async () => {
        if (!selectedEmployeeId) return;
        setIsLoadingShifts(true);
        try {
            const data = await getShifts(selectedEmployeeId, selectedDate);
            setShifts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingShifts(false);
        }
    };

    useEffect(() => {
        fetchShifts();
    }, [selectedEmployeeId, selectedDate.getMonth()]);

    const currentDayShift = useMemo(() =>
        shifts.find(s => isSameDay(new Date(s.date), selectedDate)),
        [shifts, selectedDate]
    );

    useEffect(() => {
        if (currentDayShift) {
            setFormData({
                startTime: currentDayShift.startTime,
                endTime: currentDayShift.endTime,
                breakMinutes: currentDayShift.breakMinutes,
                note: currentDayShift.note || ''
            });
        } else {
            setFormData({
                startTime: '09:00',
                endTime: '18:00',
                breakMinutes: 60,
                note: ''
            });
        }
    }, [currentDayShift, selectedDate]);

    const calculatedInfo = useMemo(() => {
        if (!selectedEmployee) return null;
        const wageInfo = getEffectiveWage(selectedEmployee.wages, selectedDate);
        return calculateShiftPay({
            employeeId: selectedEmployeeId,
            date: selectedDate,
            startTime: formData.startTime,
            endTime: formData.endTime,
            breakMinutes: formData.breakMinutes,
            hourlyWage: wageInfo.hourlyWage,
            transportationFee: wageInfo.transportationFee
        });
    }, [selectedEmployee, selectedDate, formData]);

    const handleSave = async () => {
        setIsPending(true);
        try {
            await upsertShift({
                id: currentDayShift?.id,
                employeeId: selectedEmployeeId,
                date: selectedDate,
                startTime: formData.startTime,
                endTime: formData.endTime,
                breakMinutes: formData.breakMinutes,
                note: formData.note
            });
            await fetchShifts();
        } catch (error) {
            alert('シフトの保存に失敗しました');
        } finally {
            setIsPending(false);
        }
    };

    const handleDelete = async () => {
        if (!currentDayShift?.id) return;
        if (!confirm('この日のシフトを削除しますか？')) return;
        setIsPending(true);
        try {
            await deleteShift(currentDayShift.id, selectedEmployeeId);
            await fetchShifts();
        } catch (error) {
            alert('削除に失敗しました');
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sidebar: List & Selection */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl space-y-4">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider block">従業員を選択</label>
                    <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                        {employees.map(emp => (
                            <button
                                key={emp.id}
                                onClick={() => setSelectedEmployeeId(emp.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all border ${selectedEmployeeId === emp.id
                                    ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-100'
                                    : 'bg-white border-gray-100 hover:border-indigo-300 text-gray-700'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${selectedEmployeeId === emp.id ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'
                                    }`}>
                                    {emp.name.charAt(0)}
                                </div>
                                <div className="text-left">
                                    <div className={`font-bold text-sm ${selectedEmployeeId === emp.id ? 'text-white' : 'text-gray-900'}`}>{emp.name}</div>
                                    <div className={`text-[10px] ${selectedEmployeeId === emp.id ? 'text-indigo-100' : 'text-gray-400'}`}>
                                        時給: ¥{getEffectiveWage(emp.wages, selectedDate).hourlyWage.toLocaleString()}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl flex flex-col items-center">
                    <Calendar
                        onChange={(d) => setSelectedDate(d as Date)}
                        value={selectedDate}
                        locale="ja-JP"
                        className="border-none w-full text-sm"
                        tileClassName={({ date }) => {
                            const hasShift = shifts.some(s => isSameDay(new Date(s.date), date));
                            return hasShift ? 'bg-indigo-50 text-indigo-700 font-bold rounded-lg mb-1' : 'mb-1';
                        }}
                    />
                </div>
            </div>

            {/* Main Column */}
            <div className="lg:col-span-8 space-y-8">
                {/* Input Card */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${currentDayShift ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-bold text-gray-900">{format(selectedDate, 'yyyy年 MM月 dd日 (E)', { locale: ja })}</h2>
                                    {currentDayShift ? (
                                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-lg uppercase tracking-wider">登録済み</span>
                                    ) : (
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-black rounded-lg uppercase tracking-wider">新規入力</span>
                                    )}
                                </div>
                                <p className="text-gray-500 text-sm">{selectedEmployee?.name} さんの勤怠</p>
                            </div>
                        </div>
                        {currentDayShift && (
                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>シフトを削除</span>
                            </button>
                        )}
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Form */}
                        <div className={`space-y-6 p-6 rounded-3xl transition-colors ${currentDayShift ? 'bg-indigo-50/20 border border-indigo-100/50' : 'bg-white'}`}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">開始時間</label>
                                    <input
                                        type="time"
                                        className="w-full p-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-lg shadow-sm"
                                        value={formData.startTime}
                                        onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">終了時間</label>
                                    <input
                                        type="time"
                                        className="w-full p-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-lg shadow-sm"
                                        value={formData.endTime}
                                        onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">休憩時間 (分)</label>
                                <div className="flex items-center gap-4">
                                    {[0, 30, 45, 60, 90].map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setFormData({ ...formData, breakMinutes: m })}
                                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${formData.breakMinutes === m
                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                                : 'bg-white border-gray-100 text-gray-500 hover:border-indigo-300'
                                                }`}
                                        >
                                            {m}分
                                        </button>
                                    ))}
                                    <input
                                        type="number"
                                        className="w-20 p-2 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-center font-bold text-sm shadow-sm"
                                        value={formData.breakMinutes}
                                        onChange={e => setFormData({ ...formData, breakMinutes: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">備考</label>
                                <textarea
                                    className="w-full p-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px] text-sm shadow-sm"
                                    placeholder="メモなどあれば..."
                                    value={formData.note}
                                    onChange={e => setFormData({ ...formData, note: e.target.value })}
                                />
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={isPending}
                                className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl disabled:opacity-50 transition-all shadow-xl font-bold text-lg ${currentDayShift
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
                                    }`}
                            >
                                {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                    <>
                                        <Save className="w-6 h-6" />
                                        <span>{currentDayShift ? 'シフト内容を更新' : 'この内容で登録'}</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Preview / Calculation */}
                        <div className="space-y-6">
                            <div className={`p-6 rounded-3xl border transition-colors ${currentDayShift ? 'bg-emerald-50/50 border-emerald-100' : 'bg-indigo-50/50 border-indigo-100'} space-y-6`}>
                                <div className="flex items-center justify-between">
                                    <h3 className={`text-sm font-bold flex items-center gap-2 ${currentDayShift ? 'text-emerald-700' : 'text-indigo-700'}`}>
                                        <Clock className="w-4 h-4" />
                                        概算給与プレビュー
                                    </h3>
                                    {currentDayShift && (
                                        <span className="text-[10px] font-bold text-emerald-600 bg-white px-2 py-0.5 rounded-full border border-emerald-100">保存済み</span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-2xl border border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">基本勤務時間</p>
                                        <p className="text-xl font-black text-gray-900 mt-1">
                                            {((calculatedInfo?.normalMinutes || 0) / 60).toFixed(1)} <span className="text-xs font-bold text-gray-400">h</span>
                                        </p>
                                    </div>
                                    <div className={`p-4 rounded-2xl shadow-lg ${currentDayShift ? 'bg-emerald-600 shadow-emerald-100' : 'bg-indigo-600 shadow-indigo-100'}`}>
                                        <p className={`text-[10px] font-bold uppercase tracking-wide ${currentDayShift ? 'text-emerald-200' : 'text-indigo-200'}`}>深夜勤務 (1.25x)</p>
                                        <p className="text-xl font-black text-white mt-1">
                                            {((calculatedInfo?.nightMinutes || 0) / 60).toFixed(1)} <span className="text-xs font-bold opacity-60">h</span>
                                        </p>
                                    </div>
                                </div>

                                <div className={`space-y-3 pt-4 border-t ${currentDayShift ? 'border-emerald-100' : 'border-indigo-100'}`}>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">時給単価 (基本)</span>
                                        <span className="font-bold">¥{calculatedInfo?.hourlyWage.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">深夜単価 (1.25倍)</span>
                                        <span className={`font-bold ${currentDayShift ? 'text-emerald-600' : 'text-indigo-600'}`}>¥{(calculatedInfo!?.hourlyWage * 1.25).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">交通費 (1日)</span>
                                        <span className="font-bold">¥{calculatedInfo?.transportationFee.toLocaleString()}</span>
                                    </div>

                                    <div className="pt-4 flex items-end justify-between">
                                        <div className={`font-black text-xs uppercase tracking-widest ${currentDayShift ? 'text-emerald-700' : 'text-indigo-700'}`}>
                                            Total Salary Estimates
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className={`text-3xl font-black ${currentDayShift ? 'text-emerald-700' : 'text-indigo-700'}`}>¥{(calculatedInfo?.salary || 0).toLocaleString()}</span>
                                            <span className={`text-xs font-bold ${currentDayShift ? 'text-emerald-400' : 'text-indigo-400'}`}> + 交通費</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-[11px] text-gray-500 leading-relaxed italic">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <p>※ 深夜手当は22:00〜05:00の間に適用されます。<br />※ 終了時間が開始時間より前の場合、日またぎとして計算されます。<br />※ 休憩時間は通常勤務時間から優先的に控除されます。</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Monthly List Table */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden mt-8">
                    <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Plus className="w-6 h-6 text-indigo-500" />
                            <span>{format(selectedDate, 'yyyy年 MM月')} の出勤一覧</span>
                        </h2>
                        <div className="flex items-center gap-4">
                            {selectedEmployee && shifts.length > 0 && systemSettings && (
                                <PayrollPDFButton data={{
                                    employee: selectedEmployee,
                                    shifts: shifts,
                                    settings: systemSettings,
                                    period: {
                                        year: selectedDate.getFullYear(),
                                        month: selectedDate.getMonth() + 1
                                    }
                                }} />
                            )}
                            <div className="px-4 py-2 bg-indigo-50 rounded-xl text-indigo-700 font-bold text-sm">
                                合計: {shifts.length} 日
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">日付</th>
                                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">時間</th>
                                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">休憩</th>
                                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">勤務時間</th>
                                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">概算金額</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {shifts.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-12 text-center text-gray-400 text-sm">
                                            この月の出勤記録はありません
                                        </td>
                                    </tr>
                                ) : (
                                    shifts.map((s) => {
                                        const wageInfo = selectedEmployee ? getEffectiveWage(selectedEmployee.wages, new Date(s.date)) : { hourlyWage: 0, transportationFee: 0 };
                                        const calc = calculateShiftPay({
                                            ...s,
                                            date: new Date(s.date),
                                            hourlyWage: wageInfo.hourlyWage,
                                            transportationFee: wageInfo.transportationFee
                                        });

                                        return (
                                            <tr
                                                key={s.id}
                                                className={`hover:bg-gray-50/80 transition-colors cursor-pointer ${isSameDay(new Date(s.date), selectedDate) ? 'bg-indigo-50/30' : ''}`}
                                                onClick={() => setSelectedDate(new Date(s.date))}
                                            >
                                                <td className="px-8 py-5">
                                                    <div className={`font-bold ${isSameDay(new Date(s.date), selectedDate) ? 'text-indigo-600' : 'text-gray-900'}`}>
                                                        {format(new Date(s.date), 'dd日 (E)', { locale: ja })}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="text-sm font-medium text-gray-600">
                                                        {s.startTime} 〜 {s.endTime}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-sm text-gray-400">{s.breakMinutes}分</td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-sm font-bold text-gray-900">{(calc.totalMinutes / 60).toFixed(1)}h</div>
                                                        {calc.nightMinutes > 0 && (
                                                            <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-black">
                                                                深夜 {(calc.nightMinutes / 60).toFixed(1)}h
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="font-black text-gray-900">
                                                        ¥{(calc.salary + calc.transportationFee).toLocaleString()}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {/* Custom Scrollbar Styling */}
            <style jsx global>{`
  .react-calendar {
    border: none !important;
    font-family: inherit !important;
  }
  .react-calendar__tile--active {
    background: #4f46e5 !important;
    border-radius: 12px;
  }
  .react-calendar__tile:hover {
    border-radius: 12px;
  }
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
  }
`}</style>
        </div>
    );
}
