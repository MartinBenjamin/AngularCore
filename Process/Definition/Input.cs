using Process.Expression;
using System;

namespace Process.Definition
{
    public class Input<TInput>: IO
    {
        public string TargetVariable { get; protected set; }

        public Input(
            IExpression<string> channel,
            string              targetVariable
            )
            : base(channel)
        {
            TargetVariable = targetVariable;
        }

        protected Input(
            Guid id
            )
            : base(id)
        {
        }

        public override bool Accept(
            IVisitor visitor
            ) => visitor.Enter(this);

        public override global::Process.Process New(
            global::Process.Process parent
            ) => new global::Process.Input<TInput>(
                this,
                parent);
    }
}
