using System;

namespace Expressions
{
    public class RatioExpression: Expression<decimal?>
    {
        public virtual Expression<decimal?> Numerator   { get; protected set; }
        public virtual Expression<decimal?> Denominator { get; protected set; }

        protected RatioExpression() : base()
        {
        }

        public RatioExpression(
            Guid                 id,
            Expression<decimal?> numerator,
            Expression<decimal?> denominator
            ) : base(id)
        {
            Numerator   = numerator;
            Denominator = denominator;
        }

        public override decimal? Evaluate() => Numerator.Evaluate() / Denominator.Evaluate();
    }
}
