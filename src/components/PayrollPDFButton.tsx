'use client';

import { useState, useEffect, memo } from 'react';
import { FileText, Loader2, Download } from 'lucide-react';
import { format } from 'date-fns';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PayrollPDF from './PayrollPDF';

interface PayrollPDFButtonProps {
    data: {
        employee: any;
        shifts: any[];
        settings: any;
        period: { year: number; month: number };
    };
}

const PayrollPDFButton = memo(function PayrollPDFButton({ data }: PayrollPDFButtonProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // SSR 待機
    if (!isMounted) return (
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-400 rounded-xl font-bold text-sm border border-gray-100 italic">
            <FileText className="w-4 h-4" />
            <span>給与明細PDF</span>
        </div>
    );

    // 初期状態：生成開始ボタンを表示
    if (!isGenerating) {
        return (
            <button
                onClick={() => setIsGenerating(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-colors border border-indigo-100 shadow-sm"
            >
                <FileText className="w-4 h-4" />
                <span>PDFを作成する</span>
            </button>
        );
    }

    // 生成中・準備完了状態
    return (
        <PDFDownloadLink
            document={<PayrollPDF data={data} />}
            fileName={`給与明細_${data.employee.name}_${format(new Date(data.period.year, data.period.month - 1), 'yyyyMM')}.pdf`}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all border border-emerald-500 shadow-lg shadow-emerald-100 animate-in zoom-in-95 duration-200"
        >
            {({ loading, error }) => {
                if (error) {
                    console.error('PDF Render Error:', error);
                    return (
                        <div className="flex items-center gap-2 text-red-100">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>エラー発生</span>
                        </div>
                    );
                }
                return (
                    <>
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>生成中...</span>
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4 animate-bounce" />
                                <span>ダウンロード準備完了</span>
                            </>
                        )}
                    </>
                );
            }}
        </PDFDownloadLink>
    );
}, (prev, next) => {
    // データの中身が変わった時だけ再レンダリングする
    return JSON.stringify(prev.data) === JSON.stringify(next.data);
});

export default PayrollPDFButton;
