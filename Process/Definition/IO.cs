using System;

namespace Process.Definition
{
    public abstract class IO: Process
    {
        public virtual Channel Channel { get; protected set; }

        protected IO(
            Channel channel
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
