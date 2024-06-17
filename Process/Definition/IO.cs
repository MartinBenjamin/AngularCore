using System;

namespace Process.Definition
{
    public abstract class IO: Process
    {
        public virtual Func<IScope, Channel> Channel { get; protected set; }

        protected IO(
            Func<IScope, Channel> channel
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
