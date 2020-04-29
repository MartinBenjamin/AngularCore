declare function parseNumber(numberFormatPattern: string, value: string): number;
declare function parseNumber(numberFormatPattern: string): (value: string) => number;
declare function formatNumber(numberFormatPattern: string, number: number): string;
declare function formatNumber(numberFormatPattern: string): (number: number) => string; 