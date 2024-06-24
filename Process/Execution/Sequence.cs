using System.Collections.Generic;
using System.Linq;

namespace Process.Execution
{
    public abstract class SequenceBase: Process
    {
        protected SequenceBase(
            Definition.SequenceBase     definition,
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

                NewChildren(executionService);
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

        protected abstract void NewChildren(IExecutionService executionService);
    }

    public class Sequence: SequenceBase
    {
        private readonly Definition.Sequence _definition;

        internal protected Sequence(
            Definition.Sequence         definition,
            Process                     parent,
            IDictionary<string, object> variables
            )
            : base(
                definition,
                parent,
                variables)
        {
            _definition = definition;
        }

        protected override void NewChildren(
            IExecutionService executionService
            ) => _definition.Children.Select(child => child.Select(Constructor.Instance)(
                this,
                null)).ToList();
    }

    public class SequenceForEach: SequenceBase
    {
        private readonly Definition.SequenceForEach _definition;

        public SequenceForEach(
            Definition.SequenceForEach  definition,
            Process                     parent,
            IDictionary<string, object> variables
            )
            : base(
                definition,
                parent,
                variables)
        {
            _definition = definition;
        }

        protected override void NewChildren(
            IExecutionService executionService
            ) => _definition.Variables(this).Select(variables => _definition.Replicated.Select(Constructor.Instance)(
                this,
                null)).ToList();
    }
}
