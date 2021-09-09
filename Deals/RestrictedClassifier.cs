using CommonDomainObjects;
using System;

namespace Deals
{
    public class RestrictedClassifier: Classifier
    {
        protected RestrictedClassifier() : base()
        {
        }

        public RestrictedClassifier(
            Guid   id,
            string name
            ) : base(
                id,
                name)
        {
        }
    }
}
