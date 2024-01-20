using System;

namespace Process.Definition
{
    public abstract class IO: Process
    {
        public virtual string Channel { get; protected set; }
        public virtual string Key     { get; protected set; }

        protected IO(
            string channel,
            string key = null
            )
            : base()
        {
            Channel = channel;
            Key     = key;
        }

        protected IO(
            Guid id
            )
            : base(id)
        {
        }
    }
}
