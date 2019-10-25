using System;

namespace Process.Definition
{
    public abstract class Alternative: Process
    {
        protected Alternative()
            : base()
        {
        }

        protected Alternative(
            Guid id
            )
            : base(id)
        {
        }
    }
}
