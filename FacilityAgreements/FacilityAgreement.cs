using Contracts;
using System;
using System.Collections.Generic;

namespace FacilityAgreements
{
    public class FacilityAgreement: Contract
    {
        public virtual IList<Facility> Facilities { get; protected set; }

        protected FacilityAgreement() : base()
        {
        }

        public FacilityAgreement(
            Guid        id,
            string      title,
            LegalSystem governingLaw,
            DateTime?   executiondate,
            DateTime?   effectiveDate,
            Contract    supersedes
            ) : base(
                id,
                title,
                governingLaw,
                executiondate,
                effectiveDate,
                supersedes)
        {
            Facilities = new List<Facility>();
        }
    }
}
