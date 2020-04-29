declare function parseDate(dateFormatPattern: string, value: string): Date;
declare function parseDate(dateFormatPattern: string): (value: string) => Date;
declare function parseUTCDate(dateFormatPattern: string, value: string): Date;
declare function parseUTCDate(dateFormatPattern: string): (value: string) => Date;
declare function formatDate(dateFormatPattern: string, date: Date): string;
declare function formatDate(dateFormatPattern: string): (date: Date) => string;
declare function formatUTCDate(dateFormatPattern: string, date: Date): string;
declare function formatUTCDate(dateFormatPattern: string): (date: Date) => string;