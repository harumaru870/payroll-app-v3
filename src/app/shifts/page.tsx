import { getEmployees, getSystemSettings } from '@/app/actions';
import ShiftManagement from '@/components/ShiftManagement';
import { Calendar } from 'lucide-react';

export default async function ShiftsPage() {
    const [employees, settings] = await Promise.all([
        getEmployees(),
        getSystemSettings()
    ]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                    <Calendar className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">シフト・勤怠管理</h1>
                    <p className="text-gray-500 font-medium">従業員ごとのシフト入力と給与概算の確認</p>
                </div>
            </div>

            {employees.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-xl text-center space-y-4">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400">
                        <Calendar className="w-10 h-10" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">従業員が登録されていません</h2>
                    <p className="text-gray-500">まずは従業員一覧からメンバーを追加してください。</p>
                </div>
            ) : (
                <ShiftManagement employees={employees} initialSettings={settings} />
            )}
        </div>
    );
}
