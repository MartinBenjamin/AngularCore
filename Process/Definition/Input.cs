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
    }
}
