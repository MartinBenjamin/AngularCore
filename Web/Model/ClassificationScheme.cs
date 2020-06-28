using System;
using System.Collections.Generic;

namespace Web.Model
{
    public abstract class ClassificationScheme<TId, TClassificationScheme, TClassificationSchemeClassifier, TClassifier>: DomainObject<TId>
        where TClassificationScheme : ClassificationScheme<TId, TClassificationScheme, TClassificationSchemeClassifier, TClassifier>
        where TClassificationSchemeClassifier : ClassificationSchemeClassifier<TId, TClassificationScheme, TClassificationSchemeClassifier, TClassifier>
    {
        public IList<TClassificationSchemeClassifier> Classifiers { get; set; }

        public ClassificationScheme() : base()
        {
        }
    }

    public abstract class ClassificationSchemeClassifier<TId, TClassificationScheme, TClassificationSchemeClassifier, TClassifier>:
        DomainObject<TId>
        where TClassificationScheme : ClassificationScheme<TId, TClassificationScheme, TClassificationSchemeClassifier, TClassifier>
        where TClassificationSchemeClassifier : ClassificationSchemeClassifier<TId, TClassificationScheme, TClassificationSchemeClassifier, TClassifier>
    {
        public TClassifier                            Classifier { get; set; }
        public TClassificationSchemeClassifier        Super      { get; set; }
        public IList<TClassificationSchemeClassifier> Sub        { get; set; }
        public Range<int>                             Interval   { get; set; }

        public ClassificationSchemeClassifier() : base()
        {
        }
    }

    public class Classifier: Named<Guid>
    {
        public Classifier() : base()
        {
        }
    }

    public class ClassificationScheme: ClassificationScheme<Guid, ClassificationScheme, ClassificationSchemeClassifier, Classifier>
    {
        public ClassificationScheme() : base()
        {
        }
    }

    public class ClassificationSchemeClassifier: ClassificationSchemeClassifier<Guid, ClassificationScheme, ClassificationSchemeClassifier, Classifier>
    {
        public ClassificationSchemeClassifier() : base()
        {
        }
    }
}
