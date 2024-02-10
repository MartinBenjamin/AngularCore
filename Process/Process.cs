using CommonDomainObjects;
using Process.Expression;
using System;
using System.Collections;
using System.Collections.Generic;

namespace Process
{
    public abstract class Process:
        DomainObject<Guid>,
        IExecutable,
        IScope,
        IEnumerable<Process>
    {
        public virtual Status             Status     { get; protected set; }
        public virtual Definition.Process Definition { get; protected set; }
        public virtual Process            Parent     { get; protected set; }
        public virtual IList<Process>     Children   { get; protected set; }

        private IDictionary<string, object> _variables;

        protected Process()
            : base()
        {
        }

        protected Process(
            Definition.Process          definition,
            Process                     parent,
            IDictionary<string, object> variables
            )
            : base(Guid.NewGuid())
        {
            Children   = new List<Process>();
            Definition = definition;
            Parent     = parent;
            _variables = variables;
            Parent?.Children.Add(this);
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

        public override string ToString() => string.Format(
                "{0}: {1}",
                GetType().Name,
                Status);

        void IExecutable.Execute(
            IExecutionService executionService
            )
        {
            Execute(executionService);
        }

        public object this[
            string variable
            ]
        {
            get => _variables != null && _variables.TryGetValue(variable, out var value) ? value : Parent?[variable];
            set
            {
                _variables ??= new Dictionary<string, object>();
                _variables[variable] = value;
            }
        }

        protected abstract void Execute(IExecutionService executionService);

        public IEnumerator<Process> GetEnumerator()
        {
            yield return this;
            foreach(var child in Children)
                foreach(var process in child)
                    yield return process;
        }

        IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
    }
}
