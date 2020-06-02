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

        IClassExpression IPropertyExpression.Domain => _domain;

        IEnumerable<object> IPropertyExpression.Values(
            object individual
            ) => individual is T t ? _property(t).Cast<object>() : Enumerable.Empty<object>();
    }

    public abstract class FunctionalProperty<T, TProperty>:
        Entity,
        IFunctionalPropertyExpression
    {
        private IClassExpression   _domain;
        private Func<T, TProperty> _property;

        protected FunctionalProperty(
            IOntology                      ontology,
            IClassExpression               domain,
            Expression<Func<T, TProperty>> property
            ) : base(
                ontology,
                property.Body is MemberExpression memberExpression ? memberExpression.Member.Name : typeof(TProperty).Name)
        {
            _domain   = domain;
            _property = property.Compile();
        }

        IClassExpression IPropertyExpression.Domain => _domain;

        IEnumerable<object> IPropertyExpression.Values(
            object individual
            ) => Value(individual).ToEnumerable();

        public object Value(
            object individual
            ) => individual is T t ? (object)_property(t) : null;
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
            domain.ObjectProperties.Add(this);
        }

        IClassExpression IObjectPropertyExpression.Range => _range;
    }

    public class FunctionalObjectProperty<T, TProperty>:
        FunctionalProperty<T, TProperty>,
        IFunctionalObjectPropertyExpression
    {
        private IClassExpression _range;

        public FunctionalObjectProperty(
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
    }
    
    public class FunctionalDataProperty<T, TProperty>:
        FunctionalProperty<T, TProperty>,
        IFunctionalDataPropertyExpression
    {
        public FunctionalDataProperty(
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
}
