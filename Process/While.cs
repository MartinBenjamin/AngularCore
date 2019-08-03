namespace CommonDomainObjects.Process
{
    public class While: Process
    {
        public Process Embedded { get; protected set; }

        protected While()
            : base()
        {
        }

        internal protected While(
            Definition.While definition,
            Process          parent
            )
            : base(
                definition,
                parent)
        {
        }

        protected override void Execute(
            IExecutionService executionService
            )
        {
            if(Status == Status.NotExecuted)
                ChangeStatus(
                    executionService,
                    Status.Executing);

            if(Status == Status.Executing)
            {
                if(Embedded != null &&
                   Embedded.Status == Status.Executed)
                        Embedded = null;

                var definition = Definition.As<Definition.While>();

                if(Embedded == null &&
                   definition.BooleanExpression(this))
                {
                    Embedded = definition.Embedded.New(this);
                    executionService.Execute(Embedded);
                }

                if(Embedded == null)
                    ChangeStatus(
                        executionService,
                        Status.Executed);
            }
        }
    }
}