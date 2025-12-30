export function safeParseDate(dateInput: any): Date {
    if (!dateInput) return new Date();

    const date = new Date(dateInput);

    if (isNaN(date.getTime())) {
        // Handle SQLite CURRENT_TIMESTAMP format "YYYY-MM-DD HH:MM:SS"
        if (typeof dateInput === 'string') {
            const isoStr = dateInput.replace(' ', 'T');
            const isoDate = new Date(isoStr);
            if (!isNaN(isoDate.getTime())) return isoDate;
        }
        return new Date(); // Fallback to now
    }

    return date;
}

export function formatDate(dateInput: any): string {
    return safeParseDate(dateInput).toLocaleDateString('ja-JP');
}
