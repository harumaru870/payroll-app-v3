'use client';

import { useState } from 'react';
import { addWageSetting } from '@/app/actions';
import { DollarSign, Calendar, Truck, Loader2, X } from 'lucide-react';

interface WageModalProps {
    employeeId: string;
    onClose: () => void;
    currentWage: number;
    currentFee: number;
}

export default function WageModal({ employeeId, onClose, currentWage, currentFee }: WageModalProps) {
    const [isPending, setIsPending] = useState(false);
    const [formData, setFormData] = useState({
        hourlyWage: currentWage,
        transportationFee: currentFee,
        effectiveFrom: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);
        try {
            await addWageSetting({
                employeeId,
                hourlyWage: formData.hourlyWage,
                transportationFee: formData.transportationFee,
                effectiveFrom: new Date(formData.effectiveFrom),
            });
            onClose();
        } catch (error) {
            console.error(error);
            alert('保存に失敗しました。');
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">昇給・時給の変更</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">新しい時給</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.hourlyWage}
                                    onChange={e => setFormData({ ...formData, hourlyWage: parseInt(e.target.value) })}
                                />
                                <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">交通費 (1日)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.transportationFee}
                                    onChange={e => setFormData({ ...formData, transportationFee: parseInt(e.target.value) })}
                                />
                                <Truck className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">適用開始日</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.effectiveFrom}
                                    onChange={e => setFormData({ ...formData, effectiveFrom: e.target.value })}
                                />
                                <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 font-bold transition-all shadow-lg shadow-indigo-100"
                        >
                            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>履歴に追加する</span>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
