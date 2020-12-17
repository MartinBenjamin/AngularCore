using Contracts;
using Parties;
using System;

namespace FacilityAgreements
{
    // A commitment whereby something, such as a debt, cash flows on a debt instrument(e.g., interest payments), or performance of some obligation,
    // is guaranteed if the person or organization with primary liability fails to perform
    public class Guarantee: ContractualCommitment
    {
        // A party that guarantees, endorses, or provides indemnity for some obligation on behalf of some other party.
        public virtual PartyInRole Guarantor       { get; protected set; }
        public virtual decimal?    CommercialCover { get; protected set; }
        public virtual decimal?    PoliticalCover  { get; protected set; }

        protected Guarantee() : base()
        {
        }

        public Guarantee(
            Guid           id,
            Facility       facility,
            PartyInRole    guarantor,
            decimal?       commercialCover,
            decimal?       politicalCover
            ) : base(
                id,
                facility)
        {
            Guarantor       = guarantor;
            CommercialCover = commercialCover;
            PoliticalCover  = politicalCover;
        }
    }
}
