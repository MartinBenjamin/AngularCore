using System;

namespace Expressions
{
    public class PercentageOfFunction<T>: Function<T, decimal?>
    {
        public virtual PercentageExpression  Percentage { get; protected set; }
        public virtual Function<T, decimal?> Of         { get; protected set; }

        protected PercentageOfFunction() : base()
        {
        }

        public PercentageOfFunction(
            Guid                  id,
            PercentageExpression  percentage,
            Function<T, decimal?> of
            ) : base(id)
        {
            Percentage = percentage;
            Of         = of;
        }

        public override decimal? Evaluate(
            T t
            )
        {
            var percentage = Percentage.Evaluate();
            var of         = Of.Evaluate(t);

            return percentage.HasValue && of.HasValue ? percentage * of : null;
        }
    }
}
