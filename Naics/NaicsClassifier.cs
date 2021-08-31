using CommonDomainObjects;
using System;

namespace Naics
{
    public class NaicsClassifier: Classifier
    {
        public virtual Range<int> CodeRange { get; protected set; }

        protected NaicsClassifier() : base()
        {
        }

        public NaicsClassifier(
            Guid       id,
            string     name,
            Range<int> codeRange
            ) : base(
                id,
                name)
        {
            CodeRange = codeRange;
        }

        public virtual string Code => CodeRange.Start == CodeRange.End ? CodeRange.Start.ToString() : $"{CodeRange.Start}-{CodeRange.End}";
    }
}
