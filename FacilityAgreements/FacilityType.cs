using CommonDomainObjects;
using System;

namespace FacilityAgreements
{
    public class FacilityType: Classifier
    {
        protected FacilityType() : base()
        {
        }

        public FacilityType(
            Guid id,
            string name
            ) : base(
                id,
                name)
        {
        }
    }
}
