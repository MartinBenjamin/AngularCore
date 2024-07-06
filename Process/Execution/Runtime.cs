using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;

namespace Process.Execution
{
    public class Runtime:
        IExecutionService,
        IRuntime
    {
        private readonly ISynchronisationService _synchronisationService = new SynchronisationService();
        private          Queue<IExecutable>      _queue = new();

        Trace IExecutionService.Trace { get; set; }

        ISynchronisationService IExecutionService.SynchronisationService => _synchronisationService;

        void IExecutionService.Execute(
            IExecutable executable
            )
        {
            _queue.Enqueue(executable);
        }

        IProcess IExecutionService.Replay(
            Definition.IProcess                                         definition,
            IReadOnlyList<(bool Input, ITuple Channel, object Message)> trace
            )
        {
            var process = definition.Select(Constructor.Instance)(
                null,
                null);

            var current = _queue;
            _queue = new Queue<IExecutable>();
            _queue.Enqueue(process);
            var synchronisations = new HashSet<Synchronisation>();
            foreach(var item in trace)
            {
                while(_queue.Count > 0)
                {
                    var executable = _queue.Dequeue();
                    if(executable is Synchronisation)
                        synchronisations.Add((Synchronisation)executable);

                    else
                        executable.Execute(this);
                }

                var synchronisation = _synchronisationService.Resolve(item.Channel);

                if(item.Input)
                    synchronisation.Inputs.Single(next => next.UltimateParent == process).Execute(
                        this,
                        item.Message);

                else
                    synchronisation.Outputs.Single(next => next.UltimateParent == process).Execute(
                        this,
                        out object message);
            }

            while(_queue.Count > 0)
            {
                var executable = _queue.Dequeue();
                if(executable is Synchronisation)
                    synchronisations.Add((Synchronisation)executable);

                else
                    executable.Execute(this);
            }

            _queue = current;

            foreach(var synchronisation in synchronisations)
                if(synchronisation.SyncCount > 0 && !_queue.Contains(synchronisation))
                    _queue.Enqueue(synchronisation);

            return process;
        }

        void IRuntime.Input(
            ITuple    channel,
            in object input
            )
        {
            _synchronisationService.Resolve(channel).Inputs.First().Execute(
                this,
                input);
            Execute();
        }

        IEnumerable<IProcess> IRuntime.Inputs(
            ITuple channel
            ) => _synchronisationService.Resolve(channel)?.Inputs.Select(process => process.UltimateParent) ?? Enumerable.Empty<IProcess>();

        void IRuntime.Output(
            ITuple     channel,
            out object output
            )
        {
            _synchronisationService.Resolve(channel).Outputs.First().Execute(
                this,
                out output);
            Execute();
        }

        IEnumerable<IProcess> IRuntime.Outputs(
            ITuple channel
            ) => _synchronisationService.Resolve(channel)?.Outputs.Select(process => process.UltimateParent) ?? Enumerable.Empty<IProcess>();

        IProcess IRuntime.Run(
            Definition.IProcess         definition,
            IDictionary<string, object> variables
            )
        {
            var process = definition.Select(Constructor.Instance)(
                null,
                variables);
            _queue.Enqueue(process);
            Execute();
            return process;
        }

        private void Execute()
        {
            while(_queue.Count > 0)
            {
                _queue.Peek().Execute(this);
                _queue.Dequeue();
            }
        }
    }
}
