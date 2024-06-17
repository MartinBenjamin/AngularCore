﻿using Process.Expression;
using System;
using System.Linq.Expressions;

namespace Process.Definition
{
    public class Output: IO
    {
        public IExpression<object> Source { get; protected set; }

        public Output(
            Expression<Func<IScope, Channel>> channel,
            IExpression<object>               source
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
