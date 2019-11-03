using System;

namespace FacilityAgreements
{
    public enum CommitmentFeeType
    {
        Percentage,
        PercentageOfMarginRate
    }

    public abstract class NumericExpression
    {
        public abstract decimal Evaluate();
    }

    public class ConstantNumericExpression: NumericExpression
    {
        public decimal Value { get; protected set; }

        public ConstantNumericExpression(
            decimal value
            )
        {
            Value = value;
        }

        public override decimal Evaluate() => Value;
    }

    public class RatioExpression: NumericExpression
    {
        public virtual NumericExpression Numerator   { get; protected set; }
        public virtual NumericExpression Denominator { get; protected set; }

        public RatioExpression(
            NumericExpression numerator,
            NumericExpression denominator
            )
        {
            Numerator   = numerator;
            Denominator = denominator;
        }

        public override decimal Evaluate() => Numerator.Evaluate() / Denominator.Evaluate();
    }

    public abstract class PercentageExpression: RatioExpression
    {
        private static readonly NumericExpression _denominator = new ConstantNumericExpression(100m);

        protected PercentageExpression(
            NumericExpression value
            ): base(
                value,
                _denominator)
        {
        }
    }

    public class ConstantPercentageExpression: PercentageExpression
    {
        public ConstantPercentageExpression(
            decimal value
            ): base(new ConstantNumericExpression(value))
        {
        }

        public decimal Value
        {
            get => Numerator.Evaluate();
            protected set => Numerator = new ConstantNumericExpression(value);
        }
    }

    public class PercentageOfExpression: NumericExpression
    {
        public PercentageExpression Percentage { get; protected set; }
        public NumericExpression    Of         { get; protected set; }

        public override decimal Evaluate() => Percentage.Numerator.Evaluate() * Of.Evaluate() / Percentage.Denominator.Evaluate();
    }

    public abstract class CommitmentFee: FacilityCommitment
    {
        public decimal?          Estimated              { get; protected set; }
        public CommitmentFeeType EstimatedType          { get; protected set; } 
        public Ratchets          Ratchets               { get; protected set; }
        public decimal?          PercentageOfMarginRate { get; protected set; }

        protected CommitmentFee() : base()
        {
        }

        protected CommitmentFee(
            Guid              id,
            Facility          facility,
            decimal?          estimated,
            CommitmentFeeType estimatedType,
            Ratchets          ratchets,
            decimal?          percentageOfMargin
            ) : base(
                id,
                facility)
        {
            Estimated              = estimated;
            EstimatedType          = estimatedType;
            Ratchets               = ratchets;
            PercentageOfMarginRate = percentageOfMargin;
        }
    }
}
