using Process.Expression;
using System;

namespace Process.Definition
{
    public class IO: Process
    {
        public virtual IExpression<string> Channel { get; protected set; }

        public IO(
            IExpression<string> channel
            )
            : base()
        {
            Channel = channel;
        }

        public IO(
            string channel
            )
            : base()
        {
            Channel = new ConstantExpression<string>(channel);
        }

        protected IO(
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
            ) => new global::Process.IO(
                this,
                parent);
    }
}
