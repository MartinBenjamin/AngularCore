using System;

namespace FacilityAgreements
{
    public abstract class Interest: FacilityCommitment
    {
        public ReferenceRate                ReferenceRate   { get; protected set; }
        public NumericExpression            EstimatedMargin { get; protected set; }
        public TimeVaryingNumericExpression Margin          { get; protected set; }

        protected Interest() : base()
        {
        }

        protected Interest(
            Guid                         id,
            Facility                     facility,
            ReferenceRate                referenceRate,
            NumericExpression            estimatedMargin,
            TimeVaryingNumericExpression margin
            ) : base(
                id,
                facility)
        {
            ReferenceRate   = referenceRate;
            EstimatedMargin = estimatedMargin;
            Margin          = margin;
        }
    }
}
