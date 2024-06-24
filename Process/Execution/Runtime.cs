using Process.Definition;
using System.Collections.Generic;
using System.Linq;

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

        void IRuntime.Input(
            Channel channel,
            object  value
            ) => _synchronisationService.Resolve(channel).Inputs.First().Executelnput(
                this,
                value);

        IEnumerable<IProcess> IRuntime.Inputs(
            Channel channel
            ) => _synchronisationService.Resolve(channel)?.Inputs.Select(process => process.UltimateParent) ?? Enumerable.Empty<IProcess>();

        object IRuntime.Output(
            Channel channel
            ) => _synchronisationService.Resolve(channel).Outputs.First().ExecuteOutput(this);

        IEnumerable<IProcess> IRuntime.Outputs(
            Channel channel
            ) => _synchronisationService.Resolve(channel)?.Outputs.Select(process => process.UltimateParent) ?? Enumerable.Empty<IProcess>();

        IProcess IRuntime.Run(
            Definition.Process definition
            )
        {
            var process = definition.Select(Constructor.Instance)(
                null,
                null);
            Execute(process);
            return process;
        }
    }
}
