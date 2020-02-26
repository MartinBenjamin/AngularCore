using System;

namespace Expressions
{
    public class OfExpression: Expression<decimal?>
    {
        public virtual Expression<decimal?> Lhs { get; protected set; }
        public virtual Expression<decimal?> Rhs { get; protected set; }

        protected OfExpression() : base()
        {
        }

        public OfExpression(
            Guid                 id,
            Expression<decimal?> lhs,
            Expression<decimal?> rhs
            ) : base(id)
        {
            Lhs = lhs;
            Rhs = rhs;
        }

        public override decimal? Evaluate()
        {
            var lhs = Lhs.Evaluate();
            var rhs = Rhs.Evaluate();

            return lhs.HasValue && rhs.HasValue ? lhs * rhs : null;
        }
    }
}
