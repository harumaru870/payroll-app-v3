'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createEmployee } from '@/app/actions';
import { User, Mail, DollarSign, Calendar, Truck, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function EmployeeForm() {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        hourlyWage: 1200,
        transportationFee: 0,
        effectiveFrom: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);
        try {
            await createEmployee({
                ...formData,
                effectiveFrom: new Date(formData.effectiveFrom),
            });
            router.push('/employees');
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('保存に失敗しました。');
        } finally {
            setIsPending(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <Link href="/employees" className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    <span>従業員一覧へ戻る</span>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">従業員の新規登録</h1>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                <div className="p-8 space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-indigo-600 flex items-center gap-2">
                            <User className="w-5 h-5" />
                            <span>基本情報</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">お名前 <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        placeholder="例: 山田 太郎"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">メールアドレス</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        placeholder="example@mail.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-50" />

                    {/* Wage Info */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-indigo-600 flex items-center gap-2">
                            <DollarSign className="w-5 h-5" />
                            <span>給与設定（初期）</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">基本時給 <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        className="w-full pl-10 pr-8 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={formData.hourlyWage}
                                        onChange={e => setFormData({ ...formData, hourlyWage: parseInt(e.target.value) })}
                                    />
                                    <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">円</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">交通費 (1日)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full pl-10 pr-8 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={formData.transportationFee}
                                        onChange={e => setFormData({ ...formData, transportationFee: parseInt(e.target.value) })}
                                    />
                                    <Truck className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">円</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">適用開始日 <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={formData.effectiveFrom}
                                        onChange={e => setFormData({ ...formData, effectiveFrom: e.target.value })}
                                    />
                                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200 font-bold"
                    >
                        {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>登録する</span>}
                    </button>
                </div>
            </div>
        </form>
    );
}
