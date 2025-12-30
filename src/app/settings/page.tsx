'use client';

import { useState, useEffect, useTransition } from 'react';
import { getSystemSettings, updateSystemSettings } from '@/app/actions';
import { Settings, Building2, Calendar, Clock, Save, CheckCircle2, Loader2 } from 'lucide-react';

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        companyName: '',
        closingDate: 31,
        nightShiftStart: '22:00',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        getSystemSettings().then((data) => {
            setSettings({
                companyName: data.companyName,
                closingDate: data.closingDate,
                nightShiftStart: data.nightShiftStart,
            });
            setIsLoading(false);
        });
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            await updateSystemSettings(settings);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 rounded-2xl">
                    <Settings className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">システム設定</h1>
                    <p className="text-gray-500 mt-1">給与計算の基準や会社情報を設定します。</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                <div className="p-8 space-y-8">
                    {/* Company Name */}
                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                            <Building2 className="w-4 h-4 text-indigo-500" />
                            会社名・拠点名
                        </label>
                        <input
                            type="text"
                            value={settings.companyName}
                            onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-gray-900"
                            placeholder="株式会社 〇〇"
                            required
                        />
                        <p className="text-xs text-gray-400 pl-1">※ 給与明細の「発行元」として表示されます。</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Closing Date */}
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <Calendar className="w-4 h-4 text-indigo-500" />
                                締め日
                            </label>
                            <div className="relative">
                                <select
                                    value={settings.closingDate}
                                    onChange={(e) => setSettings({ ...settings, closingDate: parseInt(e.target.value) })}
                                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-gray-900 appearance-none"
                                >
                                    {[...Array(30)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>{i + 1}日</option>
                                    ))}
                                    <option value={31}>末日</option>
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <Calendar className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        {/* Night Shift Start */}
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <Clock className="w-4 h-4 text-indigo-500" />
                                深夜時間帯の開始
                            </label>
                            <input
                                type="time"
                                value={settings.nightShiftStart}
                                onChange={(e) => setSettings({ ...settings, nightShiftStart: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-gray-900"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {showSuccess && (
                            <div className="flex items-center gap-2 text-emerald-600 animate-in fade-in slide-in-from-left-4">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="font-bold text-sm">設定を保存しました</span>
                            </div>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-200 hover:scale-[1.02] active:scale-95"
                    >
                        {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        設定を保存する
                    </button>
                </div>
            </form>
        </div>
    );
}
