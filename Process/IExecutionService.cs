using Process.Definition;
using System;

namespace Process
{

    public delegate void Trace(
        Channel channel,
        object  value);

    public interface IExecutionService: IIdService<Guid>
    {
        public Trace Trace { get; set; }

        ISynchronisationService SynchronisationService { get; }

        void Execute(IExecutable executable);
    }
}
