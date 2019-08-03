namespace CommonDomainObjects.Process
{
    public class GuardedProcess: Alternative
    {
        public virtual IO      Guard   { get; protected set; }
        public virtual Process Guarded { get; protected set; }

        protected GuardedProcess()
            : base()
        {
        }

        internal protected GuardedProcess(
            Definition.GuardedProcess definition,
            Choice                    parent
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
            var definition = Definition.As<Definition.GuardedProcess>();

            if(Status == Status.NotExecuted)
            {
                if(definition.GuardExpression == null ||
                   definition.GuardExpression(this))
                {
                    ChangeStatus(
                        executionService,
                        Status.AwaitChoice);

                    Guard = (IO)definition.Guard.New(this);
                    executionService.Save(Guard);
                    ((IExecutable)Guard).Execute(executionService);
                }
                else
                    ChangeStatus(
                        executionService,
                        Status.NotChosen);
            }

            if(Status == Status.Executing)
            {
                if(definition.Guarded != null)
                {
                    if(Guarded == null)
                    {
                        Guarded = definition.Guarded.New(this);
                        executionService.Save(Guarded);
                        executionService.Execute(Guarded);
                    }

                    if(Guarded.Status == Status.Executed)
                        ChangeStatus(
                            executionService,
                            Status.Executed);
                }
                else
                    ChangeStatus(
                        executionService,
                        Status.Executed);
            }
        }

        public override bool Choose(
            IExecutionService executionService,
            Alternative       alternative
            )
        {
            if(this != alternative)
            {
                ChangeStatus(
                    executionService,
                    Status.NotChosen);

                if(Guard != null)
                    Guard.NotChosen(executionService);

                return false;
            }

            ChangeStatus(
                executionService,
                Status.Executing);

            return true;
        }
    }
}
