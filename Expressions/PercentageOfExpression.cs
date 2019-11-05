using System;

namespace Expressions
{
    public class PercentageOfExpression: Expression<decimal?>
    {
        public PercentageExpression Percentage { get; protected set; }
        public Expression<decimal?> Of         { get; protected set; }

        protected PercentageOfExpression() : base()
        {
        }

        public PercentageOfExpression(
            Guid                 id,
            PercentageExpression percentage,
            Expression<decimal?> of
            ) : base(id)
        {
            Percentage = percentage;
            Of         = of;
        }

        public override decimal? Evaluate()
        {
            var percentage = Percentage.Evaluate();
            var of         = Of.Evaluate();

            return percentage.HasValue && of.HasValue ? percentage * of : null;
        }
    }
}
