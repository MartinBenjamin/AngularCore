namespace Process
{
    public class Output: IO
    {
        protected Output()
            : base()
        {
        }

        public Output(
            Definition.Output definition,
            Process           parent
            )
            : base(
                definition,
                parent)
        {
        }

        public virtual object ExecuteOutput(
            IExecutionService executionService
            )
        {
            base.ExecuteIO(executionService);
            return ((Definition.Output)Definition).Source.Evaluate(this);
        }
    }
}
