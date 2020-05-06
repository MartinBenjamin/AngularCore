using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;

namespace CommonDomainObjects
{
    public interface IClassExpression
    {
        Type Type { get; }

        bool HasMember(object o);
    }

    public abstract class ClassExpression<T>: IClassExpression
    {
        Type IClassExpression.Type => typeof(T);

        bool IClassExpression.HasMember(
            object o
            ) => o is T t ? HasMember(t) : false;

        public abstract bool HasMember(T t);
    }

    public class Class<T>: ClassExpression<T>
    {
        public Class() : base()
        {
        }

        public override bool HasMember(
            T t
            ) => true;
    }


    public class Intersection<T>: ClassExpression<T>
    {
        public IList<ClassExpression<T>> ClassExpressions { get; protected set; }

        public Intersection(
            params ClassExpression<T>[] classExpressions
            )
        {
            ClassExpressions = classExpressions.ToList();
        }

        public override bool HasMember(
            T t
            ) => ClassExpressions.All(ce => ce.HasMember(t));
    }

    public class Union<T>: ClassExpression<T>
    {
        public IList<ClassExpression<T>> ClassExpressions { get; protected set; }

        public Union(
            params ClassExpression<T>[] classExpressions
            )
        {
            ClassExpressions = classExpressions.ToList();
        }

        public override bool HasMember(
            T t
            ) => ClassExpressions.Any(ce => ce.HasMember(t));
    }

    public class Complement<T>: ClassExpression<T>
    {
        public ClassExpression<T> ClassExpression { get; protected set; }

        public Complement(
            ClassExpression<T> classExpression
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
        public Func<T, IEnumerable<TProperty>> Property { get; protected set; }

        protected PropertyExpression(
            Func<T, IEnumerable<TProperty>> property
            )
        {
            Property = property;
        }
    }

    public class PropertySomeValues<T, TProperty>: PropertyExpression<T, TProperty>
    {
        public ClassExpression<TProperty> ClassExpression { get; protected set; }

        public PropertySomeValues(
            Func<T, IEnumerable<TProperty>> property,
            ClassExpression<TProperty>      classExpression
            ) : base(property)
        {
            ClassExpression = classExpression;
        }

        public override bool HasMember(
            T t
            ) => Property(t).Any(ClassExpression.HasMember);
    }

    public class PropertyAllValues<T, TProperty>: PropertyExpression<T, TProperty>
    {
        public ClassExpression<TProperty> ClassExpression { get; protected set; }

        public PropertyAllValues(
            Func<T, IEnumerable<TProperty>> property,
            ClassExpression<TProperty>      classExpression
            ) : base(property)
        {
            ClassExpression = classExpression;
        }

        public override bool HasMember(
            T t
            ) => Property(t).All(ClassExpression.HasMember);
    }

    public class PropertyHasValue<T, TProperty>: PropertyExpression<T, TProperty>
    {
        public TProperty Individual { get; protected set; }

        public PropertyHasValue(
            Func<T, IEnumerable<TProperty>> property,
            TProperty                       individual
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
        public int                        Cardinality     { get; protected set; }
        public ClassExpression<TProperty> ClassExpression { get; protected set; }

        public PropertyCardinalityExpression(
            Func<T, IEnumerable<TProperty>> property,
            int                             cardinality,
            ClassExpression<TProperty>      classExpression
            ) : base(property)
        {
            Cardinality     = cardinality;
            ClassExpression = classExpression ?? new Class<TProperty>();
        }
    }
    
    public class PropertyMinCardinality<T, TProperty>: PropertyCardinalityExpression<T, TProperty>
    {
        public PropertyMinCardinality(
            Func<T, IEnumerable<TProperty>> property,
            int                             cardinality,
            ClassExpression<TProperty>      classExpression = null
            ) : base(
                property,
                cardinality,
                classExpression)
        {
        }

        public override bool HasMember(
            T t
            ) => Property(t).Count(ClassExpression.HasMember) >= Cardinality;
    }

    public class PropertyMaxCardinality<T, TProperty>: PropertyCardinalityExpression<T, TProperty>
    {
        public PropertyMaxCardinality(
            Func<T, IEnumerable<TProperty>> property,
            int                             cardinality,
            ClassExpression<TProperty>      classExpression = null
            ) : base(
                property,
                cardinality,
                classExpression)
        {
        }

        public override bool HasMember(
            T t
            ) => Property(t).Count(ClassExpression.HasMember) <= Cardinality;
    }

    public class PropertyExactCardinality<T, TProperty>: PropertyCardinalityExpression<T, TProperty>
    {
        public PropertyExactCardinality(
            Func<T, IEnumerable<TProperty>> property,
            int                             cardinality,
            ClassExpression<TProperty>      classExpression = null
            ) : base(
                property,
                cardinality,
                classExpression)
        {
        }

        public override bool HasMember(
            T t
            ) => Property(t).Count(ClassExpression.HasMember) == Cardinality;
    }
}
