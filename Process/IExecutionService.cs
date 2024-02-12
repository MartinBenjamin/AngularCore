using Process.Definition;
using System;
using System.Collections.Generic;

namespace Process
{
    public interface IExecutionService: IIdService<Guid>
    {
        ISelector<Func<Process, IDictionary<string, object>, Process>> Constructor {  get; }

        ISynchronisationService SynchronisationService { get; }

        void Execute(IExecutable executable);
    }
}
