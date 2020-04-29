export interface IConversionService<T>
{
    Parse(value: string): T;
    Format(t: T): string;
}