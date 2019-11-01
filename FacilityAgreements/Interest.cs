using System;

namespace FacilityAgreements
{
    public abstract class Interest: FacilityCommitment
    {
        public ReferenceRate ReferenceRate   { get; protected set; }
        public decimal?      EstimatedMargin { get; protected set; }
        public Ratchets      Margin          { get; protected set; }

        protected Interest() : base()
        {
        }

        protected Interest(
            Guid          id,
            Facility      facility,
            ReferenceRate referenceRate,
            decimal?      estimatedMargin,
            Ratchets      margin
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
