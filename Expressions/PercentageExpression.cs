using System;

namespace Expressions
{
    public abstract class PercentageExpression: RatioExpression
    {
        private static readonly Expression<decimal?> _denominator = new Variable<decimal?>(Guid.Empty, 100m);

        protected PercentageExpression() : base()
        {
        }

        protected PercentageExpression(
            Guid                 id,
            Expression<decimal?> value
            ) : base(
                id,
                value,
                _denominator)
        {
        }
    }
}
