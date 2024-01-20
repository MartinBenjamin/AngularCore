using CommonDomainObjects;
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
            Definition.SequenceBase definition,
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

                Definition.As<Definition.SequenceBase>().NewChildren(this).ToList();
                Children.ForEach(executionService.Save);
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
