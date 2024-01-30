using System;
using System.Collections.Generic;

namespace Process.Definition
{
    public class IO: Process
    {
        public virtual Channel Channel { get; protected set; }

        public IO(
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

        public override bool Accept(
            IVisitor visitor
            ) => visitor.Enter(this);

        public override global::Process.Process New(
            global::Process.Process     parent,
            IDictionary<string, object> variables = null
            ) => new global::Process.IO(
                this,
                parent,
                variables);
    }
}
