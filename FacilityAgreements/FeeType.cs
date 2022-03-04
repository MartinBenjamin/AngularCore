using CommonDomainObjects;
using System;

namespace FacilityAgreements
{
    public class FeeType: Classifier
    {
        protected FeeType() : base()
        {
        }

        public FeeType(
            Guid   id,
            string name
            ) : base(
                id,
                name)
        {
        }
    }
}
