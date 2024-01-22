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

        public virtual void Executelnput(
            IExecutionService executionService,
            object            input
            )
        {
            if(Status != Status.AwaitIO)
                throw new InvalidStateException();

            Parent[((Definition.Input)Definition).TargetVariable] = input;

            ChangeStatus(
                executionService,
                Status.Executed);
        }
    }
}
