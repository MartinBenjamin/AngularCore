using CommonDomainObjects;
using System;

namespace Naics
{
    public class Classifier: CommonDomainObjects.Classifier
    {
        public Range<int> CodeRange { get; protected set; }

        protected Classifier() : base()
        {
        }

        public Classifier(
            Guid       id,
            string     name,
            Range<int> codeRange
            ) : base(
                id,
                name)
        {
            CodeRange = codeRange;
        }

        public string Code => CodeRange.Start == CodeRange.End ? CodeRange.Start.ToString() : $"{CodeRange.Start}-{CodeRange.End}";
    }
}
