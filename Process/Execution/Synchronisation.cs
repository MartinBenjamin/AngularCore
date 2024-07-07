using Process.Definition;
using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;

namespace Process.Execution
{
    public class Synchronisation: IExecutable
    {
        private readonly ITuple        _channel;
        private readonly IList<Input > _inputs  = new List<Input >();
        private readonly IList<Output> _outputs = new List<Output>();

        public Synchronisation(
            ITuple channel 
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
                if(output.Parent != null && output.Parent.Definition is InfinitelyReplicated outputDefinition)
                {
                    var guardedProcess = new GuardedProcess(
                        outputDefinition,
                        null,
                        null);
                    ((IExecutable)guardedProcess).Execute(executionService);
                    output = (Output)guardedProcess.Guard;
                }
                if(input.Parent != null && input.Parent.Definition is InfinitelyReplicated inputDefinition)
                {
                    var guardedProcess = new GuardedProcess(
                        inputDefinition,
                        null,
                        null);
                    ((IExecutable)guardedProcess).Execute(executionService);
                    input = (Input)guardedProcess.Guard;
                }
                output.Execute(
                    executionService,
                    out object message);
                input.Execute(
                    executionService,
                    message);
                executionService.Trace?.Invoke(
                    _channel,
                    message);
                output.UltimateParent.Trace.Add((false, _channel, message));
                input.UltimateParent.Trace.Add((true, _channel, message));
            }
        }
    }
}
