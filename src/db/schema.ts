import { sql, relations } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const employees = sqliteTable('employees', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email'),
    status: text('status', { enum: ['active', 'retired'] }).notNull().default('active'),
    joinedAt: integer('joined_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
    retiredAt: integer('retired_at', { mode: 'timestamp' }),
});

export const employeesRelations = relations(employees, ({ many }) => ({
    wages: many(wageSettings),
    shifts: many(shifts),
}));

export const wageSettings = sqliteTable('wage_settings', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    employeeId: text('employee_id').notNull().references(() => employees.id, { onDelete: 'cascade' }),
    hourlyWage: integer('hourly_wage').notNull(),
    transportationFee: integer('transportation_fee').notNull().default(0),
    effectiveFrom: integer('effective_from', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const wageSettingsRelations = relations(wageSettings, ({ one }) => ({
    employee: one(employees, {
        fields: [wageSettings.employeeId],
        references: [employees.id],
    }),
}));

export const shifts = sqliteTable('shifts', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    employeeId: text('employee_id').notNull().references(() => employees.id, { onDelete: 'cascade' }),
    date: integer('date', { mode: 'timestamp' }).notNull(),
    startTime: text('start_time').notNull(), // HH:mm
    endTime: text('end_time').notNull(), // HH:mm
    breakMinutes: integer('break_minutes').notNull().default(0),
    note: text('note'),
});

export const shiftsRelations = relations(shifts, ({ one }) => ({
    employee: one(employees, {
        fields: [shifts.employeeId],
        references: [employees.id],
    }),
}));

export const systemSettings = sqliteTable('system_settings', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    companyName: text('company_name').notNull().default('My Company'),
    closingDate: integer('closing_date').notNull().default(31), // 1-31, 31 means end of month
    nightShiftStart: text('night_shift_start').notNull().default('22:00'),
});

