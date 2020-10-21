using CommonDomainObjects;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Ontology
{
    public abstract class Property<T, TProperty>:
        Entity,
        IPropertyExpression
    {
        private readonly Func<T, IEnumerable<TProperty>> _property;

        protected Property(
            IOntology                       ontology,
            string                          localName,
            Func<T, IEnumerable<TProperty>> property
            ) : base(
                ontology,
                localName)
        {
            _property = property;
        }

        IEnumerable<object> IPropertyExpression.Values(
            object individual
            ) => individual is T t ? _property(t).Cast<object>() : Enumerable.Empty<object>();
    }

    public abstract class FunctionalProperty<T, TProperty>:
        Entity,
        IPropertyExpression
    {
        private readonly Func<T, TProperty> _property;

        protected FunctionalProperty(
            IOntology          ontology,
            string             localName,
            Func<T, TProperty> property
            ) : base(
                ontology,
                localName)
        {
            _property = property;
        }

        IEnumerable<object> IPropertyExpression.Values(
            object individual
            ) => individual is T t ? ((object)_property(t)).ToEnumerable() : Enumerable.Empty<object>();
    }

    public class ObjectProperty<T, TProperty>:
        Property<T, TProperty>,
        IObjectPropertyExpression
    {
        public ObjectProperty(
            IOntology                       ontology,
            string                          localName,
            Func<T, IEnumerable<TProperty>> property
            ) : base(
                ontology,
                localName,
                property)
        {
        }
    }

    public class FunctionalObjectProperty<T, TProperty>:
        FunctionalProperty<T, TProperty>,
        IObjectPropertyExpression
    {    
        public FunctionalObjectProperty(
            IOntology          ontology,
            string             localName,
            Func<T, TProperty> property
            ) : base(
                ontology,
                localName,
                property)
        {
        }
    }

    public class DataProperty<T, TProperty>:
        Property<T, TProperty>,
        IDataPropertyExpression
    {
        public DataProperty(
            IOntology                       ontology,
            string                          localName,
            Func<T, IEnumerable<TProperty>> property
            ) : base(
                ontology,
                localName,
                property)
        {
        }
    }
    
    public class FunctionalDataProperty<T, TProperty>:
        FunctionalProperty<T, TProperty>,
        IDataPropertyExpression,
        IFunctionalDataProperty
    {
        public FunctionalDataProperty(
            IOntology          ontology,
            string             localName,
            Func<T, TProperty> property
            ) : base(
                ontology,
                localName,
                property)
        {
        }

        IDataPropertyExpression IDataPropertyAxiom.DataPropertyExpression => this;
    }

    public abstract class Property:
        Entity,
        IPropertyExpression
    {
        protected Property(
            IOntology ontology,
            string    localName
            ) : base(
                ontology,
                localName)
        {
        }

        IEnumerable<object> IPropertyExpression.Values(
            object individual
            )
        {
            var propertyInfo = individual.GetType().GetProperty(_localName);

            if(propertyInfo == null)
                return Enumerable.Empty<object>();

            var value = propertyInfo.GetValue(
                individual,
                null);

            return value is IEnumerable<object> enumerable ? enumerable : value.ToEnumerable();
        }
    }

    public class ObjectProperty:
        Property,
        IObjectPropertyExpression
    {
        public ObjectProperty(
            IOntology ontology,
            string    localName
            ) : base(
                ontology,
                localName)
        {
        }
    }

    public class DataProperty:
        Property,
        IDataPropertyExpression
    {
        public DataProperty(
            IOntology ontology,
            string    localName
            ) : base(
                ontology,
                localName)
        {
        }
    }
}
