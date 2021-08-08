export type Guid = string;
const EmptyGuid = '00000000-0000-0000-0000-000000000000';
export { EmptyGuid };

export interface DomainObject<TId>
{
    Id?: TId;
}

export interface Named<TId> extends DomainObject<TId>
{
    Name: string;
}

export interface Range<T>
{
    Start: T;
    End  : T;
}
