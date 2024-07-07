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

        void IRuntime.Input(
            ITuple    channel,
            in object value
            )
        {
            _synchronisationService.Resolve(channel).Inputs.First().Execute(
                this,
                value);
            Execute();
        }

        IEnumerable<IProcess> IRuntime.Inputs(
            ITuple channel
            ) => _synchronisationService.Resolve(channel)?.Inputs.Select(process => process.UltimateParent) ?? Enumerable.Empty<IProcess>();

        void IRuntime.Output(
            ITuple     channel,
            out object value
            )
        {
            _synchronisationService.Resolve(channel).Outputs.First().Execute(
                this,
                out value);
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
