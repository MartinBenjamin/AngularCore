import { DomainObject } from "../CommonDomainObjects";

export interface IDomainObjectBuilder<TId, TDomainObject extends DomainObject<TId>>
{
    Build(): TDomainObject;
}
