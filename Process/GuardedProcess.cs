using CommonDomainObjects;
using System;
using System.Collections.Generic;

namespace Process
{
    public class GuardedProcess: Alternative
    {
        public virtual IO      Guard   { get; protected set; }
        public virtual Process Guarded { get; protected set; }

        internal protected GuardedProcess(
            Guid                        id,
            Definition.GuardedProcess   definition,
            Choice                      parent,
            IDictionary<string, object> variables
            )
            : base(
                id,
                definition,
                parent,
                variables)
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
                   definition.GuardExpression.Evaluate(this))
                {
                    ChangeStatus(
                        executionService,
                        Status.Waiting);

                    Guard = (IO)definition.Guard.Select(executionService.Constructor)(
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
                if(definition.Guarded != null)
                {
                    if(Guarded == null)
                    {
                        Guarded = definition.Guarded.Select(executionService.Constructor)(
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
