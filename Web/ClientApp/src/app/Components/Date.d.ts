export function parseDate(dateFormatPattern: string, value: string): Date;
export function parseDate(dateFormatPattern: string): (value: string) => Date;
export function parseUTCDate(dateFormatPattern: string, value: string): Date;
export function parseUTCDate(dateFormatPattern: string): (value: string) => Date;
export function formatDate(dateFormatPattern: string, date: Date): string;
export function formatDate(dateFormatPattern: string): (date: Date) => string;
export function formatUTCDate(dateFormatPattern: string, date: Date): string;
export function formatUTCDate(dateFormatPattern: string): (date: Date) => string;
