using Process.Expression;
using System;
using System.Collections.Generic;

namespace Process.Definition
{
    public class GuardedProcess: Alternative
    {
        public IExpression<bool> GuardExpression { get; protected set; }
        public IO                Guard           { get; protected set; }
        public Process           Guarded         { get; protected set; }


        public GuardedProcess()
            : base()
        {
        }

        public GuardedProcess(
            IExpression<bool> guardExpression,
            IO                guard,
            Process           guarded
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

        public override global::Process.Process New(
            Guid                        id,
            global::Process.Process     parent,
            IDictionary<string, object> variables = null
            ) => new global::Process.GuardedProcess(
                id,
                this,
                (global::Process.Choice)parent,
                variables);

        public override void Accept(
            IVisitor visitor
            ) => visitor.Visit(this);

        public override TResult Select<TResult>(
            ISelector<TResult> selector) => selector.Select(this);
    }
}
