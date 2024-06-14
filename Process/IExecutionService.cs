using Process.Definition;
using System;
using System.Collections.Generic;

namespace Process
{

    public delegate void Trace(
        Channel channel,
        object  value);

    public interface IExecutionService: IIdService<Guid>
    {
        public Trace Trace { get; set; }

        ISelector<Func<Process, IDictionary<string, object>, Process>> Constructor {  get; }

        ISynchronisationService SynchronisationService { get; }

        void Execute(IExecutable executable);
    }
}
