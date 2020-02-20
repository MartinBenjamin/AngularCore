using System;

namespace Expressions
{
    public class PercentageOfTimeVarying: Function<DateTime, decimal?>
    {
        public virtual PercentageExpression         Percentage { get; protected set; }
        public virtual Function<DateTime, decimal?> Of         { get; protected set; }

        protected PercentageOfTimeVarying() : base()
        {
        }

        public PercentageOfTimeVarying(
            Guid                         id,
            PercentageExpression         percentage,
            Function<DateTime, decimal?> of
            ) : base(id)
        {
            Percentage = percentage;
            Of         = of;
        }

        public override decimal? Evaluate(
            DateTime time
            )
        {
            var percentage = Percentage.Evaluate();
            var of         = Of.Evaluate(time);

            return percentage.HasValue && of.HasValue ? percentage * of : null;
        }
    }
}
