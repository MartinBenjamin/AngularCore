using Contracts;
using Iso4217;
using Organisations;
using System;
using System.Collections.Generic;

namespace FacilityAgreements
{
    public class Facility: ContractualDefinition
    {
        public virtual FacilityAgreement         Agreement     { get; protected set; }
        public virtual Organisation              BookingOffice { get; protected set; }
        public virtual IList<FacilityCommitment> Commitments   { get; protected set; }

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
                agreement,
                name)
        {
            Agreement        = agreement;
            BookingOffice    = bookingOffice;
            Commitments      = new List<FacilityCommitment>();
            Agreement.Facilities.Add(this);
        }
    }
}
