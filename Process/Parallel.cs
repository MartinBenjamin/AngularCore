using CommonDomainObjects;
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

                Definition.As<Definition.ParallelBase>().NewChildren(this).ToList();
                Children.ForEach(executionService.Save);
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
