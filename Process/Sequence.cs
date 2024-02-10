using CommonDomainObjects;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Process
{
    public class Sequence: Process
    {
        protected Sequence()
            : base()
        {
        }

        internal protected Sequence(
            Guid                        id,
            Definition.SequenceBase     definition,
            Process                     parent,
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
            if(Status == Status.NotExecuted)
            {
                ChangeStatus(
                    executionService,
                    Status.Executing);

                _ = Definition.As<Definition.SequenceBase>().NewChildren(
                    executionService,
                    this);
            }

            if(Status == Status.Executing)
            {
                var current = Children.FirstOrDefault(child => child.Status != Status.Executed);
                if(current == null)
                    ChangeStatus(
                        executionService,
                        Status.Executed);

                else if(current.Status == Status.NotExecuted)
                    executionService.Execute(current);
            }
        }
    }
}
