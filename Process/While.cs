using System;
using System.Collections.Generic;

namespace Process
{
    public class While: Process
    {
        private readonly Definition.While _definition;

        public Process Replicated { get; protected set; }

        internal protected While(
            Guid                        id,
            Definition.While            definition,
            Process                     parent,
            IDictionary<string, object> variables
            )
            : base(
                id,
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
                ChangeStatus(
                    executionService,
                    Status.Executing);

            if(Status == Status.Executing)
            {
                if(Replicated != null &&
                   Replicated.Status == Status.Executed)
                        Replicated = null;

                if(Replicated == null &&
                   _definition.Condition.Evaluate(this))
                {
                    Replicated = _definition.Replicated.Select(executionService.Constructor)(
                        this,
                        null);
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