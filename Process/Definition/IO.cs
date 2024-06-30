using System;

namespace Process.Definition
{
    public abstract class IO:
        Process,
        ISubprocess
    {
        public virtual Func<IScope, Channel> Channel { get; protected set; }

        protected IO(
            Func<IScope, Channel> channel
            )
            : base()
        {
            Channel = channel;
        }
    }
}
