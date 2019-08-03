﻿namespace Peg
{
    public class Not: Expression
    {
        public Expression Expression { get; private set; }

        public Not(
            Expression expression
            ) : base(3)
        {
            Expression = expression;
        }

        public override int Parse(
            string input,
            int    position
            )
        {
            return Expression.Parse(
                input,
                position) < 0 ? 0 : NoMatch(position);
        }

        public override void Write(
            IExpressionWriter writer
            )
        {
            writer.Write(this);
        }
    }
}
