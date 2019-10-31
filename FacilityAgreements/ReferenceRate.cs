using CommonDomainObjects;
using System;

namespace FacilityAgreements
{
    public class ReferenceRate: Named<Guid>
    {
        protected ReferenceRate() : base()
        {
        }

        public ReferenceRate(
            Guid   id,
            string name
            ) : base(
                id,
                name)
        {
        }
    }
}
