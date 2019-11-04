using Contracts;
using System;
using System.Collections.Generic;

namespace FacilityAgreements
{
    public class FacilityAgreement: Contract
    {
        public virtual DateTime?       SigningDate { get; protected set; }
        public virtual DateTime?       ClosingDate { get; protected set; }
        public virtual IList<Facility> Facilities  { get; protected set; }

        protected FacilityAgreement() : base()
        {
        }

        public FacilityAgreement(
            Guid        id,
            string      title,
            LegalSystem governingLaw,
            DateTime?   signingdate,
            DateTime?   closingDate,
            Contract    supersedes

            ) : base(
                id,
                title,
                governingLaw,
                signingdate,
                closingDate,
                supersedes)
        {
            SigningDate = signingdate;
            ClosingDate = closingDate;
            Facilities  = new List<Facility>();
        }
    }
}
