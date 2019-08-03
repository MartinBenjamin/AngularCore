using System.Collections.Generic;
using System.Linq;

namespace CommonDomainObjects.Process
{
    public class Sequence: Process
    {
        public virtual IList<Process> Children { get; protected set; }

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

                var children = Definition.As<Definition.SequenceBase>().NewChildren(this).ToList();
                Children = children;
                children.ForEach(executionService.Save);
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
