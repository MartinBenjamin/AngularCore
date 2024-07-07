using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;

namespace Process.Execution
{
    internal class ReplayService : IExecutionService
    {
        private readonly ISynchronisationService _synchronisationService;
        private readonly Queue<IExecutable>      _queue = new();

        public ReplayService(
            ISynchronisationService synchronisationService
            )
        {
            _synchronisationService = synchronisationService;
        }

        Trace IExecutionService.Trace { get; set; }

        ISynchronisationService IExecutionService.SynchronisationService => _synchronisationService;

        void IExecutionService.Execute(
            IExecutable executable
            )
        {
            _queue.Enqueue(executable);
        }

        public ValueTuple<Process, IEnumerable<Synchronisation>> Replay(
            Definition.Process definition,
            IReadOnlyList<(bool Input, ITuple Channel, object Message)> trace = null
            )
        {
            var process = definition.Select(Constructor.Instance)(
                null,
                null);

            var synchronisations = new HashSet<Synchronisation>();
            if (trace != null)
                foreach (var item in trace)
                {
                    while (_queue.Count > 0)
                    {
                        var executable = _queue.Dequeue();
                        if (executable is Synchronisation sync)
                            synchronisations.Add(sync);

                        else
                            executable.Execute(this);
                    }

                    var synchronisation = _synchronisationService.Resolve(item.Channel);

                    if (item.Input)
                        synchronisation.Inputs.Single(next => next.UltimateParent == process).Execute(
                            this,
                            item.Message);

                    else
                        synchronisation.Outputs.Single(next => next.UltimateParent == process).Execute(
                            this,
                            out object message);
                }

            while (_queue.Count > 0)
            {
                var executable = _queue.Dequeue();
                if (executable is Synchronisation sync)
                    synchronisations.Add(sync);

                else
                    executable.Execute(this);
            }

            return (process, synchronisations.Where(synchronisation => synchronisation.SyncCount > 0));
        }
    }
}
