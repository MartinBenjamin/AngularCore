using Process.Expression;
using System;

namespace Process.Definition
{
    public abstract class IO: Process
    {
        public virtual IExpression<Channel> Channel { get; protected set; }

        protected IO(
            IExpression<Channel> channel
            )
            : base()
        {
            Channel = channel;
        }

        protected IO(
            Guid id
            )
            : base(id)
        {
        }
    }
}
