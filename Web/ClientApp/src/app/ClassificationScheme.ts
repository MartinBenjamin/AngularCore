import { DomainObject, Guid, Named, Range } from "./CommonDomainObjects";

export interface Class extends Named<Guid>
{
}

export interface ClassificationScheme extends DomainObject<Guid>
{
    Classes: ClassificationSchemeClass[];
}

export interface ClassificationSchemeClass extends DomainObject<Guid>
{
    Class   : Class;
    Super   : ClassificationSchemeClass;
    Sub     : ClassificationSchemeClass[];
    Interval: Range<number>;
}
