﻿using System;
using System.Collections.Generic;

namespace Process
{
    public class Output: IO
    {
        private readonly Definition.Output _definition;

        internal protected Output(
            Guid                        id,
            Definition.Output           definition,
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

        public virtual object ExecuteOutput(
            IExecutionService executionService
            )
        {
            if(Status != Status.Waiting)
                throw new InvalidStateException();

            ChangeStatus(
                executionService,
                Status.Executed);

            return _definition.Source.Evaluate(this);
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
