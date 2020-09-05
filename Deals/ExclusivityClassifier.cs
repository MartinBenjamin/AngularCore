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

    public static class ExclusivityClassifierIdentifier
    {
        public static readonly Guid No = new Guid("f53d8101-9155-48fc-b4e5-dc4c536363d3");
    }
}
