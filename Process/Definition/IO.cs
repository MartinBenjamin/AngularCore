using System;

namespace Process.Definition
{
    public class IO: Process
    {
        public virtual string                                Channel           { get; protected set; }
        public virtual Func<global::Process.Process, string> ChannelExpression { get; protected set; }

        public IO(
            string channel
            )
            : base()
        {
            Channel = channel;
        }

        public IO(
            Func<global::Process.Process, string> channelExpression
            )
            : base()
        {
            ChannelExpression = channelExpression;
        }

        protected IO(
            Guid id
            )
            : base(id)
        {
        }

        public string GetChannel(
            global::Process.Process process
            ) => Channel ?? ChannelExpression(process);

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
