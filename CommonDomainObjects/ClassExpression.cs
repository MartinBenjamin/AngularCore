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

    public class ObjectIntersectionOf<T>: ClassExpression<T>
    {
        public IList<IClassExpression<T>> ClassExpressions { get; protected set; }

        public ObjectIntersectionOf(
            params IClassExpression<T>[] classExpressions
            )
        {
            ClassExpressions = classExpressions.ToList();
        }

        public override bool HasMember(
            T t
            ) => ClassExpressions.All(ce => ce.HasMember(t));

        public ObjectIntersectionOf<T> Append(
            IClassExpression<T> classExpression
            )
        {
            ClassExpressions.Add(classExpression);
            return this;
        }
    }

    public class ObjectUnionOf<T>: ClassExpression<T>
    {
        public IList<IClassExpression<T>> ClassExpressions { get; protected set; }

        public ObjectUnionOf(
            params IClassExpression<T>[] classExpressions
            )
        {
            ClassExpressions = classExpressions.ToList();
        }

        public override bool HasMember(
            T t
            ) => ClassExpressions.Any(ce => ce.HasMember(t));

        public ObjectUnionOf<T> Append(
            IClassExpression<T> classExpression
            )
        {
            ClassExpressions.Add(classExpression);
            return this;
        }
    }

    public class ObjectComplementOf<T>: ClassExpression<T>
    {
        public IClassExpression<T> ClassExpression { get; protected set; }

        public ObjectComplementOf(
            IClassExpression<T> classExpression
            )
        {
            ClassExpression = classExpression;
        }

        public override bool HasMember(
            T t
            ) => !ClassExpression.HasMember(t);
    }

    public class ObjectOneOf<T>: ClassExpression<T>
    {
        public IList<IIndividual<T>> Individuals { get; protected set; }

        public ObjectOneOf(
            params IIndividual<T>[] individuals
            )
        {
            Individuals = individuals.ToList();
        }

        public override bool HasMember(
            T t
            ) => Individuals.Any(individual => individual.IsEqual(t));
    }

    public abstract class PropertyExpression<T, TProperty>: ClassExpression<T>
    {
        public string                          Name     { get; protected set; }

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

    public class ObjectSomeValuesFrom<T, TProperty>: PropertyExpression<T, TProperty>
    {
        public IClassExpression<TProperty> ClassExpression { get; protected set; }

        public ObjectSomeValuesFrom(
            Expression<Func<T, IEnumerable<TProperty>>> property,
            IClassExpression<TProperty>                 classExpression
            ) : base(property)
        {
            ClassExpression = classExpression;
        }

        public ObjectSomeValuesFrom(
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

    public class ObjectAllValuesFrom<T, TProperty>: PropertyExpression<T, TProperty>
    {
        public IClassExpression<TProperty> ClassExpression { get; protected set; }

        public ObjectAllValuesFrom(
            Expression<Func<T, IEnumerable<TProperty>>> property,
            IClassExpression<TProperty>                 classExpression
            ) : base(property)
        {
            ClassExpression = classExpression;
        }

        public ObjectAllValuesFrom(
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

    public class ObjectHasValue<T, TProperty>: PropertyExpression<T, TProperty>
    {
        public IIndividual<TProperty> Individual { get; protected set; }

        public ObjectHasValue(
            Expression<Func<T, IEnumerable<TProperty>>> property,
            IIndividual<TProperty>                      individual
            ) : base(property)
        {
            Individual = individual;
        }

        public ObjectHasValue(
            Expression<Func<T, TProperty>> property,
            IIndividual<TProperty>         individual
            ) : base(property)
        {
            Individual = individual;
        }

        public override bool HasMember(
            T t
            ) => Property(t).Any(v => Individual.IsEqual(v));
    }

    public abstract class ObjectCardinalityExpression<T, TProperty>: PropertyExpression<T, TProperty>
    {
        public int                         Cardinality     { get; protected set; }
        public IClassExpression<TProperty> ClassExpression { get; protected set; }

        public ObjectCardinalityExpression(
            Expression<Func<T, IEnumerable<TProperty>>> property,
            int                                         cardinality,
            IClassExpression<TProperty>                 classExpression
            ) : base(property)
        {
            Cardinality     = cardinality;
            ClassExpression = classExpression;
        }

        public ObjectCardinalityExpression(
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
    
    public class ObjectMinCardinality<T, TProperty>: ObjectCardinalityExpression<T, TProperty>
    {
        public ObjectMinCardinality(
            Expression<Func<T, IEnumerable<TProperty>>> property,
            int                                         cardinality,
            IClassExpression<TProperty>                 classExpression = null
            ) : base(
                property,
                cardinality,
                classExpression)
        {
        }

        public ObjectMinCardinality(
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

    public class ObjectMaxCardinality<T, TProperty>: ObjectCardinalityExpression<T, TProperty>
    {
        public ObjectMaxCardinality(
            Expression<Func<T, IEnumerable<TProperty>>> property,
            int                                         cardinality,
            IClassExpression<TProperty>                 classExpression = null
            ) : base(
                property,
                cardinality,
                classExpression)
        {
        }

        public ObjectMaxCardinality(
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

    public class ObjectExactCardinality<T, TProperty>: ObjectCardinalityExpression<T, TProperty>
    {
        public ObjectExactCardinality(
            Expression<Func<T, IEnumerable<TProperty>>> property,
            int                                         cardinality,
            IClassExpression<TProperty>                 classExpression = null
            ) : base(
                property,
                cardinality,
                classExpression)
        {
        }

        public ObjectExactCardinality(
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

    public interface IDataRange<T>
    {
        bool HasMember(T value);
    }

    public class DataComplementOf<T>: IDataRange<T>
    {
        public IDataRange<T> DataRange { get; protected set; }

        public DataComplementOf(
            IDataRange<T> dataRange
            )
        {
            DataRange = dataRange;
        }

        bool IDataRange<T>.HasMember(
            T value
            ) => !DataRange.HasMember(value);
    }

    public class DataOneOf<T>: IDataRange<T>
    {
        public IList<T> Values { get; protected set; }

        public DataOneOf(
            params T[] values
            )
        {
            Values = values;
        }

        bool IDataRange<T>.HasMember(
            T value
            ) => Values.Contains(value);
    }

    public class DataSomeValuesFrom<T, TProperty>: PropertyExpression<T, TProperty>
    {
        public IDataRange<TProperty> DataRange { get; protected set; }

        public DataSomeValuesFrom(
            Expression<Func<T, IEnumerable<TProperty>>> property,
            IDataRange<TProperty>                       dataRange
            ) : base(property)
        {
            DataRange = dataRange;
        }

        public DataSomeValuesFrom(
            Expression<Func<T, TProperty>> property,
            IDataRange<TProperty>          dataRange
            ) : base(property)
        {
            DataRange = dataRange;
        }

        public override bool HasMember(
            T t
            ) => Property(t).Any(DataRange.HasMember);
    }

    public class DataAllValuesFrom<T, TProperty>: PropertyExpression<T, TProperty>
    {
        public IDataRange<TProperty> DataRange { get; protected set; }

        public DataAllValuesFrom(
            Expression<Func<T, IEnumerable<TProperty>>> property,
            IDataRange<TProperty>                       dataRange
            ) : base(property)
        {
            DataRange = dataRange;
        }

        public DataAllValuesFrom(
            Expression<Func<T, TProperty>> property,
            IDataRange<TProperty>          dataRange
            ) : base(property)
        {
            DataRange = dataRange;
        }

        public override bool HasMember(
            T t
            ) => Property(t).All(DataRange.HasMember);
    }

    public class DataHasValue<T, TProperty>: PropertyExpression<T, TProperty>
    {
        public TProperty Value { get; protected set; }

        public DataHasValue(
            Expression<Func<T, IEnumerable<TProperty>>> property,
            TProperty                                   value
            ) : base(property)
        {
            Value = value;
        }

        public DataHasValue(
            Expression<Func<T, TProperty>> property,
            TProperty                      value
            ) : base(property)
        {
            Value = value;
        }

        public override bool HasMember(
            T t
            ) => Property(t).Contains(Value);
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
        private IList<Func<T, TKey>> _keyAccessors;

        public HasKey(
            params Func<T, TKey>[] keyAccessors 
            )
        {
            _keyAccessors = keyAccessors;
        }

        bool IHasKey<T>.AreEqual(
            T lhs,
            T rhs
            ) => _keyAccessors.All(keyAccessor => keyAccessor(lhs).Equals(keyAccessor(rhs)));
    }

    public interface IIndividual<out T>
    {
        //IClassExpression<T> Class { get; }

        bool IsEqual(object o);
    }

    public class Individual<T>: IIndividual<T>
    {
        public IClassExpression<T> Class    { get; protected set; }

        public T                   Instance { get; protected set; }

        public Individual(
            IClassExpression<T> classExpression,
            T                   instance
            )
        {
            Class    = classExpression;
            Instance = instance;
        }

        bool IIndividual<T>.IsEqual(
            object o
            )
        {
            // Find HasKey Axiom.
            return false;
        }
    }
}
