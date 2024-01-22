using Process.Expression;
using System;

namespace Process.Definition
{
    public class Input: IO
    {
        public Type   Type           { get; protected set; }
        public string TargetVariable { get; protected set; }

        public Input(
            IExpression<string> channel,
            Type                type,
            string              targetVariable
            )
            : base(channel)
        {
            Type           = type;
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
            ) => new global::Process.Input(
                this,
                parent);
    }
}
