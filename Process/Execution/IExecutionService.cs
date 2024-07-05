using Process.Definition;
using System.Collections.Generic;

namespace Process.Execution
{

    public delegate void Trace(
        Channel channel,
        object  value);

    public interface IExecutionService
    {
        public Trace Trace { get; set; }

        ISynchronisationService SynchronisationService { get; }

        void Execute(IExecutable executable);

        IProcess Replay(
            Definition.IProcess                                          definition,
            IReadOnlyList<(bool Input, Channel Channel, object Message)> trace);
    }
}
