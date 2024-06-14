using System;
using System.Collections.Generic;

namespace Process
{
    public class ExecutionService: IExecutionService
    {
        private readonly ISynchronisationService _synchronisationService = new SynchronisationService();
        private readonly Queue<IExecutable>      _queue = new();
        private          int                     _entered;

        Trace IExecutionService.Trace { get; set; }

        Guid IIdService<Guid>.NewId() => Guid.NewGuid();

        Definition.ISelector<Func<Process, IDictionary<string, object>, Process>> IExecutionService.Constructor => new Constructor(this);

        ISynchronisationService IExecutionService.SynchronisationService => _synchronisationService;

        void IExecutionService.Execute(
            IExecutable executable
            )
        {
            try
            {
                _entered += 1;
                _queue.Enqueue(executable);
                if(_entered == 1)
                    while(_queue.Count > 0)
                    {
                        _queue.Peek().Execute(this);
                        _queue.Dequeue();
                    }
            }
            finally
            {
                _entered -= 1;
            }
        }
    }
}
