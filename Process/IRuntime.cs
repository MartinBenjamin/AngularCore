using System.Collections.Generic;
using System.Runtime.CompilerServices;

namespace Process
{
    public interface IRuntime
    {
        IProcess Run(
            Definition.IProcess         definition,
            IDictionary<string, object> variables = null);
        IEnumerable<IProcess> Inputs(ITuple channel);
        IEnumerable<IProcess> Outputs(ITuple channel);
        void Input(ITuple channel, in object value);
        void Output(ITuple channel, out object value);
    }
}
