using CommonDomainObjects;
using System.Collections.Generic;

namespace Process
{
    public class While: Process
    {
        public Process Replicated { get; protected set; }

        protected While()
            : base()
        {
        }

        internal protected While(
            Definition.While            definition,
            Process                     parent,
            IDictionary<string, object> variables
            )
            : base(
                definition,
                parent,
                variables)
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
                if(Replicated != null &&
                   Replicated.Status == Status.Executed)
                        Replicated = null;

                var definition = Definition.As<Definition.While>();

                if(Replicated == null &&
                   definition.Condition.Evaluate(this))
                {
                    Replicated = definition.Replicated.New(this);
                    executionService.Execute(Replicated);
                }

                if(Replicated == null)
                    ChangeStatus(
                        executionService,
                        Status.Executed);
            }
        }
    }
}