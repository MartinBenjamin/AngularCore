using System.Collections.Generic;
using System.Runtime.CompilerServices;

namespace Process.Execution
{
    public delegate void Trace(
        ITuple channel,
        object value);

    public interface IExecutionService
    {
        public Trace Trace { get; set; }

        ISynchronisationService SynchronisationService { get; }

        void Execute(IExecutable executable);
    }
}
