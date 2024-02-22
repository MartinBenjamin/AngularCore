import { PropertyKey } from './IEavStore';

export interface IPublisher
{
    SuspendPublish(): void;
    UnsuspendPublish(): void;
    PublishAssert(entity: any, attribute: PropertyKey, value: any): void;
    PublishRetract(entity: any, attribute: PropertyKey, value: any): void;
    PublishAssertRetract(entity: any, attribute: PropertyKey, assertedValue: any, retractedValue: any): void;
}
