using System;

namespace Process.Definition
{
    public class IO: Process
    {
        public virtual string Channel { get; protected set; }

        public IO(
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
