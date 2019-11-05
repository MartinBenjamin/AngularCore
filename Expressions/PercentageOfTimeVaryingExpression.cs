using System;

namespace Expressions
{
    public class PercentageOfTimeVaryingExpression: Expression<DateTime, decimal?>
    {
        public PercentageExpression           Percentage { get; protected set; }
        public Expression<DateTime, decimal?> Of         { get; protected set; }

        protected PercentageOfTimeVaryingExpression() : base()
        {
        }

        public PercentageOfTimeVaryingExpression(
            Guid                           id,
            PercentageExpression           percentage,
            Expression<DateTime, decimal?> of
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
