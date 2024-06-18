using System;
using System.Collections.Generic;
using System.Linq;

namespace Process
{
    public class Synchronisation: IExecutable
    {
        private readonly Definition.Channel _channel;
        private readonly ISet<Input >       _inputs  = new HashSet<Input >();
        private readonly ISet<Output>       _outputs = new HashSet<Output>();

        public Synchronisation(
            Definition.Channel channel
            )
        {
            _channel = channel;
        }

        public int InputCount => _inputs.Count;

        public int OutputCount => _outputs.Count;

        public int SyncCount
        {
            get => Math.Min(InputCount, OutputCount);
        }

        public void Register(
            IExecutionService executionService,
            Input             input
            )
        {
            var previousSyncCount = SyncCount;
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
                var output = _outputs.First();
                var input = _inputs.First();
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
