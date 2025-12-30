import { getEmployees } from '@/app/actions';
import Link from 'next/link';
import { Plus, User, Mail, Calendar, ChevronRight } from 'lucide-react';
import { formatDate } from '@/utils/date';

export default async function EmployeesPage() {
    const allEmployees = await getEmployees();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">従業員管理</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">従業員の登録、編集、退職処理を行えます。</p>
                </div>
                <Link
                    href="/employees/new"
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    <span>新しい従業員を追加</span>
                </Link>
            </div>

            <div className="bg-card rounded-2xl border border-card-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-background border-b border-card-border">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">名前 / メール</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ステータス</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">入社年度</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-card-border">
                            {allEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                                        登録されている従業員がいません。
                                    </td>
                                </tr>
                            ) : (
                                allEmployees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-indigo-50/5 dark:hover:bg-indigo-900/10 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                                                    {emp.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-foreground">{emp.name}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        {emp.email || 'メール未登録'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${emp.status === 'active'
                                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400'
                                                }`}>
                                                {emp.status === 'active' ? '在職中' : '退職'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-600" />
                                                {formatDate(emp.joinedAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/employees/${emp.id}`}
                                                className="inline-flex items-center gap-1 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                                            >
                                                <span>詳細</span>
                                                <ChevronRight className="w-4 h-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
