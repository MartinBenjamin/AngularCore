using System;

namespace Expressions
{
    public class PercentageValue: PercentageExpression
    {
        protected PercentageValue() : base()
        {
        }

        public PercentageValue(
            Guid     id,
            decimal? value
            ) : base(
                id,
                new Variable<decimal?>(
                    Guid.Empty,
                    value))
        {
        }

        public decimal? Value
        {
            get => Numerator.Evaluate();
            set => ((Variable<decimal?>)Numerator).Value = value;
        }
    }
}
