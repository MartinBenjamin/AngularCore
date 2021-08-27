﻿using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;

namespace CommonDomainObjects
{
    public abstract class ClassificationScheme<TId, TClassificationScheme, TClassificationSchemeClassifier, TClassifier>: DomainObject<TId>
        where TClassificationScheme : ClassificationScheme<TId, TClassificationScheme, TClassificationSchemeClassifier, TClassifier>
        where TClassificationSchemeClassifier : ClassificationSchemeClassifier<TId, TClassificationScheme, TClassificationSchemeClassifier, TClassifier>
    {
        private readonly IList<TClassificationSchemeClassifier> _classifiers;

        public virtual IReadOnlyList<TClassificationSchemeClassifier> Classifiers
            => new ReadOnlyCollection<TClassificationSchemeClassifier>(_classifiers);

        protected ClassificationScheme() : base()
        {
        }

        public ClassificationScheme(
            TId                                          id,
            IDictionary<TClassifier, IList<TClassifier>> super
            ) : base(id)
        {
            _classifiers = new List<TClassificationSchemeClassifier>();

            var sub = super.Transpose();

            var next = 0;
            foreach(var classifier in super.Keys.Where(key => super[key].Count == 0))
            {
                var classificationSchemeClassifier = CreateTree(
                    sub,
                    classifier,
                    null);

                next = classificationSchemeClassifier.AssignInterval(next);
            }
        }

        public virtual TClassificationSchemeClassifier this[
            TClassifier classifier
            ] => _classifiers.FirstOrDefault(classificationSchemeClassifier => classificationSchemeClassifier.Classifier.Equals(classifier));

        public virtual void Visit(
            Action<TClassificationSchemeClassifier> enter,
            Action<TClassificationSchemeClassifier> exit = null
            ) => Classifiers
                .Where(classificationSchemeClassifier => classificationSchemeClassifier.Super == null)
                .ForEach(classificationSchemeClassifier => classificationSchemeClassifier.Visit(
                    enter,
                    exit));

        public virtual async Task VisitAsync(
            Func<TClassificationSchemeClassifier, Task> enter,
            Func<TClassificationSchemeClassifier, Task> exit = null
            ) => await Classifiers
                .Where(classificationSchemeClassifier => classificationSchemeClassifier.Super == null)
                .ForEachAsync(classificationSchemeClassifier => classificationSchemeClassifier.VisitAsync(
                    enter,
                    exit));

        private TClassificationSchemeClassifier CreateTree(
            IDictionary<TClassifier, IList<TClassifier>> sub,
            TClassifier                                  classifier,
            TClassificationSchemeClassifier              superClassificationSchemeClassifier
            )
        {
            var classificationSchemeClassifier = NewClassificationSchemeClass(
                classifier,
                superClassificationSchemeClassifier);

            _classifiers.Add(classificationSchemeClassifier);

            foreach(var subClassifier in sub[classifier])
                CreateTree(
                    sub,
                    subClassifier,
                    classificationSchemeClassifier);

            return classificationSchemeClassifier;
        }

        protected abstract TClassificationSchemeClassifier NewClassificationSchemeClass(
            TClassifier                     classifier,
            TClassificationSchemeClassifier superClassificationSchemeClassifier);
    }

    public abstract class ClassificationSchemeClassifier<TId, TClassificationScheme, TClassificationSchemeClassifier, TClassifier>:
        DomainObject<TId>,
        ITreeVertex<TClassificationSchemeClassifier>
        where TClassificationScheme : ClassificationScheme<TId, TClassificationScheme, TClassificationSchemeClassifier, TClassifier>
        where TClassificationSchemeClassifier : ClassificationSchemeClassifier<TId, TClassificationScheme, TClassificationSchemeClassifier, TClassifier>
    {
        private readonly IList<TClassificationSchemeClassifier> _sub;

        public virtual TClassificationScheme           ClassificationScheme { get; protected set; }
        public virtual TClassifier                     Classifier           { get; protected set; }
        public virtual TClassificationSchemeClassifier Super                { get; protected set; }
        public virtual Range<int>                      Interval             { get; protected set; }

        public virtual IReadOnlyList<TClassificationSchemeClassifier> Sub
            => new ReadOnlyCollection<TClassificationSchemeClassifier>(_sub);

        protected ClassificationSchemeClassifier() : base()
        {
        }

        protected ClassificationSchemeClassifier(
            TId                             id,
            TClassificationScheme           classificationScheme,
            TClassifier                     classifier,
            TClassificationSchemeClassifier super
            ) : base(id)
        {
            _sub = new List<TClassificationSchemeClassifier>();
            ClassificationScheme = classificationScheme;
            Classifier           = classifier;
            Super                = super;
            Super?._sub.Add((TClassificationSchemeClassifier)this);
        }

        public virtual bool Contains(
            TClassificationSchemeClassifier classificationSchemeClassifier
            ) =>
                ClassificationScheme == classificationSchemeClassifier.ClassificationScheme &&
                Interval.Contains(classificationSchemeClassifier.Interval);

        protected internal virtual int AssignInterval(
            int next
            )
        {
            var start = next++;

            foreach(var sub in _sub)
                next = sub.AssignInterval(next);

            Interval = new Range<int>(
                start,
                next++);

            return next;
        }

        TClassificationSchemeClassifier ITreeVertex<TClassificationSchemeClassifier>.Parent
            => Super;

        IReadOnlyList<TClassificationSchemeClassifier> ITreeVertex<TClassificationSchemeClassifier>.Children
            => Sub;
    }

    public class Classifier: Named<Guid>
    {
        protected Classifier() : base()
        {
        }

        public Classifier(
            Guid   id,
            string name
            ) : base(
                id,
                name)
        {
        }
    }

    public class ClassificationScheme: ClassificationScheme<Guid, ClassificationScheme, ClassificationSchemeClassifier, Classifier>
    {
        protected ClassificationScheme() : base()
        {
        }

        public ClassificationScheme(
            Guid                                       id,
            IDictionary<Classifier, IList<Classifier>> super
            ) : base(
                id,
                super)
        {
        }

        public ClassificationScheme(
            IDictionary<Classifier, IList<Classifier>> super
            ) : this(
                Guid.NewGuid(),
                super)
        {
        }

        protected override ClassificationSchemeClassifier NewClassificationSchemeClass(
            Classifier                     classifier,
            ClassificationSchemeClassifier superClassificationSchemeClassifier
            ) => new ClassificationSchemeClassifier(
                this,
                classifier,
                superClassificationSchemeClassifier);
    }

    public class ClassificationSchemeClassifier: ClassificationSchemeClassifier<Guid, ClassificationScheme, ClassificationSchemeClassifier, Classifier>
    {
        protected ClassificationSchemeClassifier() : base()
        {
        }

        internal ClassificationSchemeClassifier(
            ClassificationScheme           classificationScheme,
            Classifier                     classifier,
            ClassificationSchemeClassifier super
            ) : base(
                Guid.NewGuid(),
                classificationScheme,
                classifier,
                super)
        {
        }
    }
}
