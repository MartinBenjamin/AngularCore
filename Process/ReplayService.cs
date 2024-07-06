using System.Collections.Generic;
using System.Linq;

namespace Process
{
    using Execution;
    using System.Runtime.CompilerServices;

    internal class ReplayService: IExecutionService
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
            if(executable is Synchronisation)
                return;

            _queue.Enqueue(executable);
        }

        public void Replay(
            Definition.Process                                          definition,
            IReadOnlyList<(bool Input, ITuple Channel, object Message)> trace
            )
        {
        }

        IProcess IExecutionService.Replay(Definition.IProcess definition, IReadOnlyList<(bool Input, ITuple Channel, object Message)> trace)
        {
            throw new System.NotImplementedException();
        }
    }
}
