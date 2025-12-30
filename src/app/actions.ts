'use server';

import { db } from '@/db';
import { employees, wageSettings, shifts, systemSettings } from '@/db/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'node:crypto';
import { safeParseDate } from '@/utils/date';
import { calculateShiftPay, getEffectiveWage } from '@/utils/payroll';

// --- Employee Actions ---

export async function getEmployees() {
    return await db.query.employees.findMany({
        with: {
            wages: {
                orderBy: [desc(wageSettings.effectiveFrom)],
            },
        },
        orderBy: [desc(employees.joinedAt)],
    });
}

export async function getEmployeeWithWages(id: string) {
    const employee = await db.query.employees.findFirst({
        where: eq(employees.id, id),
    });

    if (!employee) return null;

    const wages = await db.query.wageSettings.findMany({
        where: eq(wageSettings.employeeId, id),
        orderBy: [desc(wageSettings.effectiveFrom)],
    });

    return { ...employee, wages };
}

export async function createEmployee(data: {
    name: string;
    email?: string;
    hourlyWage: number;
    transportationFee?: number;
    effectiveFrom: Date;
}) {
    const id = randomUUID();

    await db.insert(employees).values({
        id,
        name: data.name,
        email: data.email,
    });

    await db.insert(wageSettings).values({
        employeeId: id,
        hourlyWage: data.hourlyWage,
        transportationFee: data.transportationFee ?? 0,
        effectiveFrom: data.effectiveFrom,
    });

    revalidatePath('/employees');
    return id;
}

export async function updateEmployee(id: string, data: Partial<typeof employees.$inferInsert>) {
    await db.update(employees).set(data).where(eq(employees.id, id));
    revalidatePath('/employees');
    revalidatePath(`/employees/${id}`);
}

export async function addWageSetting(data: typeof wageSettings.$inferInsert) {
    await db.insert(wageSettings).values(data);
    revalidatePath(`/employees/${data.employeeId}`);
}

export async function deleteEmployee(id: string) {
    await db.delete(employees).where(eq(employees.id, id));
    revalidatePath('/employees');
}

// --- Shift Actions ---

export async function getShifts(employeeId: string, month: Date) {
    const start = new Date(month.getFullYear(), month.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59, 999);

    return await db.query.shifts.findMany({
        where: (shifts, { and, eq, gte, lte }) => and(
            eq(shifts.employeeId, employeeId),
            gte(shifts.date, start),
            lte(shifts.date, end)
        ),
        orderBy: [shifts.date],
    });
}

export async function upsertShift(data: typeof shifts.$inferInsert) {
    const normalizedDate = safeParseDate(data.date);
    normalizedDate.setHours(0, 0, 0, 0);

    const finalData = { ...data, date: normalizedDate };

    if (finalData.id) {
        await db.update(shifts).set(finalData).where(eq(shifts.id, finalData.id));
    } else {
        await db.insert(shifts).values(finalData);
    }
    revalidatePath('/shifts');
    revalidatePath(`/employees/${finalData.employeeId}`);
}

export async function deleteShift(id: number, employeeId: string) {
    await db.delete(shifts).where(eq(shifts.id, id));
    revalidatePath('/shifts');
    revalidatePath(`/employees/${employeeId}`);
}

// --- System Settings Actions ---

export async function getSystemSettings() {
    const settings = await db.query.systemSettings.findFirst();
    if (!settings) {
        return {
            companyName: 'My Company',
            closingDate: 31,
            nightShiftStart: '22:00'
        };
    }
    return settings;
}

export async function updateSystemSettings(data: Partial<typeof systemSettings.$inferInsert>) {
    const settings = await db.query.systemSettings.findFirst();
    if (settings) {
        await db.update(systemSettings).set(data).where(eq(systemSettings.id, settings.id));
    } else {
        await db.insert(systemSettings).values(data as any);
    }
    revalidatePath('/settings');
}

// --- Dashboard & Payroll Aggregation ---

export async function getDashboardData() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const employeesData = await db.query.employees.findMany({
        where: eq(employees.status, 'active'),
        with: {
            wages: {
                orderBy: [desc(wageSettings.effectiveFrom)],
            },
        },
    });

    const monthShifts = await db.query.shifts.findMany({
        where: (shifts, { and, gte, lte }) => and(
            gte(shifts.date, startOfMonth),
            lte(shifts.date, endOfMonth)
        ),
        with: {
            employee: {
                with: {
                    wages: {
                        orderBy: [desc(wageSettings.effectiveFrom)],
                    }
                }
            }
        },
        orderBy: [desc(shifts.date)],
    });

    let totalSalary = 0;
    let totalMinutes = 0;

    monthShifts.forEach(shift => {
        const empWages = (shift.employee as any).wages;
        const wageInfo = getEffectiveWage(empWages, safeParseDate(shift.date));
        const calculated = calculateShiftPay({
            ...shift,
            date: safeParseDate(shift.date),
            hourlyWage: wageInfo.hourlyWage,
            transportationFee: wageInfo.transportationFee,
        });
        totalSalary += calculated.salary + wageInfo.transportationFee;
        totalMinutes += calculated.totalMinutes;
    });

    const recentShifts = monthShifts.slice(0, 5).map(s => ({
        id: s.id,
        employeeName: s.employee.name,
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
    }));

    return {
        activeEmployeeCount: employeesData.length,
        totalSalary,
        totalHours: Math.floor(totalMinutes / 60),
        recentShifts
    };
}

export async function getPayrollData(employeeId: string, year: number, month: number) {
    const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const employee = await db.query.employees.findFirst({
        where: eq(employees.id, employeeId),
        with: {
            wages: {
                orderBy: [desc(wageSettings.effectiveFrom)],
            },
        }
    });

    if (!employee) throw new Error('Employee not found');

    const monthShifts = await db.query.shifts.findMany({
        where: (shifts, { and, eq, gte, lte }) => and(
            eq(shifts.employeeId, employeeId),
            gte(shifts.date, start),
            lte(shifts.date, end)
        ),
        orderBy: [shifts.date],
    });

    const settings = await getSystemSettings();

    return {
        employee,
        shifts: monthShifts,
        settings,
        period: { year, month }
    };
}
