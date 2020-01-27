using Agreements;
using System;
using System.Collections.Generic;

namespace FacilityAgreements
{
    // A commitment whereby something, such as a debt, cash flows on a debt instrument(e.g., interest payments), or performance of some obligation,
    // is guaranteed if the person or organization with primary liability fails to perform
    public class Guarantee: FacilityCommitment
    {
        // A party that guarantees, endorses, or provides indemnity for some obligation on behalf of some other party.
        public virtual AgreementParty Guarantor       { get; protected set; }
        public virtual decimal?       CommercialCover { get; protected set; }
        public virtual decimal?       PoliticalCover  { get; protected set; }

        protected Guarantee() : base()
        {
        }

        public Guarantee(
            Guid           id,
            Facility       facility,
            AgreementParty guarantor,
            decimal?       commercialCover,
            decimal?       politicalCover
            ) : base(
                id,
                facility,
                new List<AgreementParty> { guarantor })
        {
            Guarantor       = guarantor;
            CommercialCover = commercialCover;
            PoliticalCover  = politicalCover;
        }
    }
}
