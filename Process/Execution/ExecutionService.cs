﻿using System.Collections.Generic;
using System.Runtime.CompilerServices;

namespace Process.Execution
{
    public class ExecutionService: IExecutionService
    {
        private readonly ISynchronisationService _synchronisationService = new SynchronisationService();
        private readonly Queue<IExecutable>      _queue = new();
        private          int                     _entered;

        Trace IExecutionService.Trace { get; set; }

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
