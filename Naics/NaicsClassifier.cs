using CommonDomainObjects;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace Naics
{
    public class NaicsClassifier: Classifier
    {
        private IList<string> _crossReferences;

        public virtual Range<int> CodeRange   { get; protected set; }
        public virtual string     Description { get; protected set; }

        protected NaicsClassifier() : base()
        {
        }

        public NaicsClassifier(
            Guid          id,
            string        name,
            Range<int>    codeRange,
            string        description,
            IList<string> crossReferences
            ) : base(
                id,
                name)
        {
            CodeRange        = codeRange;
            Description      = description;
            _crossReferences = crossReferences;
        }

        public virtual string Code => CodeRange.Start == CodeRange.End ? CodeRange.Start.ToString() : $"{CodeRange.Start}-{CodeRange.End}";

        public virtual IReadOnlyList<string> CrossReferences => new ReadOnlyCollection<string>(_crossReferences);
    }
}
