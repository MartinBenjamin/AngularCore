using CommonDomainObjects;
using System;
using System.Collections.Generic;

namespace Process
{
    public abstract class Process:
        DomainObject<Guid>,
        IExecutable
    {
        public virtual Status             Status         { get; protected set; }
        public virtual Definition.Process Definition     { get; protected set; }
        public virtual Process            Parent         { get; protected set; }
        public virtual Process            UltimateParent { get; protected set; }
        public virtual IList<Process>     Processes      { get; protected set; }

        protected Process()
            : base()
        {
        }

        protected Process(
            Definition.Process definition,
            Process            parent
            )
            : base(Guid.NewGuid())
        {
            Definition = definition;
            Parent     = parent;

            if(Parent == null)
            {
                Processes = new List<Process>();
                UltimateParent = this;
            }
            else
                UltimateParent = Parent.UltimateParent;

            UltimateParent.Processes.Add(this);
        }

        public virtual IEnumerable<Process> Scopes
        {
            get
            {
                var current = this;
                while(current != null)
                {
                    yield return current;
                    current = current.Parent;
                }
            }
        }

        protected virtual void ChangeStatus(
            IExecutionService executionService,
            Status            status
            )
        {
            var previousStatus = Status;
            Status = status;
            if(Status != previousStatus)
                switch(Status)
                {
                    case Status.Executing:
                        OnExecuting(executionService);
                        break;
                    case Status.Executed:
                        OnExecuted(executionService);
                        if(Parent != null)
                            executionService.Execute(Parent);
                        break;
                    default: break;
                }
        }

        protected virtual void OnExecuting(
            IExecutionService executionService
            )
        {
        }

        protected virtual void OnExecuted(
            IExecutionService executionService
            )
        {
        }

        public override string ToString()
        {
            return string.Format(
                "{0}: {1}",
                GetType().Name,
                Status);
        }

        void IExecutable.Execute(
            IExecutionService executionService
            )
        {
            Execute(executionService);
        }

        protected abstract void Execute(IExecutionService executionService);
    }
}
