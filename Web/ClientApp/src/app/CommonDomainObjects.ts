export class DomainObject<TId>
{
  Id: TId;
}

export class Named<TId> extends DomainObject<TId>
{
  Named: string;
}
