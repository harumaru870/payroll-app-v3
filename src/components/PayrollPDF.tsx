'use client';

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { calculateShiftPay, getEffectiveWage } from '@/utils/payroll';
import { safeParseDate } from '@/utils/date';

// 日本語フォントを登録
Font.register({
    family: 'Noto Sans JP',
    fonts: [
        {
            src: '/fonts/NotoSansJP-Regular.woff',
            fontWeight: 'normal',
        },
        {
            src: '/fonts/NotoSansJP-Bold.woff',
            fontWeight: 'bold',
        },
    ],
});

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Noto Sans JP',
        fontSize: 10,
        color: '#333',
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#4f46e5',
        borderBottomStyle: 'solid',
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111',
    },
    period: {
        fontSize: 12,
        color: '#666',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 10,
        backgroundColor: '#f3f4f6',
        padding: 5,
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingVertical: 5,
        paddingHorizontal: 5,
    },
    label: {
        width: '40%',
        color: '#666',
    },
    value: {
        width: '60%',
        textAlign: 'right',
        fontWeight: 'bold',
    },
    table: {
        marginTop: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#4f46e5',
        color: '#fff',
        padding: 5,
        fontWeight: 'bold',
    },
    col1: { width: '20%' },
    col2: { width: '30%' },
    col3: { width: '20%' },
    col4: { width: '30%', textAlign: 'right' },
    totalSection: {
        marginTop: 30,
        padding: 15,
        backgroundColor: '#eef2ff',
        borderRadius: 5,
    },
    totalTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4f46e5',
        marginBottom: 5,
    },
    totalValue: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'right',
    },
    footer: {
        marginTop: 40,
        textAlign: 'right',
        color: '#999',
        fontSize: 8,
    },
    companyInfo: {
        marginTop: 20,
    },
    companyName: {
        fontSize: 12,
        fontWeight: 'bold',
    }
});

interface PayrollPDFProps {
    data: {
        employee: any;
        shifts: any[];
        settings: any;
        period: { year: number; month: number };
    };
}

export default function PayrollPDF({ data }: PayrollPDFProps) {
    const { employee, shifts, settings, period } = data;

    // 集計
    const calculatedShifts = shifts.map(s => {
        const wageInfo = getEffectiveWage(employee.wages, safeParseDate(s.date));
        return calculateShiftPay({
            ...s,
            date: safeParseDate(s.date),
            hourlyWage: wageInfo.hourlyWage,
            transportationFee: wageInfo.transportationFee
        });
    });

    const totals = calculatedShifts.reduce((acc, curr) => ({
        salary: acc.salary + (curr.salary || 0),
        transportation: acc.transportation + (curr.transportationFee || 0),
        totalMinutes: acc.totalMinutes + (curr.totalMinutes || 0),
        normalMinutes: acc.normalMinutes + (curr.normalMinutes || 0),
        nightMinutes: acc.nightMinutes + (curr.nightMinutes || 0),
        days: acc.days + 1
    }), { salary: 0, transportation: 0, totalMinutes: 0, normalMinutes: 0, nightMinutes: 0, days: 0 });

    const totalPay = (totals.salary || 0) + (totals.transportation || 0);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>給与明細書</Text>
                    <Text style={styles.period}>{period.year}年 {period.month}月分</Text>
                </View>

                <View style={styles.section}>
                    <Text style={{ fontSize: 16, marginBottom: 5 }}>{employee.name} 様</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>支給項目</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>基本支給額 (通常勤務分)</Text>
                        <Text style={styles.value}>¥{totals.salary.toLocaleString()}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>深夜割増手当 (1.25倍)</Text>
                        <Text style={styles.value}>内訳に含まれています</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>交通費合計</Text>
                        <Text style={styles.value}>¥{totals.transportation.toLocaleString()}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>勤怠項目</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>出勤日数</Text>
                        <Text style={styles.value}>{totals.days} 日</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>総労働時間</Text>
                        <Text style={styles.value}>{(totals.totalMinutes / 60).toFixed(2)} 時間</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>内 深夜労働時間</Text>
                        <Text style={styles.value}>{(totals.nightMinutes / 60).toFixed(2)} 時間</Text>
                    </View>
                </View>

                <View style={styles.table}>
                    <Text style={styles.sectionTitle}>勤務明細</Text>
                    <View style={styles.tableHeader}>
                        <Text style={styles.col1}>日付</Text>
                        <Text style={styles.col2}>時間</Text>
                        <Text style={styles.col3}>休憩</Text>
                        <Text style={styles.col4}>支給額</Text>
                    </View>
                    {calculatedShifts.slice(0, 15).map((s, i) => (
                        <View key={i} style={styles.row}>
                            <Text style={styles.col1}>{format(s.date, 'MM/dd (E)', { locale: ja })}</Text>
                            <Text style={styles.col2}>{s.startTime} - {s.endTime}</Text>
                            <Text style={styles.col3}>{s.breakMinutes}分</Text>
                            <Text style={styles.col4}>¥{(s.salary + s.transportationFee).toLocaleString()}</Text>
                        </View>
                    ))}
                    {calculatedShifts.length > 15 && (
                        <View style={styles.row}>
                            <Text style={{ width: '100%', textAlign: 'center', color: '#666' }}>...以下略...</Text>
                        </View>
                    )}
                </View>

                <View style={styles.totalSection}>
                    <Text style={styles.totalTitle}>差引支給額 (合計)</Text>
                    <Text style={styles.totalValue}>¥{totalPay.toLocaleString()}</Text>
                </View>

                <View style={styles.companyInfo}>
                    <Text style={styles.companyName}>{settings.companyName}</Text>
                    <Text>給与担当: 管理者</Text>
                </View>

                <Text style={styles.footer}>
                    ※本書は自動生成されたものです。内容に相違がある場合はお早めにご連絡ください。
                </Text>
            </Page>
        </Document>
    );
}
