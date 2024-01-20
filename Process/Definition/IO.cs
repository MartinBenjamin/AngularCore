using System;

namespace Process.Definition
{
    public abstract class IO: Process
    {
        public virtual string Channel { get; protected set; }

        protected IO(
            string channel
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
