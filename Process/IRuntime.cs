using System.Collections.Generic;

namespace Process
{
    public interface IRuntime
    {
        IProcess Run(
            Definition.IProcess         definition,
            IDictionary<string, object> variables = null);
        IEnumerable<IProcess> Inputs(Definition.Channel channel);
        IEnumerable<IProcess> Outputs(Definition.Channel channel);
        void Input(Definition.Channel channel, object value);
        object Output(Definition.Channel channel);
    }
}
