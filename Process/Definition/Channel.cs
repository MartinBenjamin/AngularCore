using Process.Expression;
using System;

namespace Process.Definition
{
    public class Channel
    {
        public IExpression<string> Name { get; protected set; }
        public Type                Type { get; protected set; }

        public Channel(
            IExpression<string> name,
            Type                type = null
            )
        {
            Name = name;
            Type = type;
        }

        public global::Process.Channel New(
            global::Process.IO io
            ) => new global::Process.Channel(
                Name.Evaluate(io),
                Type);
    }
}
