using System;

namespace FacilityAgreements
{
    public enum CommitmentFeeType
    {
        Percentage,
        PercentageOfMarginRate
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
