using CommonDomainObjects;
using System;
using System.Linq;

namespace FacilityAgreements
{
    public abstract class Expression<TResult>: DomainObject<Guid>
    {
        protected Expression() : base()
        {
        }

        protected Expression(
            Guid id
            ) : base(id)
        {
        }

        public abstract TResult Evaluate();
    }
    public abstract class Expression<T, TResult>: DomainObject<Guid>
    {
        protected Expression() : base()
        {
        }

        protected Expression(
            Guid id
            ) : base(id)
        {
        }

        public abstract TResult Evaluate(T t);
    }

    public class NumericValue: Expression<decimal?>
    {
        public decimal? Value { get; set; }

        protected NumericValue() : base()
        {
        }

        public NumericValue(
            Guid     id,
            decimal? value
            ) : base(id)
        {
            Value = value;
        }

        public override decimal? Evaluate() => Value;
    }

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

        public override decimal? Evaluate()
        {
            var numerator   = Numerator.Evaluate();
            var denominator = Denominator.Evaluate();

            return numerator.HasValue && denominator.HasValue ? numerator / denominator : null;
        }
    }

    public abstract class PercentageExpression: RatioExpression
    {
        private static readonly Expression<decimal?> _denominator = new NumericValue(Guid.Empty, 100m);

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
                new NumericValue(
                    Guid.Empty,
                    value))
        {
        }

        public decimal? Value
        {
            get => Numerator.Evaluate();
            set => ((NumericValue)Numerator).Value = value;
        }
    }

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

    public class RatchetsExpression: Expression<DateTime, decimal?>
    {
        public Ratchets Ratchets { get; protected set; }

        protected RatchetsExpression() : base()
        {
        }

        public override decimal? Evaluate(
            DateTime time
            )
        {
            var applicableRatchet = Ratchets
                .Entries
                .Where(ratchet => ratchet.Date <= time)
                .Aggregate(
                    (Ratchet)null,
                    (selected, next) =>
                        selected == null || next.Date > selected.Date ? next : selected);

            return applicableRatchet != null ? (decimal?)applicableRatchet.Rate : null;
        }
    }
}
