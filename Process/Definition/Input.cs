using Process.Expression;
using System;
using System.Linq.Expressions;

namespace Process.Definition
{
    public class Input: IO
    {
        public string TargetVariable { get; protected set; }

        public Input(
            Expression<Func<IScope, Channel>> channel,
            string                            targetVariable
            )
            : base(channel)
        {
            TargetVariable = targetVariable;
        }

        protected Input(
            Guid id
            )
            : base(id)
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
