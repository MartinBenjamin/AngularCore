using System;

namespace Process.Definition
{
    public abstract class Input: IO
    {
        protected Input()
            : base()
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
    }
}
