using System;

namespace Process.Definition
{
    public abstract class IO: Process
    {
        protected IO()
            : base()
        {
        }

        protected IO(
            Guid id
            )
            : base(id)
        {
        }
    }
}
