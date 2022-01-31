import { ILogEntry} from './ITransactionManager';
import { Store } from './IEavStore';

export abstract class LogEntry implements ILogEntry
{
    protected constructor(
        public Entity: any
        )
    {
    }

    Rollback(): void
    {
    }
}

export class Assert extends LogEntry
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
            Store(this.Entity).Retract(
                this.Entity,
                this.Attribute,
                this.Value);
    }
}

export class Retract extends LogEntry
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

export class AssertRetract extends LogEntry
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

export class NewEntity extends LogEntry
{
    constructor(
        entity: any,
        public RollBack: () => void
        )
    {
        super(entity);
    }
}

export class DeleteEntity extends LogEntry
{
    constructor(
        entity: any,
        public RollBack: () => void
        )
    {
        super(entity);
    }
}
