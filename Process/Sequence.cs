using System;
using System.Collections.Generic;
using System.Linq;

namespace Process
{
    public abstract class SequenceBase: Process
    {
        protected SequenceBase(
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

        public Sequence(
            Guid                        id,
            Definition.Sequence         definition,
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

        protected override void NewChildren(
            IExecutionService executionService
            ) => _definition.Children.Select(child => child.Select(executionService.Constructor)(
                this,
                null)).ToList();
    }

    public class SequenceForEach: SequenceBase
    {
        private readonly Definition.SequenceForEach _definition;

        public SequenceForEach(
            Guid                        id,
            Definition.SequenceForEach  definition,
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

        protected override void NewChildren(
            IExecutionService executionService
            ) => _definition.Variables(this).Select(variables => _definition.Replicated.Select(executionService.Constructor)(
                this,
                null)).ToList();
    }
}
