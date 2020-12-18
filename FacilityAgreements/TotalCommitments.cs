using Contracts;
using Iso4217;
using System;

namespace FacilityAgreements
{
    public class TotalCommitments: ContractualCommitment
    {
        public virtual MonetaryAmount Value { get; protected set; }

        protected TotalCommitments() : base()
        {
        }

        public TotalCommitments(
            Guid        id,
            Facility    facility,
            MonetaryAmount totalCommitments
            ): base(
                id,
                facility)
        {
            Value = totalCommitments;
        }

    }
}
