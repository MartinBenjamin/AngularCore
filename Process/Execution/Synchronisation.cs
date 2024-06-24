using System;
using System.Collections.Generic;

namespace Process.Execution
{
    public class Synchronisation: IExecutable
    {
        private readonly Definition.Channel _channel;
        private readonly IList<Input >       _inputs  = new List<Input >();
        private readonly IList<Output>       _outputs = new List<Output>();

        public Synchronisation(
            Definition.Channel channel
            )
        {
            _channel = channel;
        }

        public IReadOnlyCollection<Input> Inputs => _inputs.AsReadOnly();

        public IReadOnlyCollection<Output> Outputs => _outputs.AsReadOnly();

        public int SyncCount => Math.Min(_inputs.Count, _outputs.Count);

        public void Register(
            IExecutionService executionService,
            Input             input
            )
        {
            var previousSyncCount = SyncCount;
            if(!_inputs.Contains(input))
                _inputs.Add(input);

            if(previousSyncCount == 0 && SyncCount > 0)
                executionService.Execute(this);
        }

        public void Register(
            IExecutionService executionService,
            Output            output
            )
        {
            var previousSyncCount = SyncCount;
            if(!_outputs.Contains(output))
                _outputs.Add(output);

            if(previousSyncCount == 0 && SyncCount > 0)
                executionService.Execute(this);
        }

        public void Deregister(
            Input input
            ) => _inputs.Remove(input);

        public void Deregister(
            Output output
            ) => _outputs.Remove(output);

        void IExecutable.Execute(
            IExecutionService executionService
            )
        {
            while(SyncCount > 0)
            {
                var output = _outputs[0];
                var input = _inputs[0];
                var message = output.ExecuteOutput(executionService);
                executionService.Trace?.Invoke(
                    _channel,
                    message);
                input.Executelnput(
                    executionService,
                    message);
                output.UltimateParent.Trace.Add((false, _channel, message));
                input.UltimateParent.Trace.Add((true, _channel, message));
            }
        }
    }
}
