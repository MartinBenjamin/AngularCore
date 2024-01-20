namespace Process
{
    public class Input: IO
    {
        protected Input()
            : base()
        {
        }

        public Input(
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

            ChangeStatus(
                executionService,
                Status.Executed);
        }
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
