using Contracts;
using Iso4217;
using Organisations;
using System;
using System.Collections.Generic;

namespace FacilityAgreements
{
    public class Facility: ContractualCommitment
    {
        public virtual FacilityAgreement                    Agreement        { get; protected set; }
        public virtual string                               Name             { get; protected set; }
        public virtual Organisation                         BookingOffice    { get; protected set; }
        public virtual MoneyAmount                          TotalCommitments { get; protected set; }
        public virtual IList<FacilityContractualCommitment> Commitments      { get; protected set; }

        protected Facility() : base()
        {
        }

        public Facility(
            Guid              id,
            FacilityAgreement agreement,
            string            name,
            Organisation      bookingOffice,
            MoneyAmount       totalCommitments
            ) : base(
                id,
                agreement)
        {
            Agreement        = agreement;
            Name             = name;
            BookingOffice    = bookingOffice;
            TotalCommitments = totalCommitments;
            Commitments      = new List<FacilityContractualCommitment>();
            Agreement.Facilities.Add(this);
        }
    }
}
