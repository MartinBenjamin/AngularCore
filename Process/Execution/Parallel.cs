using CommonDomainObjects;
using System.Collections.Generic;
using System.Linq;

namespace Process.Execution
{
    public abstract class ParallelBase: Process
    {
        protected ParallelBase(
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

                NewChildren(executionService);
                Children.ForEach(executionService.Execute);
            }

            if(Status == Status.Executing &&
               Children.All(child => child.Status == Status.Executed))
                ChangeStatus(
                    executionService,
                    Status.Executed);
        }

        protected abstract void NewChildren(IExecutionService executionService);
    }

    public class Parallel: ParallelBase
    {
        private readonly Definition.Parallel _definition;

        public Parallel(
            Definition.Parallel         definition,
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

    public class ParallelForEach: ParallelBase
    {
        private readonly Definition.ParallelForEach _definition;

        public ParallelForEach(
            Definition.ParallelForEach  definition,
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
