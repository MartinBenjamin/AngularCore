using Contracts;
using System;

namespace FacilityAgreements
{
    // A Commitment related to a Facility.
    public abstract class FacilityCommitment: ContractualCommitment
    {
        public virtual Facility Facility { get; protected set; }

        protected FacilityCommitment() : base()
        {
        }

        protected FacilityCommitment(
            Guid     id,
            Facility facility
            ) : base(
                id,
                facility.Contract,
                facility)
        {
            Facility = facility;
            Facility.Commitments.Add(this);
        }
    }
}
