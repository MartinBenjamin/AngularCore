using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace CommonDomainObjects
{
    public interface IClassExpression
    {
        Type Type { get; }

        bool HasMember(object o);

        IEnumerable<IClassAxiom> Axioms { get; }
    }

    public interface IClassExpression<in T>: IClassExpression
    {
        bool HasMember(T t);

        IEnumerable<IClassAxiom<T>> Axioms { get; }
    }

    public abstract class ClassExpression<T>: IClassExpression<T>
    {
        public IList<IClassAxiom<T>> Axioms { get; protected set; } = new List<IClassAxiom<T>>();

        Type IClassExpression.Type => typeof(T);

        bool IClassExpression.HasMember(
            object o
            ) => o is T t ? HasMember(t) : false;

        IEnumerable<IClassAxiom> IClassExpression.Axioms => Axioms;

        public abstract bool HasMember(T t);

        IEnumerable<IClassAxiom<T>> IClassExpression<T>.Axioms => Axioms;

        protected static Func<T, IEnumerable<TProperty>> AsEnumerable<T, TProperty>(
            Func<T, TProperty> property
            )
        {
            return t => property(t).ToEnumerable();
        }
    }

    public abstract class ClassExpressionDecorator<T>: ClassExpression<T>
    {
        protected IClassExpression<T> _decorated;

        protected ClassExpressionDecorator(
            IClassExpression<T> decorated
            )
        {
            _decorated = decorated;
        }
    }

    public class Class<T>: ClassExpression<T>
    {
        public IList<IClassExpression<T>> ClassExpressions { get; protected set; }

        public Class(
            params IClassExpression<T>[] classExpressions
            ) : base()
        {
            ClassExpressions = classExpressions;
        }

        public override bool HasMember(
            T t
            ) => ClassExpressions.All(classExpression => classExpression.HasMember(t));
    }

    public class IntersectionOf<T>: ClassExpression<T>
    {
        public IList<IClassExpression<T>> ClassExpressions { get; protected set; }

        public IntersectionOf(
            params IClassExpression<T>[] classExpressions
            )
        {
            ClassExpressions = classExpressions.ToList();
        }

        public override bool HasMember(
            T t
            ) => ClassExpressions.All(ce => ce.HasMember(t));

        public IntersectionOf<T> Append(
            IClassExpression<T> classExpression
            )
        {
            ClassExpressions.Add(classExpression);
            return this;
        }
    }

    public class UnionOf<T>: ClassExpression<T>
    {
        public IList<IClassExpression<T>> ClassExpressions { get; protected set; }

        public UnionOf(
            params IClassExpression<T>[] classExpressions
            )
        {
            ClassExpressions = classExpressions.ToList();
        }

        public override bool HasMember(
            T t
            ) => ClassExpressions.Any(ce => ce.HasMember(t));

        public UnionOf<T> Append(
            IClassExpression<T> classExpression
            )
        {
            ClassExpressions.Add(classExpression);
            return this;
        }
    }

    public class ComplementOf<T>: ClassExpression<T>
    {
        public IClassExpression<T> ClassExpression { get; protected set; }

        public ComplementOf(
            IClassExpression<T> classExpression
            )
        {
            ClassExpression = classExpression;
        }

        public override bool HasMember(
            T t
            ) => !ClassExpression.HasMember(t);
    }

    public class OneOf<T>: ClassExpression<T>
    {
        public IList<T> Individuals { get; protected set; }

        public OneOf(
            params T[] individuals
            )
        {
            Individuals = individuals.ToList();
        }

        public override bool HasMember(
            T t
            ) => Individuals.Contains(t);
    }

    public abstract class PropertyExpression<T, TProperty>: ClassExpression<T>
    {
        public string Name { get; protected set; }

        public Func<T, IEnumerable<TProperty>> Property { get; protected set; }

        protected PropertyExpression(
            Expression<Func<T, IEnumerable<TProperty>>> property
            )
        {
            Name = property.Body is MemberExpression memberExpression ? memberExpression.Member.Name : typeof(TProperty).Name;
            Property = property.Compile();
        }
        protected PropertyExpression(
            Expression<Func<T, TProperty>> property
            )
        {
            Name = property.Body is MemberExpression memberExpression ? memberExpression.Member.Name : typeof(TProperty).Name;
            Property = AsEnumerable(property.Compile());
        }
    }

    public class PropertySomeValuesFrom<T, TProperty>: PropertyExpression<T, TProperty>
    {
        public IClassExpression<TProperty> ClassExpression { get; protected set; }

        public PropertySomeValuesFrom(
            Expression<Func<T, IEnumerable<TProperty>>> property,
            IClassExpression<TProperty>                 classExpression
            ) : base(property)
        {
            ClassExpression = classExpression;
        }

        public PropertySomeValuesFrom(
            Expression<Func<T, TProperty>> property,
            IClassExpression<TProperty>    classExpression
            ) : base(property)
        {
            ClassExpression = classExpression;
        }

        public override bool HasMember(
            T t
            ) => Property(t).Any(ClassExpression.HasMember);
    }

    public class PropertyAllValuesFrom<T, TProperty>: PropertyExpression<T, TProperty>
    {
        public IClassExpression<TProperty> ClassExpression { get; protected set; }

        public PropertyAllValuesFrom(
            Expression<Func<T, IEnumerable<TProperty>>> property,
            IClassExpression<TProperty>                 classExpression
            ) : base(property)
        {
            ClassExpression = classExpression;
        }

        public PropertyAllValuesFrom(
            Expression<Func<T, TProperty>> property,
            IClassExpression<TProperty>    classExpression
            ) : base(property)
        {
            ClassExpression = classExpression;
        }

        public override bool HasMember(
            T t
            ) => Property(t).All(ClassExpression.HasMember);
    }

    public class PropertyValue<T, TProperty>: PropertyExpression<T, TProperty>
    {
        public TProperty Individual { get; protected set; }

        public PropertyValue(
            Expression<Func<T, IEnumerable<TProperty>>> property,
            TProperty                                   individual
            ) : base(property)
        {
            Individual = individual;
        }

        public PropertyValue(
            Expression<Func<T, TProperty>> property,
            TProperty                      individual
            ) : base(property)
        {
            Individual = individual;
        }

        public override bool HasMember(
            T t
            ) => Property(t).Contains(Individual);
    }

    public abstract class PropertyCardinalityExpression<T, TProperty>: PropertyExpression<T, TProperty>
    {
        public int                         Cardinality     { get; protected set; }
        public IClassExpression<TProperty> ClassExpression { get; protected set; }

        public PropertyCardinalityExpression(
            Expression<Func<T, IEnumerable<TProperty>>> property,
            int                                         cardinality,
            IClassExpression<TProperty>                 classExpression
            ) : base(property)
        {
            Cardinality     = cardinality;
            ClassExpression = classExpression;
        }

        public PropertyCardinalityExpression(
            Expression<Func<T, TProperty>> property,
            int                            cardinality,
            IClassExpression<TProperty>    classExpression
            ) : base(property)
        {
            Cardinality     = cardinality;
            ClassExpression = classExpression;
        }

        protected int Count(
            T t
            ) => ClassExpression != null ? Property(t).Count(ClassExpression.HasMember) : Property(t).Count(); 
    }
    
    public class PropertyMinCardinality<T, TProperty>: PropertyCardinalityExpression<T, TProperty>
    {
        public PropertyMinCardinality(
            Expression<Func<T, IEnumerable<TProperty>>> property,
            int                                         cardinality,
            IClassExpression<TProperty>                 classExpression = null
            ) : base(
                property,
                cardinality,
                classExpression)
        {
        }

        public PropertyMinCardinality(
            Expression<Func<T, TProperty>> property,
            int                            cardinality,
            IClassExpression<TProperty>    classExpression = null
            ) : base(
                property,
                cardinality,
                classExpression)
        {
        }

        public override bool HasMember(
            T t
            ) => Count(t) >= Cardinality;
    }

    public class PropertyMaxCardinality<T, TProperty>: PropertyCardinalityExpression<T, TProperty>
    {
        public PropertyMaxCardinality(
            Expression<Func<T, IEnumerable<TProperty>>> property,
            int                                         cardinality,
            IClassExpression<TProperty>                 classExpression = null
            ) : base(
                property,
                cardinality,
                classExpression)
        {
        }

        public PropertyMaxCardinality(
            Expression<Func<T, TProperty>> property,
            int                            cardinality,
            IClassExpression<TProperty>    classExpression = null
            ) : base(
                property,
                cardinality,
                classExpression)
        {
        }

        public override bool HasMember(
            T t
            ) => Count(t) <= Cardinality;
    }

    public class PropertyExactCardinality<T, TProperty>: PropertyCardinalityExpression<T, TProperty>
    {
        public PropertyExactCardinality(
            Expression<Func<T, IEnumerable<TProperty>>> property,
            int                                         cardinality,
            IClassExpression<TProperty>                 classExpression = null
            ) : base(
                property,
                cardinality,
                classExpression)
        {
        }

        public PropertyExactCardinality(
            Expression<Func<T, TProperty>> property,
            int                            cardinality,
            IClassExpression<TProperty>    classExpression = null
            ) : base(
                property,
                cardinality,
                classExpression)
        {
        }

        public override bool HasMember(
            T t
            ) => Count(t) == Cardinality;
    }

    public interface IClassAxiom
    {
        Type Type { get; }

        bool Validate(object o);
    }

    public interface IClassAxiom<in T>: IClassAxiom
    {
        bool Validate(T t);
    }

    public abstract class ClassAxiom<T>: IClassAxiom<T>
    {
        Type IClassAxiom.Type => typeof(T);

        bool IClassAxiom.Validate(
            object o
            ) => o is T t ? Validate(t) : false;

        public abstract bool Validate(T t);
    }

    public class SubClass<T>: ClassAxiom<T>
    {
        public ClassExpression<T>  SubClassExpression   { get; protected set; }
        public IClassExpression<T> SuperClassExpression { get; protected set; }

        public SubClass(
            ClassExpression<T>  subClassExpression,
            IClassExpression<T> superClassExpression
            )
        {
            SubClassExpression   = subClassExpression;
            SuperClassExpression = superClassExpression;

            SubClassExpression.Axioms.Add(this);
        }

        public override bool Validate(
            T t
            )
        {
            return
                !SubClassExpression.HasMember(t) ||
                SuperClassExpression.HasMember(t);
        }
    }

    public interface IHasKey<in T>
    {
        bool AreEqual(T lhs, T rhs);
    }

    public class HasKey<T, TKey>: IHasKey<T>
    {
        private Func<T, TKey> _keyAccessor;

        public HasKey(
            Func<T, TKey> keyAccessor 
            )
        {
            _keyAccessor = keyAccessor;
        }

        bool IHasKey<T>.AreEqual(
            T lhs,
            T rhs
            ) => _keyAccessor(lhs).Equals(_keyAccessor(rhs));
    }
}
