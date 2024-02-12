using System;
using System.Collections.Generic;

namespace Process
{
    public class Input: IO
    {
        private readonly Definition.Input _definition;

        internal protected Input(
            Guid                        id,
            Definition.Input            definition,
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

        public virtual void Executelnput(
            IExecutionService executionService,
            object            input
            )
        {
            if(Status != Status.Waiting)
                throw new InvalidStateException();

            (Parent??this)[_definition.TargetVariable] = input;

            ChangeStatus(
                executionService,
                Status.Executed);
        }

        protected override void Register(
            IExecutionService executionService
            ) => executionService.SynchronisationService.Resolve(Channel).Register(
            executionService,
            this);

        protected override void Deregister(
            IExecutionService executionService
            ) => executionService.SynchronisationService.Resolve(Channel).Deregister(this);
    }
}
