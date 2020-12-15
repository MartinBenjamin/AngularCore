import { DomainObject, Guid } from "./CommonDomainObjects";

export interface ITemporalEntity extends DomainObject<Guid>
{
    Beginning: IInstant;
    End      : IInstant;
    Duration : IDuration;
}

export interface IInstant extends ITemporalEntity
{
    DateTime: Date;
}

export interface IDuration
{
    Years  : number;
    Months : number;
    Days   : number;
    Hours  : number;
    Minutes: number;
    Seconds: number;
}

export interface IInterval extends ITemporalEntity
{
}
