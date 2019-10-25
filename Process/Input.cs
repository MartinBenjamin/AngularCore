namespace Process
{
    public abstract class Input: IO
    {
        protected Input()
            : base()
        {
        }

        protected Input(
            Definition.Input definition,
            Process          parent
            )
            : base(
                definition,
                parent)
        {
        }

        public virtual void ExecuteInput(
            IExecutionService executionService
            )
        {
            if(Status != Status.AwaitIO)
                throw new InvalidStateException();

            ExecuteInput();

            ChangeStatus(
                executionService,
                Status.Executed);
        }

        protected abstract void ExecuteInput();
    }

    public abstract class Input<TInput>: IO
    {
        protected Input()
            : base()
        {
        }

        protected Input(
            Definition.Input definition,
            Process parent
            )
            : base(
                definition,
                parent)
        {
        }

        public virtual void Executelnput(
            IExecutionService executionService,
            TInput            input
            )
        {
            if(Status != Status.AwaitIO)
                throw new InvalidStateException();

            Executelnput(input);
                ChangeStatus(
                executionService,
                Status.Executed);
        }

        protected abstract void Executelnput(TInput input);
    }
}
