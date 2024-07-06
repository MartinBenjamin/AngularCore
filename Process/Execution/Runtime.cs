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
            var synchronisations = new HashSet<Synchronisation>();
            _queue.Enqueue(process);
            while(_queue.Count > 0)
            {
                var executable = _queue.Dequeue();
                if(executable is Synchronisation)
                    synchronisations.Add((Synchronisation)executable);

                else
                    executable.Execute(this);
            }

            foreach(var item in trace)
            {
                var synchronisation = _synchronisationService.Resolve(item.Channel);
                if(item == trace.Last())
                    _queue = current;

                if(item.Input)
                    synchronisation.Inputs.Single(next => next.UltimateParent == process).Executelnput(
                        this,
                        item.Message);

                else
                    synchronisation.Outputs.Single(next => next.UltimateParent == process).ExecuteOutput(this);

                while(_queue.Count > 0)
                {
                    var executable = _queue.Dequeue();
                    if(executable is Synchronisation)
                        synchronisations.Add((Synchronisation)executable);

                    else
                        executable.Execute(this);
                }
            }
           
            foreach(var synchronisation in synchronisations)
                if(synchronisation.SyncCount > 0 && !_queue.Contains(synchronisation))
                    _queue.Enqueue(synchronisation);

            return process;
        }

        void IRuntime.Input(
            ITuple channel,
            object value
            )
        {
            _synchronisationService.Resolve(channel).Inputs.First().Executelnput(
                this,
                value);
            Execute();
        }

        IEnumerable<IProcess> IRuntime.Inputs(
            ITuple channel
            ) => _synchronisationService.Resolve(channel)?.Inputs.Select(process => process.UltimateParent) ?? Enumerable.Empty<IProcess>();

        object IRuntime.Output(
            ITuple channel
            )
        {
            var value = _synchronisationService.Resolve(channel).Outputs.First().ExecuteOutput(this);
            Execute();
            return value;
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
