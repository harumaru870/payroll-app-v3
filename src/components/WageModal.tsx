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
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-card rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-card-border">
                <div className="px-8 py-6 border-b border-card-border flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground">昇給・時給の変更</h2>
                    <button onClick={onClose} className="p-2 hover:bg-background dark:hover:bg-indigo-900/20 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">新しい時給</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-background border border-card-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-foreground"
                                    value={formData.hourlyWage}
                                    onChange={e => setFormData({ ...formData, hourlyWage: parseInt(e.target.value) })}
                                />
                                <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">交通費 (1日)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-background border border-card-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-foreground"
                                    value={formData.transportationFee}
                                    onChange={e => setFormData({ ...formData, transportationFee: parseInt(e.target.value) })}
                                />
                                <Truck className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">適用開始日</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-background border border-card-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-foreground"
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
                            className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 font-bold transition-all shadow-lg dark:shadow-none"
                        >
                            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>履歴に追加する</span>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
