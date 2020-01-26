using Agreements;
using Contracts;
using System;
using System.Collections.Generic;

namespace FacilityAgreements
{
    // ACommitment related to a Facility.
    public abstract class FacilityCommitment: ContractualCommitment
    {
        public virtual Facility Facility { get; protected set; }

        protected FacilityCommitment() : base()
        {
        }

        protected FacilityCommitment(
            Guid                  id,
            Facility              facility,
            IList<AgreementParty> obligors,
            IList<AgreementParty> obligees
            ) : base(
                id,
                facility.Contract,
                obligors,
                obligees,
                facility)
        {
            Facility = facility;
            Facility.Commitments.Add(this);
        }

        protected FacilityCommitment(
            Guid     id,
            Facility facility
            ) : this(
                id,
                facility,
                new List<AgreementParty>(),
                new List<AgreementParty>())
        {
        }
    }
}
