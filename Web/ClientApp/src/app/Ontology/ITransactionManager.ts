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
    private _log    : ILogEntry[];
    private _active = false;

    get Active(): boolean
    {
        return this._active;
    }

    BeginTransaction(): ITransaction
    {
        if(!this._log)
        {
            this._log = [];
            this._active = true;
        }

        return new Transaction(
            this,
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
        if(this._active)
            return;

        if(transaction.StartLogLength === 0)
        {
            this._active = false;
            this._log = null;
        }
    }

    Rollback(
        transaction: Transaction
        )
    {
        this._active = false;
        while(this._log.length > transaction.StartLogLength)
            this._log.pop().Rollback();

        if(!this._log.length)
            this._log = null;

        else
            this._active = true;
    }
}

class Transaction implements ITransaction
{
    constructor(
        private _manager: TransactionManager,
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
