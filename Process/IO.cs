using CommonDomainObjects;
using System;
using System.Collections.Generic;

namespace Process
{
    public abstract class IO: Process
    {
        public virtual Definition.Channel Channel { get; protected set; }

        protected IO(
            Guid                        id,
            Definition.IO               definition,
            Process                     parent,
            IDictionary<string, object> variables
            )
            : base(id,
                definition,
                parent,
                variables)
        {
            Channel = definition.Channel.Evaluate(this);
        }

        protected override void Execute(
            IExecutionService executionService
            )
        {
            if(Status == Status.NotExecuted)
                ChangeStatus(
                    executionService,
                    Status.Waiting);
        }

        protected override void ChangeStatus(
            IExecutionService executionService,
            Status            status
            )
        {
            if(status != Status)
                if(status == Status.Waiting)
                    Register(executionService);

                else if(Status == Status.Waiting)
                    Deregister(executionService);

            if(status == Status.Executed)
            {
                var guardedProcess = Parent.As<GuardedProcess>();
                if(guardedProcess != null &&
                   guardedProcess.Guard == this)
                {
                    var choice = guardedProcess.Parent.As<Choice>();
                    while(choice.Parent != null && choice.Parent.Is<Choice>())
                        choice = choice.Parent.As<Choice>();

                    choice.Choose(
                        executionService,
                        guardedProcess);
                }
            }

            base.ChangeStatus(
                executionService,
                status);
        }

        internal void Skip(
            IExecutionService executionService
            )
        {
            ChangeStatus(
                executionService,
                Status.Skipped);
        }

        protected abstract void Register  (IExecutionService executionService);
        protected abstract void Deregister(IExecutionService executionService);
    }
}
