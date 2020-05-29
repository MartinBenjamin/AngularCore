using CommonDomainObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace Ontology
{
    public abstract class Property<T, TProperty>:
        Entity,
        IPropertyExpression
    {
        private IClassExpression                _domain;
        private Func<T, IEnumerable<TProperty>> _property;

        protected Property(
            IOntology                                   ontology,
            IClassExpression                            domain,
            Expression<Func<T, IEnumerable<TProperty>>> property
            ) : base(
                ontology,
                property.Body is MemberExpression memberExpression ? memberExpression.Member.Name : typeof(TProperty).Name)
        {
            _domain   = domain;
            _property = property.Compile();
        }

        protected Property(
            IOntology                      ontology,
            IClassExpression               domain,
            Expression<Func<T, TProperty>> property
            ) : base(
                ontology,
                property.Body is MemberExpression memberExpression ? memberExpression.Member.Name : typeof(TProperty).Name)
        {
            var compiled = property.Compile();
            _domain   = domain;
            _property = individual => compiled(individual).ToEnumerable();
        }

        IClassExpression IPropertyExpression.Domain => _domain;

        IEnumerable<object> IPropertyExpression.Values(
            object individual
            )
        {
            return individual is T t ? _property(t).Cast<object>() : Enumerable.Empty<object>();
        }
    }

    public class ObjectProperty<T, TProperty>:
        Property<T, TProperty>,
        IObjectPropertyExpression
    {
        private IClassExpression _range;

        public ObjectProperty(
            IOntology                                   ontology,
            IClassExpression                            domain,
            IClassExpression                            range,
            Expression<Func<T, IEnumerable<TProperty>>> property
            ) : base(
                ontology,
                domain,
                property)
        {
            _range = range;
        }

        public ObjectProperty(
            IOntology                      ontology,
            IClassExpression               domain,
            IClassExpression               range,
            Expression<Func<T, TProperty>> property
            ) : base(
                ontology,
                domain,
                property)
        {
            _range = range;
        }

        IClassExpression IObjectPropertyExpression.Range => _range;
    }
    
    public class DataProperty<T, TProperty>:
        Property<T, TProperty>,
        IDataPropertyExpression
    {
        public DataProperty(
            IOntology                                   ontology,
            IClassExpression                            domain,
            Expression<Func<T, IEnumerable<TProperty>>> property
            ) : base(
                ontology,
                domain,
                property)
        {
        }

        public DataProperty(
            IOntology                      ontology,
            IClassExpression               domain,
            Expression<Func<T, TProperty>> property
            ) : base(
                ontology,
                domain,
                property)
        {
        }
    }

    public static class IClassExtensions
    {
        public static IDataPropertyExpression DataProperty<T, TProperty>(
            this IClass                                 @class,
            Expression<Func<T, IEnumerable<TProperty>>> property
            ) => new DataProperty<T, TProperty>(
                @class.Ontology,
                @class,
                property);

        public static IDataPropertyExpression DataProperty<T, TProperty>(
            this IClass                    @class,
            Expression<Func<T, TProperty>> property
            ) => new DataProperty<T, TProperty>(
                @class.Ontology,
                @class,
                property);
    }
}
