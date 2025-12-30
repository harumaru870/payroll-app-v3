import { getEmployeeWithWages, deleteEmployee } from '@/app/actions';
import { notFound, redirect } from 'next/navigation';
import { Calendar, Trash2, ArrowLeft, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/utils/date';
import EmployeeDetailClient from '@/components/EmployeeDetailClient';

export default async function EmployeeDetailPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const employee = await getEmployeeWithWages(id);

    if (!employee) {
        notFound();
    }

    async function handleDelete() {
        'use server';
        await deleteEmployee(id);
        redirect('/employees');
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <Link href="/employees" className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    <span>一覧に戻る</span>
                </Link>
                <div className="flex items-center gap-3">
                    <form action={handleDelete}>
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>従業員を削除</span>
                        </button>
                    </form>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl text-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 mx-auto mb-4 flex items-center justify-center text-4xl text-white font-bold shadow-lg ring-8 ring-indigo-50">
                            {employee.name.charAt(0)}
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
                        <p className="text-gray-500 text-sm mt-1">{employee.email || 'メール未登録'}</p>

                        <div className="mt-8 pt-8 border-t border-gray-50 space-y-4 text-left">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs font-bold leading-none">入社日</p>
                                    <p className="text-gray-900 font-bold mt-1">{formatDate(employee.joinedAt)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs font-bold leading-none">ステータス</p>
                                    <p className="text-gray-900 font-bold mt-1">{employee.status === 'active' ? '在職中' : '退職'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Wage History */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                        <EmployeeDetailClient employee={employee} />
                    </div>
                </div>
            </div>
        </div>
    );
}
