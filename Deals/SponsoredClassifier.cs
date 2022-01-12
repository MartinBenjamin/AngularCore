using CommonDomainObjects;
using System;

namespace Deals
{
    public class SponsoredClassifier: Classifier
    {
        protected SponsoredClassifier() : base()
        {
        }

        public SponsoredClassifier(
            Guid   id,
            string name
            ) : base(
                id,
                name)
        {
        }
    }
}
