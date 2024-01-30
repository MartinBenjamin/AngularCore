using Process.Expression;
using System.Collections.Generic;

namespace Process.Definition
{
    public class Output: IO
    {
        public IExpression<object> Source { get; protected set; }

        public Output(
            Channel             channel,
            IExpression<object> source
            )
            : base(channel)
        {
            Source = source;
        }

        public override bool Accept(
            IVisitor visitor
            ) => visitor.Enter(this);

        public override global::Process.Process New(
            global::Process.Process     parent,
            IDictionary<string, object> variables = null
            ) => new global::Process.Output(
                this,
                parent,
                variables);
    }
}
