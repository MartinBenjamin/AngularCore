using System;

namespace Process.Definition
{
    public class Input<TInput>: IO
    {
        public string Target { get; protected set; }

        public Input(
            string channel,
            string target
            )
            : base(channel)
        {
            Target = target;
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
