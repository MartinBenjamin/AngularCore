﻿using System.Collections.Generic;

namespace Process
{
    public class Output: IO
    {
        protected Output()
            : base()
        {
        }

        public Output(
            Definition.Output           definition,
            Process                     parent,
            IDictionary<string, object> variables
            )
            : base(
                definition,
                parent,
                variables)
        {
        }

        public virtual object ExecuteOutput(
            IExecutionService executionService
            )
        {
            base.ExecuteIO(executionService);
            return ((Definition.Output)Definition).Source.Evaluate(this);
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
