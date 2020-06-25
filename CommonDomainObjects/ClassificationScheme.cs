using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;

namespace CommonDomainObjects
{
    public abstract class ClassificationScheme<TId, TClassificationScheme, TClassificationSchemeClass, TClass>: DomainObject<TId>
        where TClassificationScheme : ClassificationScheme<TId, TClassificationScheme, TClassificationSchemeClass, TClass>
        where TClassificationSchemeClass : ClassificationSchemeClass<TId, TClassificationScheme, TClassificationSchemeClass, TClass>
    {
        private IList<TClassificationSchemeClass> _classes;

        public virtual IReadOnlyList<TClassificationSchemeClass> Classes
            => new ReadOnlyCollection<TClassificationSchemeClass>(_classes);

        protected ClassificationScheme() : base()
        {
        }

        public ClassificationScheme(
            TId                                id,
            IDictionary<TClass, IList<TClass>> super
            ) : base(id)
        {
            _classes = new List<TClassificationSchemeClass>();

            var sub = super.Transpose();

            var next = 0;
            foreach(var classifier in super.Keys.Where(key => super[key].Count == 0))
            {
                var classificationSchemeClass = CreateTree(
                    sub,
                    classifier,
                    null);

                next = classificationSchemeClass.AssignInterval(next);
            }
        }

        public virtual TClassificationSchemeClass this[
            TClass @class
            ] => _classes.FirstOrDefault(classificationSchemeClass => classificationSchemeClass.Class.Equals(@class));

        public virtual void Visit(
            Action<TClassificationSchemeClass> enter,
            Action<TClassificationSchemeClass> exit = null
            ) => Classes
                .Where(classificationSchemeClass => classificationSchemeClass.Super == null)
                .ForEach(classificationSchemeClass => classificationSchemeClass.Visit(
                    enter,
                    exit));

        public virtual async Task VisitAsync(
            Func<TClassificationSchemeClass, Task> enter,
            Func<TClassificationSchemeClass, Task> exit = null
            ) => await Classes
                .Where(classificationSchemeClass => classificationSchemeClass.Super == null)
                .ForEachAsync(classificationSchemeClass => classificationSchemeClass.VisitAsync(
                    enter,
                    exit));

        private TClassificationSchemeClass CreateTree(
            IDictionary<TClass, IList<TClass>> sub,
            TClass                             @class,
            TClassificationSchemeClass         superClassificationSchemeClass
            )
        {
            var classificationSchemeClassifier = NewClassificationSchemeClass(
                @class,
                superClassificationSchemeClass);

            _classes.Add(classificationSchemeClassifier);

            foreach(var subclass in sub[@class])
                CreateTree(
                    sub,
                    subclass,
                    classificationSchemeClassifier);

            return classificationSchemeClassifier;
        }

        protected abstract TClassificationSchemeClass NewClassificationSchemeClass(
            TClass                     @class,
            TClassificationSchemeClass superClassificationSchemeClass);
    }

    public abstract class ClassificationSchemeClass<TId, TClassificationScheme, TClassificationSchemeClass, TClass>:
        DomainObject<TId>,
        ITreeVertex<TClassificationSchemeClass>
        where TClassificationScheme : ClassificationScheme<TId, TClassificationScheme, TClassificationSchemeClass, TClass>
        where TClassificationSchemeClass : ClassificationSchemeClass<TId, TClassificationScheme, TClassificationSchemeClass, TClass>
    {
        private IList<TClassificationSchemeClass> _sub;

        public virtual TClassificationScheme      ClassificationScheme { get; protected set; }
        public virtual TClass                     Class                { get; protected set; }
        public virtual TClassificationSchemeClass Super                { get; protected set; }
        public virtual Range<int>                 Interval             { get; protected set; }

        public virtual IReadOnlyList<TClassificationSchemeClass> Sub
            => new ReadOnlyCollection<TClassificationSchemeClass>(_sub);

        protected ClassificationSchemeClass() : base()
        {
        }

        protected ClassificationSchemeClass(
            TId                        id,
            TClassificationScheme      classificationScheme,
            TClass                     @class,
            TClassificationSchemeClass super
            ) : base(id)
        {
            _sub = new List<TClassificationSchemeClass>();
            ClassificationScheme = classificationScheme;
            Class                = @class;
            Super                = super;
            Super?._sub.Add((TClassificationSchemeClass)this);
        }

        public virtual bool Contains(
            TClassificationSchemeClass classificationSchemeClass
            ) =>
                ClassificationScheme == classificationSchemeClass.ClassificationScheme &&
                Interval.Contains(classificationSchemeClass.Interval);

        protected internal virtual int AssignInterval(
            int next
            )
        {
            var start = next++;

            foreach(var narrower in _sub)
                next = narrower.AssignInterval(next);

            Interval = new Range<int>(
                start,
                next++);

            return next;
        }

        TClassificationSchemeClass ITreeVertex<TClassificationSchemeClass>.Parent
            => Super;

        IReadOnlyList<TClassificationSchemeClass> ITreeVertex<TClassificationSchemeClass>.Children
            => Sub;
    }

    public class Class: Named<Guid>
    {
        protected Class() : base()
        {
        }

        public Class(
            Guid   id,
            string name
            ) : base(
                id,
                name)
        {
        }
    }

    public class ClassificationScheme: ClassificationScheme<Guid, ClassificationScheme, ClassificationSchemeClass, Class>
    {
        protected ClassificationScheme() : base()
        {
        }

        public ClassificationScheme(
            Guid                             id,
            IDictionary<Class, IList<Class>> super
            ) : base(
                id,
                super)
        {
        }

        public ClassificationScheme(
            IDictionary<Class, IList<Class>> super
            ) : this(
                Guid.NewGuid(),
                super)
        {
        }

        protected override ClassificationSchemeClass NewClassificationSchemeClass(
            Class                     @class,
            ClassificationSchemeClass superClassificationSchemeClass
            ) => new ClassificationSchemeClass(
                this,
                @class,
                superClassificationSchemeClass);
    }

    public class ClassificationSchemeClass: ClassificationSchemeClass<Guid, ClassificationScheme, ClassificationSchemeClass, Class>
    {
        protected ClassificationSchemeClass() : base()
        {
        }

        internal ClassificationSchemeClass(
            ClassificationScheme      classificationScheme,
            Class                     @class,
            ClassificationSchemeClass super
            ) : base(
                Guid.NewGuid(),
                classificationScheme,
                @class,
                super)
        {
        }
    }
}
