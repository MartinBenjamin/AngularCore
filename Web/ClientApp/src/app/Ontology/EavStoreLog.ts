import { ILogEntry} from './ITransactionManager';
import { Store } from './IEavStore';

export interface IPublisher
{
    SuspendPublish(): void;
    UnsuspendPublish(): void;
    PublishAssert(entity: any, attribute: string, value: any): void;
    PublishRetract(entity: any, attribute: string, value: any): void;
    PublishAssertRetract(entity: any, attribute: string, assertedValue: any, retractedValue): void;
    PublishNewEntity(entity: any): void;
    PublishDeleteEntity(entity: any): void;
}


export abstract class LogEntry implements ILogEntry
{
    protected constructor(
        public Entity: any
        )
    {
    }

    Commit(): void
    {
    }

    Rollback(): void
    {
    }
}

class Assert extends LogEntry
{
    constructor(
        entity          : any,
        public Attribute: PropertyKey,
        public Value    : any
        )
    {
        super(entity);
    }

    Rollback(): void
    {
        const value = this.Entity[this.Attribute];
        if(value instanceof Array)
            value.splice(
                value.indexOf(this.Value),
                1);

        else
            this.Entity[this.Attribute] = undefined;
    }
}

class Retract extends LogEntry
{
    constructor(
        entity          : any,
        public Attribute: PropertyKey,
        public Value    : any
        )
    {
        super(entity);
    }

    Rollback(): void
    {
        const value = this.Entity[this.Attribute];
        if(value instanceof Array)
            value.push(this.Value);

        else
            this.Entity[this.Attribute] = this.Value;
    }
}

class AssertRetract extends LogEntry
{
    constructor(
        entity               : any,
        public Attribute     : PropertyKey,
        public AssertedValue : any,
        public RetractedValue: any
        )
    {
        super(entity);
    }

    Rollback(): void
    {
        const value = this.Entity[this.Attribute];
        if(value instanceof Array)
            value.splice(
                value.indexOf(this.AssertedValue),
                this.RetractedValue);

        else
            this.Entity[this.Attribute] = this.RetractedValue;
    }
}

class NewEntity extends LogEntry
{
    constructor(
        entity: any
        )
    {
        super(entity);
    }

    Rollback(): void
    {
        const store = Store(this.Entity);
        store.DeleteEntity(this.Entity);
    }
}

class DeleteEntity extends LogEntry
{
    constructor(
        entity: any
        )
    {
        super(entity);
    }

    Commit(): void
    {
        const store = Store(this.Entity);
        store.DeleteEntity(this.Entity);
    }
}
