using Process.Expression;
using System;

namespace Process.Definition
{
    public class Output: IO
    {
        public Type                Type   { get; protected set; }
        public IExpression<object> Source { get; protected set; }

        public Output(
            IExpression<string> channel,
            Type                type,
            IExpression<object> source
            )
            : base(channel)
        {
            Type   = type;
            Source = source;
        }

        public override bool Accept(
            IVisitor visitor
            ) => visitor.Enter(this);

        public override global::Process.Process New(
            global::Process.Process parent
            ) => new global::Process.Output(
                this,
                parent);
    }
}
