using System;
using System.Collections.Generic;
using System.Linq;

namespace CommonDomainObjects
{
    public interface IClassExpression
    {
        Type Type { get; }

        bool HasMember(
            object o,
            object context);
    }

    public abstract class ClassExpression<T>: IClassExpression
    {
        Type IClassExpression.Type => typeof(T);

        bool IClassExpression.HasMember(
            object o,
            object context
            ) => o is T t ? HasMember(
                t,
                context) : false;

        public abstract bool HasMember(
            T      t,
            object context);

        protected static Func<T, IEnumerable<TProperty>> AsEnumerable<T, TProperty>(
            Func<T, TProperty> property
            )
        {
            return t => property(t).ToEnumerable();
        }
    }

    public abstract class ClassExpressionDecorator<T>: ClassExpression<T>
    {
        protected ClassExpression<T> _decorated;

        protected ClassExpressionDecorator(
            ClassExpression<T> decorated
            )
        {
            _decorated = decorated;
        }
    }

    public class Class<T>: ClassExpression<T>
    {
        public ClassExpression<T> ClassExpression { get; protected set; }

        public Class()
        {
        }

        public Class(
            ClassExpression<T> classExpression
            ) : base()
        {
            ClassExpression = classExpression;
        }

        public override bool HasMember(
            T      t,
            object context
            ) => ClassExpression == null || ClassExpression.HasMember(
                t,
                context);
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
            T      t,
            object context
            ) => ClassExpressions.All(
                ce => ce.HasMember(
                    t,
                    context));

        public Intersection<T> Append(
            ClassExpression<T> classExpression
            )
        {
            ClassExpressions.Add(classExpression);
            return this;
        }
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
            T      t,
            object context
            ) => ClassExpressions.Any(
                ce => ce.HasMember(
                    t,
                    context));

        public Union<T> Append(
            ClassExpression<T> classExpression
            )
        {
            ClassExpressions.Add(classExpression);
            return this;
        }
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
            T      t,
            object context
            ) => !ClassExpression.HasMember(
                t,
                context);
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
            T      t,
            object context
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

        public PropertySomeValues(
            Func<T, TProperty>         property,
            ClassExpression<TProperty> classExpression
            ) : this(
                AsEnumerable(property),
                classExpression)
        {
        }

        public override bool HasMember(
            T      t,
            object context
            ) => Property(t).Any(
                individual => ClassExpression.HasMember(
                    individual,
                    context));
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

        public PropertyAllValues(
            Func<T, TProperty>         property,
            ClassExpression<TProperty> classExpression
            ) : this(
                AsEnumerable(property),
                classExpression)
        {
        }

        public override bool HasMember(
            T      t,
            object context
            ) => Property(t).All(
                individual => ClassExpression.HasMember(
                    individual,
                    context));
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

        public PropertyHasValue(
            Func<T, TProperty> property,
            TProperty          individual
            ) : this(
                AsEnumerable(property),
                individual)
        {
        }

        public override bool HasMember(
            T      t,
            object context
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

        public PropertyMinCardinality(
            Func<T, TProperty>         property,
            int                        cardinality,
            ClassExpression<TProperty> classExpression = null
            ) : this(
                AsEnumerable(property),
                cardinality,
                classExpression)
        {
        }

        public override bool HasMember(
            T      t,
            object context
            ) => Property(t).Count(
                individual => ClassExpression.HasMember(
                    individual,
                    context)) >= Cardinality;
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

        public PropertyMaxCardinality(
            Func<T, TProperty>         property,
            int                        cardinality,
            ClassExpression<TProperty> classExpression = null
            ) : this(
                AsEnumerable(property),
                cardinality,
                classExpression)
        {
        }

        public override bool HasMember(
            T      t,
            object context
            ) => Property(t).Count(
                individual => ClassExpression.HasMember(
                    individual,
                    context)) <= Cardinality;
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
        public PropertyExactCardinality(
            Func<T, TProperty>         property,
            int                        cardinality,
            ClassExpression<TProperty> classExpression = null
            ) : base(
                AsEnumerable(property),
                cardinality,
                classExpression)
        {
        }

        public override bool HasMember(
            T      t,
            object context
            ) => Property(t).Count(
                individual => ClassExpression.HasMember(
                    individual,
                    context)) == Cardinality;
    }
}
