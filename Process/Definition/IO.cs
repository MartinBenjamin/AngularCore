using System;
using System.Runtime.CompilerServices;

namespace Process.Definition
{
    public abstract class IO:
        Process,
        IIO
    {
        public virtual Func<IScope, ITuple> Channel { get; protected set; }

        protected IO(
            Func<IScope, ITuple> channel
            )
            : base()
        {
            Channel = channel;
        }
    }
}
