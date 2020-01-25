using Contracts;
using System;
using System.Collections.Generic;

namespace FacilityAgreements
{
    public class FacilityAgreement: Contract
    {
        public virtual IList<Facility> Facilities  { get; protected set; }

        protected FacilityAgreement() : base()
        {
        }

        public FacilityAgreement(
            Guid         id,
            string       title,
            Jurisdiction governedBy,
            Contract     supersedes

            ) : base(
                id,
                title,
                governedBy,
                supersedes)
        {
            Facilities  = new List<Facility>();
        }
    }
}
