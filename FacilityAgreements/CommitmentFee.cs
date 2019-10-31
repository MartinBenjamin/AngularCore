using System;

namespace FacilityAgreements
{
    public abstract class CommitmentFee: FacilityContractualCommitment
    {
        protected CommitmentFee() : base()
        {
        }

        protected CommitmentFee(
            Guid     id,
            Facility facility
            ) : base(
                id,
                facility)
        {
        }
    }
}
