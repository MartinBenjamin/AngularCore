using System;

namespace Process.Definition
{
    public abstract class Composite: Process
    {
        protected Composite()
            : base()
        {
        }

        protected Composite(
            Guid id
            )
            : base(id)
        {
        }
    }
}
