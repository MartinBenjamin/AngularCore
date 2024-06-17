using Process.Expression;
using System;

namespace Process.Definition
{
    public class Output: IO
    {
        public Func<IScope, object> Source { get; protected set; }

        public Output(
            Func<IScope, Channel> channel,
            Func<IScope, object>  source
            )
            : base(channel)
        {
            Source = source;
        }

        public override void Accept(
            IVisitor visitor
            ) => visitor.Visit(this);

        public override TResult Select<TResult>(
            ISelector<TResult> selector
            ) => selector.Select(this);
    }
}
