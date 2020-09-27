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
        private Func<T, IEnumerable<TProperty>> _property;

        protected Property(
            IOntology                       ontology,
            string                          name,
            Func<T, IEnumerable<TProperty>> property
            ) : base(
                ontology,
                name)
        {
            _property = property;
        }

        public virtual IEnumerable<object> Values(
            IOntology context,
            object    individual
            )
        {
            switch(individual)
            {
                case T t                             : return _property(t).Cast<object>();
                case INamedIndividual namedIndividual: return Values(
                    context,
                    namedIndividual);
                default                              : return Enumerable.Empty<object>();
            }
        }

        protected abstract IEnumerable<object> Values(
            IOntology        context,
            INamedIndividual namedIndividual);
    }

    public abstract class FunctionalProperty<T, TProperty>:
        Entity,
        IPropertyExpression
    {
        private Func<T, TProperty> _property;

        protected FunctionalProperty(
            IOntology          ontology,
            string             name,
            Func<T, TProperty> property
            ) : base(
                ontology,
                name)
        {
            _property = property;
        }

        IEnumerable<object> IPropertyExpression.Values(
            IOntology context,
            object    individual
            ) => Value(
                context,
                individual).ToEnumerable();

        protected object Value(
            IOntology context,
            object    individual
            )
        {
            switch(individual)
            {
                case T t                             : return _property(t);
                case INamedIndividual namedIndividual: return Value(
                    context,
                    namedIndividual);
                default                              : return null;
            }
        }

        protected abstract object Value(
            IOntology        context,
            INamedIndividual namedIndividual);
    }

    public class ObjectProperty<T, TProperty>:
        Property<T, TProperty>,
        IObjectPropertyExpression
    {
        public ObjectProperty(
            IOntology                       ontology,
            string                          name,
            Func<T, IEnumerable<TProperty>> property
            ) : base(
                ontology,
                name,
                property)
        {
        }

        protected override IEnumerable<object> Values(
            IOntology        context,
            INamedIndividual namedIndividual
            ) => context
                .Get<IObjectPropertyAssertion>()
                .Where(objectPropertyAssertion =>
                    objectPropertyAssertion.SourceIndividual         == namedIndividual &&
                    objectPropertyAssertion.ObjectPropertyExpression == this)
                .Select(objectPropertyAssertion => objectPropertyAssertion.TargetIndividual);
    }

    public class FunctionalObjectProperty<T, TProperty>:
        FunctionalProperty<T, TProperty>,
        IObjectPropertyExpression
    {    
        public FunctionalObjectProperty(
            IOntology          ontology,
            string             name,
            Func<T, TProperty> property
            ) : base(
                ontology,
                name,
                property)
        {
        }

        protected override object Value(
            IOntology        context,
            INamedIndividual namedIndividual
            ) => context
                .Get<IObjectPropertyAssertion>()
                .Where(objectPropertyAssertion =>
                    objectPropertyAssertion.SourceIndividual         == namedIndividual &&
                    objectPropertyAssertion.ObjectPropertyExpression == this)
                .Select(objectPropertyAssertion => objectPropertyAssertion.TargetIndividual)
                .FirstOrDefault();
    }

    public class DataProperty<T, TProperty>:
        Property<T, TProperty>,
        IDataPropertyExpression
    {
        public DataProperty(
            IOntology                       ontology,
            string                          name,
            Func<T, IEnumerable<TProperty>> property
            ) : base(
                ontology,
                name,
                property)
        {
        }

        bool IDataPropertyExpression.AreEqual(
            IOntology context,
            object    lhs,
            object    rhs
            ) => Values(context, lhs).ToHashSet().SetEquals(Values(context, rhs));

        protected override IEnumerable<object> Values(
            IOntology        context,
            INamedIndividual namedIndividual
            ) => context
                .Get<IDataPropertyAssertion>()
                .Where(dataPropertyAssertion =>
                    dataPropertyAssertion.SourceIndividual       == namedIndividual &&
                    dataPropertyAssertion.DataPropertyExpression == this)
                .Select(dataPropertyAssertion => dataPropertyAssertion.TargetValue);
    }
    
    public class FunctionalDataProperty<T, TProperty>:
        FunctionalProperty<T, TProperty>,
        IDataPropertyExpression
    {
        public FunctionalDataProperty(
            IOntology          ontology,
            string             name,
            Func<T, TProperty> property
            ) : base(
                ontology,
                name,
                property)
        {
        }

        bool IDataPropertyExpression.AreEqual(
            IOntology context,
            object    lhs,
            object    rhs
            ) => Equals(
                Value(context, lhs),
                Value(context, rhs));

        protected override object Value(
            IOntology        context,
            INamedIndividual namedIndividual
            ) => context
                .Get<IDataPropertyAssertion>()
                .Where(dataPropertyAssertion =>
                    dataPropertyAssertion.SourceIndividual       == namedIndividual &&
                    dataPropertyAssertion.DataPropertyExpression == this)
                .Select(dataPropertyAssertion => dataPropertyAssertion.TargetValue)
                .FirstOrDefault();
    }

    public abstract class Property:
        Entity,
        IPropertyExpression
    {
        protected Property(
            IOntology ontology,
            string    name
            ) : base(
                ontology,
                name)
        {
        }

        public virtual IEnumerable<object> Values(
            IOntology context,
            object    individual
            )
        {
            switch(individual)
            {
                case INamedIndividual namedIndividual: return Values(
                    context,
                    namedIndividual);
                default:
                    var value = individual.GetValue(_name);
                    return value is IEnumerable<object> enumerable ? enumerable : value.ToEnumerable();
            }
        }

        protected abstract IEnumerable<object> Values(
            IOntology        context,
            INamedIndividual namedIndividual);
    }

    public class ObjectProperty:
        Property,
        IObjectPropertyExpression
    {
        public ObjectProperty(
            IOntology ontology,
            string    name
            ) : base(
                ontology,
                name)
        {
        }

        protected override IEnumerable<object> Values(
            IOntology        context,
            INamedIndividual namedIndividual
            ) => context
                .Get<IObjectPropertyAssertion>()
                .Where(objectPropertyAssertion =>
                    objectPropertyAssertion.SourceIndividual         == namedIndividual &&
                    objectPropertyAssertion.ObjectPropertyExpression == this)
                .Select(objectPropertyAssertion => objectPropertyAssertion.TargetIndividual);
    }

    public class DataProperty:
        Property,
        IDataPropertyExpression
    {
        public DataProperty(
            IOntology ontology,
            string    name
            ) : base(
                ontology,
                name)
        {
        }

        bool IDataPropertyExpression.AreEqual(
            IOntology context,
            object    lhs,
            object    rhs
            ) => Values(context, lhs).ToHashSet().SetEquals(Values(context, rhs));

        protected override IEnumerable<object> Values(
            IOntology        context,
            INamedIndividual namedIndividual
            ) => context
                .Get<IDataPropertyAssertion>()
                .Where(dataPropertyAssertion =>
                    dataPropertyAssertion.SourceIndividual       == namedIndividual &&
                    dataPropertyAssertion.DataPropertyExpression == this)
                .Select(dataPropertyAssertion => dataPropertyAssertion.TargetValue);
    }
}
