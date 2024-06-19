using System.Collections.Generic;

namespace Process
{
    public class GuardedProcess: Alternative
    {
        private readonly Definition.GuardedProcess _definition;

        public virtual IO      Guard   { get; protected set; }
        public virtual Process Guarded { get; protected set; }

        internal protected GuardedProcess(
            Definition.GuardedProcess   definition,
            Choice                      parent,
            IDictionary<string, object> variables
            )
            : base(
                definition,
                parent,
                variables)
        {
            _definition = definition;
        }

        protected override void Execute(
            IExecutionService executionService
            )
        {
            if(Status == Status.NotExecuted)
            {
                if(_definition.GuardExpression == null ||
                   _definition.GuardExpression(this))
                {
                    ChangeStatus(
                        executionService,
                        Status.Waiting);

                    Guard = (IO)_definition.Guard.Select(Constructor.Instance)(
                        this,
                        null);
                    ((IExecutable)Guard).Execute(executionService);
                }
                else
                    ChangeStatus(
                        executionService,
                        Status.Skipped);
            }

            if(Status == Status.Executing)
            {
                if(_definition.Guarded != null)
                {
                    if(Guarded == null)
                    {
                        Guarded = _definition.Guarded.Select(Constructor.Instance)(
                            this,
                            null);
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
                    Status.Skipped);

                Guard?.Skip(executionService);

                return false;
            }

            ChangeStatus(
                executionService,
                Status.Executing);

            return true;
        }
    }
}
