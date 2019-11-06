using Contracts;
using System;

namespace FacilityAgreements
{
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
                facility.Contract)
        {
            Facility = facility;
            Facility.Commitments.Add(this);
        }
    }
}
