using Contracts;
using Iso4217;
using System;

namespace FacilityAgreements
{
    public class Facility: ContractualCommitment
    {
        public virtual FacilityAgreement Agreement        { get; protected set; }
        public virtual string            Name             { get; protected set; }
        public virtual MoneyAmount       TotalCommitments { get; protected set; }

        protected Facility() : base()
        {
        }

        public Facility(
            Guid              id,
            FacilityAgreement agreement,
            string            name,
            MoneyAmount       totalCommitments
            ) : base(
                id,
                agreement)
        {
            Agreement        = agreement;
            Name             = name;
            TotalCommitments = totalCommitments;
            Agreement.Facilities.Add(this);
        }
    }
}
