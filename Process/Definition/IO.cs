using Process.Expression;
using System;
using System.Linq.Expressions;

namespace Process.Definition
{
    public abstract class IO: Process
    {
        public virtual Expression<Func<IScope, Channel>> Channel { get; protected set; }

        protected IO(
            Expression<Func<IScope, Channel>> channel
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
