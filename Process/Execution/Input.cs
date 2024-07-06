using System.Collections.Generic;

namespace Process.Execution
{
    public class Input: IO
    {
        private readonly Definition.Input _definition;

        internal protected Input(
            Definition.Input            definition,
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

        public virtual void Execute(
            IExecutionService executionService,
            in object         value
            )
        {
            if(Status != Status.Waiting)
                throw new InvalidStateException();

            var scope = DeclaringScope(_definition.TargetVariable) ?? Parent ?? this;
            if(scope != null)
                scope[_definition.TargetVariable] = value;

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
