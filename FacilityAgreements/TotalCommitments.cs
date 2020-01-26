using Iso4217;
using System;

namespace FacilityAgreements
{
    public class TotalCommitments: FacilityCommitment
    {
        public virtual MoneyAmount Value { get; protected set; }

        protected TotalCommitments() : base()
        {
        }

        public TotalCommitments(
            Guid        id,
            Facility    facility,
            MoneyAmount totalCommitments
            ): base(
                id,
                facility)
        {
            Value = totalCommitments;
        }

    }
}
