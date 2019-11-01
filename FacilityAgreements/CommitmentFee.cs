using System;

namespace FacilityAgreements
{
    public abstract class CommitmentFee: FacilityCommitment
    {
        public decimal? Estimated { get; protected set; }

        protected CommitmentFee() : base()
        {
        }

        protected CommitmentFee(
            Guid     id,
            Facility facility,
            decimal? estimated
            ) : base(
                id,
                facility)
        {
            Estimated = estimated;
        }
    }
}
