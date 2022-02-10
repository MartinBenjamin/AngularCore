export interface ITransaction
{
    Commit(): void;
    Rollback(): void;
}

export interface ILogEntry
{
    Rollback(): void;
}

export interface ITransactionManager
{
    Active: boolean;
    BeginTransaction(): ITransaction;
    Log(logEntry: ILogEntry): void;
}

export class TransactionManager
{
    private _log    : ILogEntry[] = [];
    private _active = false;
    private _scope  = 0;

    get Active(): boolean
    {
        return this._active;
    }

    BeginTransaction(): ITransaction
    {
        this._active = true;

        return new Transaction(
            this,
            ++this._scope,
            this._log.length);
    }

    Log(
        logEntry: ILogEntry
        )
    {
        if(this._active)
            this._log.push(logEntry);
    }

    Commit(
        transaction: Transaction
        ): void
    {
        if(transaction.Scope === this._scope)
            if(--this._scope === 0)
                this._active = false;
    }

    Rollback(
        transaction: Transaction
        )
    {
        if(transaction.Scope !== this._scope)
            return;

        this._active = false;
        while(this._log.length > transaction.StartLogLength)
            this._log.pop().Rollback();

        if(--this._scope !== 0)
            this._active = true;
    }
}

class Transaction implements ITransaction
{
    constructor(
        private _manager: TransactionManager,
        public Scope: number,
        public StartLogLength: number
        )
    {
    }

    Commit(): void
    {
        this._manager.Commit(this);
    }

    Rollback()
    {
        this._manager.Rollback(this);
    }
}
