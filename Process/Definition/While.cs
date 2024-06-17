using Process.Expression;
using System;

namespace Process.Definition
{
    public class While: Process
    {
        public Func<IScope, bool> Condition  { get; protected set; }
        public Process            Replicated { get; protected set; }

        public While()
            : base()
        {
        }

        public While(
            Func<IScope, bool> condition,
            Process            replicated
            )
            : base()
        {
            Condition  = condition;
            Replicated = replicated;
        }

        public override void Accept(
            IVisitor visitor
            ) => visitor.Visit(this);

        public override TResult Select<TResult>(
            ISelector<TResult> selector
            ) => selector.Select(this);
    }
}