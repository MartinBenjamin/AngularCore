export interface Part<T>
{
    PartOf?: T;
}

export interface Whole<T>
{
    Parts?: T[];
}

export interface PartWhole<T> extends Part<T>, Whole<T>
{
}
