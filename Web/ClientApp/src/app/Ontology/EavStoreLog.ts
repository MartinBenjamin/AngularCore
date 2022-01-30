import { ILogEntry} from './ITransactionManager';
import { Store } from './IEavStore';

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
            Store(this.Entity).DeleteAttribute(
                this.Entity,
                this.Attribute);
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
        Store(this.Entity).DeleteEntity(this.Entity);
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
        Store(this.Entity).DeleteEntity(this.Entity);
    }
}
