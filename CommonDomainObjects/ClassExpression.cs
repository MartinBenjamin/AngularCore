using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;

namespace CommonDomainObjects
{
    public struct InstanceEnumerable<T>: IEnumerable<T>
    {
        private T _t;

        private struct Enumerator<T>: IEnumerator<T>
        {
            private enum State
            {
                NotIterated,
                Iterating,
                Iterated
            };

            private readonly T _t;
            private T          _current;
            private State      _state;

            public Enumerator(
                T t
                )
            {
                _t       = t;
                _current = default(T);
                _state   = State.NotIterated;
            }

            T IEnumerator<T>.Current => _current;

            object IEnumerator.Current => _current;

            void IDisposable.Dispose()
            {
            }

            bool IEnumerator.MoveNext()
            {
                switch(_state)
                {
                    case State.NotIterated:
                        _current = _t;
                        _state = State.Iterating;
                        return true;
                    case State.Iterating:
                        _current = default(T);
                        _state = State.Iterated;
                        return false;
                    default:
                    case State.Iterated:
                    return false;
                }
            }

            void IEnumerator.Reset()
            {
                _current = default(T);
                _state   = State.NotIterated;
            }
        }

        public InstanceEnumerable(
            T t
            )
        {
            _t = t;
        }

        public IEnumerator<T> GetEnumerator()
        {
            return new Enumerator<T>(_t);
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }
    }

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
            return t => new InstanceEnumerable<TProperty>(property(t));
        }
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

        public PropertySomeValues(
            Func<T, TProperty>         property,
            ClassExpression<TProperty> classExpression
            ) : this(
                AsEnumerable(property),
                classExpression)
        {
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

        public PropertyAllValues(
            Func<T, TProperty>         property,
            ClassExpression<TProperty> classExpression
            ) : this(
                AsEnumerable(property),
                classExpression)
        {
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

        public PropertyHasValue(
            Func<T, TProperty> property,
            TProperty          individual
            ) : this(
                AsEnumerable(property),
                individual)
        {
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
