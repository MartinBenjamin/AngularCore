using CommonDomainObjects;
using System;
using System.Linq;

namespace FacilityAgreements
{
    public abstract class NumericExpression: DomainObject<Guid>
    {
        protected NumericExpression() : base()
        {
        }

        protected NumericExpression(
            Guid id
            ) : base(id)
        {
        }

        public abstract decimal? Evaluate();
    }

    public class NumericValue: NumericExpression
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

    public class RatioExpression: NumericExpression
    {
        public virtual NumericExpression Numerator   { get; protected set; }
        public virtual NumericExpression Denominator { get; protected set; }

        protected RatioExpression() : base()
        {
        }

        public RatioExpression(
            Guid              id,
            NumericExpression numerator,
            NumericExpression denominator
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
        private static readonly NumericExpression _denominator = new NumericValue(Guid.Empty, 100m);

        protected PercentageExpression() : base()
        {
        }

        protected PercentageExpression(
            Guid              id,
            NumericExpression value
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

    public class PercentageOfExpression: NumericExpression
    {
        public PercentageExpression Percentage { get; protected set; }
        public NumericExpression    Of         { get; protected set; }

        protected PercentageOfExpression() : base()
        {
        }

        public PercentageOfExpression(
            Guid                 id,
            PercentageExpression percentage,
            NumericExpression    of
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

    public abstract class TimeVaryingNumericExpression: DomainObject<Guid>
    {
        public abstract decimal? Evaluate(DateTime time);

        protected TimeVaryingNumericExpression() : base()
        {
        }

        protected TimeVaryingNumericExpression(
            Guid id
            ) : base(id)
        {
        }
    }
    
    public class ConstantNumericValue: TimeVaryingNumericExpression
    {
        public decimal? Value { get; set; }

        protected ConstantNumericValue() : base()
        {
        }

        public ConstantNumericValue(
            Guid     id,
            decimal? value
            ) : base(id)
        {
            Value = value;
        }

        public override decimal? Evaluate(DateTime time) => Value;
    }

    public class RatchetsExpression: TimeVaryingNumericExpression
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
                    (lhs, rhs) =>
                    {
                        if(rhs.Date <= time &&
                           (lhs == null || rhs.Date > lhs.Date))
                            return rhs;

                        return lhs;
                    });

            return applicableRatchet != null ? (decimal?)applicableRatchet.Rate : null;
        }
    }
}
