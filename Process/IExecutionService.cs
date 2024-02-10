using Process.Definition;
using System;

namespace Process
{
    public interface IExecutionService: IIdService<Guid>
    {
        ISynchronisationService SynchronisationService { get; }

        void Execute(IExecutable executable);
    }
}
