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
        Store(this.Entity).Assert(
            this.Entity,
            this.Attribute,
            this.Value);
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
        const store = Store(this.Entity);
        if(this.Entity[this.Attribute] instanceof Array)
            store.Retract(
                this.Entity,
                this.Attribute,
                this.AssertedValue);
            
        store.Assert(
            this.Entity,
            this.Attribute,
            this.RetractedValue);
    }
}

export class NewEntity extends LogEntry
{
    constructor(
        entity: any,
        public Rollback: () => void
        )
    {
        super(entity);
    }
}

export class DeleteEntity extends LogEntry
{
    constructor(
        entity: any,
        public Rollback: () => void
        )
    {
        super(entity);
    }
}
