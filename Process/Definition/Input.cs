﻿using System;

namespace Process.Definition
{
    public class Input: IO
    {
        public string TargetVariable { get; protected set; }

        public Input(
            Func<IScope, Channel> channel,
            string                targetVariable
            )
            : base(channel)
        {
            TargetVariable = targetVariable;
        }

        public override void Accept(
            IVisitor visitor
            ) => visitor.Visit(this);

        public override TResult Select<TResult>(
            ISelector<TResult> selector
            ) => selector.Select(this);
    }
}
