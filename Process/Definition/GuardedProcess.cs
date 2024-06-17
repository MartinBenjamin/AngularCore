using Process.Expression;
using System;

namespace Process.Definition
{
    public class GuardedProcess: Alternative
    {
        public Func<IScope, bool> GuardExpression { get; protected set; }
        public IO                 Guard           { get; protected set; }
        public Process            Guarded         { get; protected set; }


        public GuardedProcess()
            : base()
        {
        }

        public GuardedProcess(
            Func<IScope, bool> guardExpression,
            IO                 guard,
            Process            guarded
            )
            : base()
        {
            GuardExpression = guardExpression;
            Guard           = guard;
            Guarded         = guarded;
        }

        public GuardedProcess(
            IO      guard,
            Process guarded = null
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
