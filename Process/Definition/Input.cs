using System;

namespace Process.Definition
{
    public class Input: IO
    {
        public Input(
            string channel
            )
            : base(channel)
        {
        }

        protected Input(
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
            ) => new global::Process.Input(
                this,
                parent);
    }
}
