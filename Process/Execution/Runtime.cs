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
        private readonly Queue<IExecutable>      _queue = new();
        private          int                     _entered;

        Trace IExecutionService.Trace { get; set; }

        ISynchronisationService IExecutionService.SynchronisationService => _synchronisationService;

        public void Execute(
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
        

        IProcess IExecutionService.Replay(
            Definition.IProcess                                         definition,
            IReadOnlyList<(bool Input, ITuple Channel, object Message)> trace
            )
        {
            var process = definition.Select(Constructor.Instance)(
                null,
                null);

            throw new System.NotImplementedException();
        }

        void IRuntime.Input(
            ITuple channel,
            object value
            ) => _synchronisationService.Resolve(channel).Inputs.First().Executelnput(
                this,
                value);

        IEnumerable<IProcess> IRuntime.Inputs(
            ITuple channel
            ) => _synchronisationService.Resolve(channel)?.Inputs.Select(process => process.UltimateParent) ?? Enumerable.Empty<IProcess>();

        object IRuntime.Output(
            ITuple channel
            ) => _synchronisationService.Resolve(channel).Outputs.First().ExecuteOutput(this);

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
            Execute(process);
            return process;
        }
    }
}
