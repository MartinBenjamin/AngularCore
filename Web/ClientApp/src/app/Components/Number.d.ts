export function parseNumber(numberFormatPattern: string, value: string): number;
export function parseNumber(numberFormatPattern: string): (value: string) => number;
export function formatNumber(numberFormatPattern: string, number: number): string;
export function formatNumber(numberFormatPattern: string): (number: number) => string; 
