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
    }

    public abstract class ClassExpression<T>: IClassExpression
    {
        Type IClassExpression.Type => typeof(T);

        bool IClassExpression.HasMember(
            object o
            ) => o is T t ? HasMember(t) : false;

        public abstract bool HasMember(T t);

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
            T t
            ) => ClassExpression == null || ClassExpression.HasMember(t);
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
            T t
            ) => ClassExpressions.Any(ce => ce.HasMember(t));

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

    public class PropertySomeValues<T, TProperty>: PropertyExpression<T, TProperty>
    {
        public ClassExpression<TProperty> ClassExpression { get; protected set; }

        public PropertySomeValues(
            Expression<Func<T, IEnumerable<TProperty>>> property,
            ClassExpression<TProperty>                  classExpression
            ) : base(property)
        {
            ClassExpression = classExpression;
        }

        public PropertySomeValues(
            Expression<Func<T, TProperty>> property,
            ClassExpression<TProperty>     classExpression
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
            Expression<Func<T, IEnumerable<TProperty>>> property,
            ClassExpression<TProperty>      classExpression
            ) : base(property)
        {
            ClassExpression = classExpression;
        }

        public PropertyAllValues(
            Expression<Func<T, TProperty>> property,
            ClassExpression<TProperty>     classExpression
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
            Expression<Func<T, IEnumerable<TProperty>>> property,
            TProperty                       individual
            ) : base(property)
        {
            Individual = individual;
        }

        public PropertyHasValue(
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
        public int                        Cardinality     { get; protected set; }
        public ClassExpression<TProperty> ClassExpression { get; protected set; }

        public PropertyCardinalityExpression(
            Expression<Func<T, IEnumerable<TProperty>>> property,
            int                             cardinality,
            ClassExpression<TProperty>      classExpression
            ) : base(property)
        {
            Cardinality     = cardinality;
            ClassExpression = classExpression ?? new Class<TProperty>();
        }

        public PropertyCardinalityExpression(
            Expression<Func<T, TProperty>> property,
            int                            cardinality,
            ClassExpression<TProperty>     classExpression
            ) : base(property)
        {
            Cardinality     = cardinality;
            ClassExpression = classExpression ?? new Class<TProperty>();
        }
    }
    
    public class PropertyMinCardinality<T, TProperty>: PropertyCardinalityExpression<T, TProperty>
    {
        public PropertyMinCardinality(
            Expression<Func<T, IEnumerable<TProperty>>> property,
            int                             cardinality,
            ClassExpression<TProperty>      classExpression = null
            ) : base(
                property,
                cardinality,
                classExpression)
        {
        }

        public PropertyMinCardinality(
            Expression<Func<T, TProperty>> property,
            int                            cardinality,
            ClassExpression<TProperty>     classExpression = null
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
            Expression<Func<T, IEnumerable<TProperty>>> property,
            int                             cardinality,
            ClassExpression<TProperty>      classExpression = null
            ) : base(
                property,
                cardinality,
                classExpression)
        {
        }

        public PropertyMaxCardinality(
            Expression<Func<T, TProperty>> property,
            int                            cardinality,
            ClassExpression<TProperty>     classExpression = null
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
            Expression<Func<T, IEnumerable<TProperty>>> property,
            int                             cardinality,
            ClassExpression<TProperty>      classExpression = null
            ) : base(
                property,
                cardinality,
                classExpression)
        {
        }
        public PropertyExactCardinality(
            Expression<Func<T, TProperty>> property,
            int                            cardinality,
            ClassExpression<TProperty>     classExpression = null
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

    public interface IClassAxiom
    {
        Type Type { get; }

        bool Validate(object o);
    }

    public abstract class ClassAxiom<T>: IClassAxiom
    {
        Type IClassAxiom.Type => typeof(T);

        bool IClassAxiom.Validate(
            object o
            ) => o is T t ? Validate(t) : false;

        public abstract bool Validate(T t);
    }

    public class SubClass<T>: ClassAxiom<T>
    {
        public ClassExpression<T> SubClassExpression   { get; protected set; }
        public ClassExpression<T> SuperClassExpression { get; protected set; }

        public SubClass(
            ClassExpression<T> subClassExpression,
            ClassExpression<T> superClassExpression
            )
        {
            SubClassExpression   = subClassExpression;
            SuperClassExpression = superClassExpression;
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
}
