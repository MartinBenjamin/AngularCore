using System;
using System.Collections.Generic;

namespace Process
{
    public class Input: IO
    {
        public Input(
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
        }

        public virtual void Executelnput(
            IExecutionService executionService,
            object            input
            )
        {
            if(Status != Status.Waiting)
                throw new InvalidStateException();

            (Parent??this)[((Definition.Input)Definition).TargetVariable] = input;

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
