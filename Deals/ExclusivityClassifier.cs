using CommonDomainObjects;
using System;

namespace Deals
{
    public class ExclusivityClassifier: Classifier
    {
        protected ExclusivityClassifier() : base()
        {
        }

        public ExclusivityClassifier(
            Guid   id,
            string name
            ) : base(
                id,
                name)
        {
        }
    }
}
