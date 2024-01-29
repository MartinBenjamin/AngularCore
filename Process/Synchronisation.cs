using System;
using System.Collections.Generic;
using System.Linq;

namespace Process
{
    public class Synchronisation: IExecutable
    {
        private ISet<Input > _inputs  = new HashSet<Input >();
        private ISet<Output> _outputs = new HashSet<Output>();

        public int SyncCount
        {
            get => Math.Min(_inputs.Count, _outputs.Count);
        }

        void Register(
            IExecutionService executionService,
            Input             input
            )
        {
            var previousSyncCount = SyncCount;
            _inputs.Add(input);

            if(previousSyncCount == 0 && SyncCount > 0)
                executionService.Execute(this);
        }

        void Register(
            IExecutionService executionService,
            Output            output
            )
        {
            var previousSyncCount = SyncCount;
            _outputs.Add(output);

            if(previousSyncCount == 0 && SyncCount > 0)
                executionService.Execute(this);
        }

        void Deregister(
            Input input
            ) => _inputs.Remove(input);

        void Deregister(
            Output output
            ) => _outputs.Remove(output);

        void IExecutable.Execute(
            IExecutionService executionService
            )
        {
            var outputs = _outputs.ToArray();
            var inputs  = _inputs.ToArray();
            var count   = SyncCount;

            for(var index = 0;index < count;++index)
                inputs[index].Executelnput(
                    executionService,
                    outputs[index].ExecuteOutput(executionService));
        }
    }
}
