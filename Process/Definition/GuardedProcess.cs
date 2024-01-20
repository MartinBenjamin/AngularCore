using System;
using System.Linq.Expressions;

namespace Process.Definition
{
    public class GuardedProcess: Alternative
    {
        public Func<global::Process.Process, bool>
                       GuardExpression { get; protected set; }
        public IO      Guard           { get; protected set; }
        public Process Guarded         { get; protected set; }

        private Expression<Func<global::Process.Process, bool>> _guardExpressionExpression;

        public GuardedProcess()
            : base()
        {
        }

        public GuardedProcess(
            Func<global::Process.Process, bool>
                    guardExpression,
            IO      guard,
            Process guarded
            )
            : base()
        {
            GuardExpression = guardExpression;
            Guard           = guard;
            Guarded         = guarded;
        }

        public GuardedProcess(
            Expression<Func<global::Process.Process, bool>>
                    guardExpression,
            IO      guard,
            Process guarded
            )
            : this(
                guardExpression.Compile(),
                guard,
                guarded
            )
        {
            _guardExpressionExpression = guardExpression;
        }

        public Expression<Func<global::Process.Process, bool>> GuardExpressionExpression
        {
            get
            {
                return _guardExpressionExpression;
            }
        }

        public GuardedProcess(
            IO      guard,
            Process guarded = null
            )
            : this(
                (Func<global::Process.Process, bool>)null,
                guard,
                guarded)
        {
        }

        public override global::Process.Process New(
            global::Process.Process parent
            ) => new global::Process.GuardedProcess(
                this,
                (global::Process.Choice)parent);

        public override bool Accept(
            IVisitor visitor
            ) =>
                visitor.Enter(this) &&
                Guard.Accept(visitor) &&
                (Guarded == null || Guarded.Accept(visitor)) &&
                visitor.Exit(this);
    }
}
