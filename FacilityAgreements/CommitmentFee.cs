using System;

namespace FacilityAgreements
{
    public abstract class CommitmentFee: FacilityCommitment
    {
        public decimal? Estimated                   { get; protected set; }
        public bool     EstimatedPercentageOfMargin { get; protected set; } 
        public Ratchets Ratchets                    { get; protected set; }
        public decimal? PercentageOfMargin          { get; protected set; }

        protected CommitmentFee() : base()
        {
        }

        protected CommitmentFee(
            Guid     id,
            Facility facility,
            decimal? estimated,
            bool     estimatedPercentageOfMargin,
            Ratchets ratchets,
            decimal? percentageOfMargin
            ) : base(
                id,
                facility)
        {
            Estimated                   = estimated;
            EstimatedPercentageOfMargin = estimatedPercentageOfMargin;
            Ratchets                    = ratchets;
            PercentageOfMargin          = percentageOfMargin;
        }
    }
}
