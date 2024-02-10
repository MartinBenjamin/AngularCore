using CommonDomainObjects;
using System.Collections.Generic;
using System.Linq;

namespace Process
{
    public class Parallel: Process
    {
        protected Parallel()
            : base()
        {
        }

        internal protected Parallel(
            Definition.ParallelBase     definition,
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
            {
                ChangeStatus(
                    executionService,
                    Status.Executing);

                _ = Definition.As<Definition.ParallelBase>().NewChildren(this);
                Children.ForEach(executionService.Execute);
            }

            if(Status == Status.Executing &&
               Children.All(child => child.Status == Status.Executed))
                ChangeStatus(
                    executionService,
                    Status.Executed);
        }
    }
}
