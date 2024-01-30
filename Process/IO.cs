﻿using CommonDomainObjects;
using System.Collections.Generic;

namespace Process
{
    public class IO: Process
    {
        public virtual Channel Channel { get; protected set; }

        protected IO()
            : base()
        {
        }

        public IO(
            Definition.Process          definition,
            Process                     parent,
            IDictionary<string, object> variables
            )
            : base(
                definition,
                parent,
                variables)
        {
            var channelDefinition = ((Definition.IO)definition).Channel;
            Channel = channelDefinition.New(this);
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

        public virtual void ExecuteIO(
            IExecutionService executionService
            )
        {
            if(Status != Status.Waiting)
                throw new InvalidStateException();

            ChangeStatus(
                executionService,
                Status.Executed);
        }

        protected virtual void Register(
            IExecutionService executionService
            )
        {
        }

        protected virtual void Deregister(
            IExecutionService executionService
            )
        {
        }
    }
}
