using System;

namespace Process.Definition
{
    public class GuardedProcess:
        Process,
        IAlternative
    {
        public Func<IScope, bool> GuardExpression { get; protected set; }
        public IIO                Guard           { get; protected set; }
        public ISubprocess        Guarded         { get; protected set; }

        public GuardedProcess(
            Func<IScope, bool> guardExpression,
            IIO                guard,
            ISubprocess        guarded
            )
            : base()
        {
            GuardExpression = guardExpression;
            Guard           = guard;
            Guarded         = guarded;
        }

        public GuardedProcess(
            IIO         guard,
            ISubprocess guarded = null
            )
            : this(
                null,
                guard,
                guarded)
        {
        }

        public override void Accept(
            IVisitor visitor
            ) => visitor.Visit(this);

        public override TResult Select<TResult>(
            ISelector<TResult> selector
            ) => selector.Select(this);
    }
}
