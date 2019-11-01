using Contracts;
using System;
using System.Collections.Generic;

namespace FacilityAgreements
{
    public class FacilityAgreement: Contract
    {
        public virtual DateTime?       SignedDate { get; protected set; }
        public virtual DateTime?       ClosedDate { get; protected set; }
        public virtual IList<Facility> Facilities { get; protected set; }

        protected FacilityAgreement() : base()
        {
        }

        public FacilityAgreement(
            Guid        id,
            string      title,
            LegalSystem governingLaw,
            DateTime?   signeddate,
            DateTime?   closedDate,
            Contract    supersedes

            ) : base(
                id,
                title,
                governingLaw,
                signeddate,
                closedDate,
                supersedes)
        {
            SignedDate = signeddate;
            ClosedDate = closedDate;
            Facilities = new List<Facility>();
        }
    }
}
