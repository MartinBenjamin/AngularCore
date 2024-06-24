using Process.Definition;
using System.Collections;
using System.Collections.Generic;

namespace Process.Execution
{
    public abstract class Process:
        IProcess,
        IExecutable,
        IScope,
        IEnumerable<Process>
    {
        public Status                         Status         { get; private set; }
        public Definition.Process             Definition     { get; private set; }
        public Process                        Parent         { get; private set; }
        public Process                        UltimateParent { get; private set; }
        public IList<Process>                 Children       { get; private set; }
        public IList<(bool, Channel, object)> Trace          { get; private set; }

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
        {
            Children       = new List<Process>();
            Definition     = definition;
            Parent         = parent;
            UltimateParent = Parent?.UltimateParent ?? this;
            _variables     = variables;
            Parent?.Children.Add(this);

            if(UltimateParent == this)
                Trace = new List<(bool, Channel, object)>();
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

        public IScope DeclaringScope(
            string variable
            ) => _variables != null && _variables.ContainsKey(variable) ? this : Parent?.DeclaringScope(variable);

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
