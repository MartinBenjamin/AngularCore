using CommonDomainObjects;
using System.Collections.Generic;
using System.Linq;

namespace Process
{
    public class Parallel: Process
    {
        public virtual IList<Process> Children { get; protected set; }

        protected Parallel()
            : base()
        {
        }

        internal protected Parallel(
            Definition.ParallelBase definition,
            Process                 parent
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
            {
                ChangeStatus(
                    executionService,
                    Status.Executing);

                var children = Definition.As<Definition.ParallelBase>().NewChildren(this).ToList();
                Children = children;
                children.ForEach(executionService.Save);
                children.ForEach(executionService.Execute);
            }

            if(Status == Status.Executing &&
               Children.All(child => child.Status == Status.Executed))
                ChangeStatus(
                    executionService,
                    Status.Executed);
        }
    }
}
