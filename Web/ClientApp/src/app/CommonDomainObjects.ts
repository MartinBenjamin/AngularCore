export type Guid = string;

export interface DomainObject<TId>
{
    Id: TId;
}

export interface Named<TId> extends DomainObject<TId>
{
    Name: string;
}
