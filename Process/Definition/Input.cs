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

    public class Input<TInput>: IO
    {
        public Input(
            string channel,
            string key
            )
            : base(
                channel,
                key)
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
            ) => new global::Process.Input<TInput>(
                this,
                parent);
    }
}
