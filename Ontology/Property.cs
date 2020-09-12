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
        private Func<T, IEnumerable<TProperty>> _property;

        protected Property(
            IOntology                                   ontology,
            Expression<Func<T, IEnumerable<TProperty>>> property
            ) : base(
                ontology,
                property.Body is MemberExpression memberExpression ? memberExpression.Member.Name : typeof(TProperty).Name)
        {
            _property = property.Compile();
        }

        public virtual IEnumerable<object> Values(
            object individual
            )
        {
            switch(individual)
            {
                case T t                             : return _property(t).Cast<object>();
                case INamedIndividual namedIndividual: return Values(namedIndividual);
                default                              : return Enumerable.Empty<object>();
            }
        }

        protected abstract IEnumerable<object> Values(INamedIndividual namedIndividual);
    }

    public abstract class FunctionalProperty<T, TProperty>:
        Entity,
        IPropertyExpression
    {
        private Func<T, TProperty> _property;

        protected FunctionalProperty(
            IOntology                      ontology,
            Expression<Func<T, TProperty>> property
            ) : base(
                ontology,
                property.Body is MemberExpression memberExpression ? memberExpression.Member.Name : typeof(TProperty).Name)
        {
            _property = property.Compile();
        }

        IEnumerable<object> IPropertyExpression.Values(
            object individual
            ) => Value(individual).ToEnumerable();

        protected object Value(
            object individual
            )
        {
            switch(individual)
            {
                case T t                             : return _property(t);
                case INamedIndividual namedIndividual: return Value(namedIndividual);
                default                              : return null;
            }
        }

        protected abstract object Value(INamedIndividual namedIndividual);
    }

    public class ObjectProperty<T, TProperty>:
        Property<T, TProperty>,
        IObjectPropertyExpression
    {
        public ObjectProperty(
            IOntology                                   ontology,
            Expression<Func<T, IEnumerable<TProperty>>> property
            ) : base(
                ontology,
                property)
        {
        }

        protected override IEnumerable<object> Values(
            INamedIndividual namedIndividual
            ) => namedIndividual[this];
    }

    public class FunctionalObjectProperty<T, TProperty>:
        FunctionalProperty<T, TProperty>,
        IObjectPropertyExpression
    {
        public FunctionalObjectProperty(
            IOntology                      ontology,
            Expression<Func<T, TProperty>> property
            ) : base(
                ontology,
                property)
        {
        }

        protected override object Value(
            INamedIndividual namedIndividual
            ) => namedIndividual[this].FirstOrDefault();
    }

    public class DataProperty<T, TProperty>:
        Property<T, TProperty>,
        IDataPropertyExpression
    {
        private IDataPropertyRange _dataPropertyRange;

        public DataProperty(
            IOntology                                   ontology,
            Expression<Func<T, IEnumerable<TProperty>>> property
            ) : base(
                ontology,
                property)
        {
        }

        IDataPropertyRange IDataPropertyExpression.Range
        {
            get => _dataPropertyRange;
            set => _dataPropertyRange = value;
        }

        bool IDataPropertyExpression.AreEqual(
            object lhs,
            object rhs
            ) => Values(lhs).ToHashSet().SetEquals(Values(rhs).ToHashSet());

        protected override IEnumerable<object> Values(
            INamedIndividual namedIndividual
            ) => namedIndividual[this];
    }
    
    public class FunctionalDataProperty<T, TProperty>:
        FunctionalProperty<T, TProperty>,
        IDataPropertyExpression
    {
        private IDataPropertyRange _dataPropertyRange;

        public FunctionalDataProperty(
            IOntology                      ontology,
            Expression<Func<T, TProperty>> property
            ) : base(
                ontology,
                property)
        {
        }

        IDataPropertyRange IDataPropertyExpression.Range
        {
            get => _dataPropertyRange;
            set => _dataPropertyRange = value;
        }

        protected override object Value(
            INamedIndividual namedIndividual
            ) => namedIndividual[this].FirstOrDefault();

        bool IDataPropertyExpression.AreEqual(
            object lhs,
            object rhs
            ) => Equals(Value(lhs), Value(rhs));
    }
}
