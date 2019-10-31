using Contracts;
using System;

namespace FacilityAgreements
{
    public abstract class FacilityContractualCommitment: ContractualCommitment
    {
        public Facility Facility { get; protected set; }

        protected FacilityContractualCommitment() : base()
        {
        }

        protected FacilityContractualCommitment(
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
