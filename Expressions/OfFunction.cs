using System;

namespace Expressions
{
    public class OfFunction<T>: Function<T, decimal?>
    {
        public virtual Expression<decimal?>  Lhs { get; protected set; }
        public virtual Function<T, decimal?> Rhs { get; protected set; }

        protected OfFunction() : base()
        {
        }

        public OfFunction(
            Guid                  id,
            Expression<decimal?>  lhs,
            Function<T, decimal?> rhs
            ) : base(id)
        {
            Lhs = lhs;
            Rhs = rhs;
        }

        public override decimal? Evaluate(
            T t
            )
        {
            var lhs = Lhs.Evaluate();
            var rhs = Rhs.Evaluate(t);

            return lhs.HasValue && rhs.HasValue ? lhs * rhs : null;
        }
    }
}
