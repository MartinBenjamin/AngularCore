namespace Process
{
    public class Input<TInput>: IO
    {
        protected Input()
            : base()
        {
        }

        public Input(
            Definition.Input<TInput> definition,
            Process                  parent
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

            ChangeStatus(
                executionService,
                Status.Executed);
        }
    }
}
