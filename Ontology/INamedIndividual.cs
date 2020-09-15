using CommonDomainObjects;
using System.Collections.Generic;
using System.Linq;

namespace Ontology
{
    public interface INamedIndividual: IEntity
    {
        IList<IObjectPropertyAssertion> ObjectProperties { get; }
        IList<IDataPropertyAssertion>   DataProperties   { get; }

        IEnumerable<object> this[IObjectPropertyExpression objectPropertyExpression] { get; }
        IEnumerable<object> this[IDataPropertyExpression   dataPropertyExpression  ] { get; }
    }

    public interface IAssertion: IAxiom
    {
    }

    public interface IClassAssertion: IAssertion
    {
        IClassExpression ClassExpression { get; }
        INamedIndividual NamedIndividual { get; }
    }

    public interface IPropertyAssertion: IAssertion
    {
        IPropertyExpression PropertyExpression { get; }
        INamedIndividual    SourceIndividual   { get; }
    }

    public interface IObjectPropertyAssertion: IPropertyAssertion
    {
        IObjectPropertyExpression ObjectPropertyExpression { get; }
        object                    TargetIndividual         { get; }
    }

    public interface IDataPropertyAssertion: IPropertyAssertion
    {
        IDataPropertyExpression DataPropertyExpression { get; }
        object                  TargetValue            { get; }
    }

    public class NamedIndividual:
        Entity,
        INamedIndividual
    {
        private IList<IObjectPropertyAssertion> _objectProperties = new List<IObjectPropertyAssertion>();
        private IList<IDataPropertyAssertion>   _dataProperties   = new List<IDataPropertyAssertion>();

        public NamedIndividual(
            IOntology ontology,
            string    name
            ) : base(
                ontology,
                name)
        {
        }

        IEnumerable<object> INamedIndividual.this[
            IObjectPropertyExpression objectPropertyExpression
            ] => _objectProperties
                .Where(objectPropertyAssertion => objectPropertyAssertion.ObjectPropertyExpression == objectPropertyAssertion)
                .Select(objectPropertyAssertion => objectPropertyAssertion.TargetIndividual);

        IEnumerable<object> INamedIndividual.this[
            IDataPropertyExpression dataPropertyExpression
            ] => _dataProperties
                .Where(dataPropertyAssertion => dataPropertyAssertion.DataPropertyExpression == dataPropertyExpression)
                .Select(dataPropertyAssertion => dataPropertyAssertion.TargetValue);

        IList<IObjectPropertyAssertion> INamedIndividual.ObjectProperties => _objectProperties;

        IList<IDataPropertyAssertion> INamedIndividual.DataProperties => _dataProperties;
    }

    public class ClassAssertion:
        Axiom,
        IClassAssertion
    {
        private IClassExpression _classExpression;
        private INamedIndividual _namedIndividual;

        public ClassAssertion(
            IClassExpression classExpression,
            INamedIndividual namedIndividual
            ) : base(namedIndividual.Ontology)
        {
            _classExpression = classExpression;
            _namedIndividual = namedIndividual;
        }

        IClassExpression IClassAssertion.ClassExpression => _classExpression;

        INamedIndividual IClassAssertion.NamedIndividual => _namedIndividual;
    }

    public abstract class PropertyAssertion:
        Axiom,
        IPropertyAssertion
    {
        protected IPropertyExpression _propertyExpression;
        protected INamedIndividual    _sourceIndividual;

        protected PropertyAssertion(
            IOntology           ontology,
            IPropertyExpression propertyExpression,
            INamedIndividual    sourceIndividual
            ) : base(ontology)
        {
            _propertyExpression = propertyExpression;
            _sourceIndividual   = sourceIndividual;
        }

        IPropertyExpression IPropertyAssertion.PropertyExpression => _propertyExpression;

        INamedIndividual IPropertyAssertion.SourceIndividual => _sourceIndividual;
    }

    public class ObjectPropertyAssertion:
        PropertyAssertion,
        IObjectPropertyAssertion
    {
        private IObjectPropertyExpression _objectPropertyExpression;
        private object                    _targetIndividual;

        public ObjectPropertyAssertion(
            IOntology                 ontology,
            IObjectPropertyExpression objectPropertyExpression,
            INamedIndividual          sourceIndividual,
            object                    targetIndividual
            ) : base(
                ontology,
                objectPropertyExpression,
                sourceIndividual)
        {
            _objectPropertyExpression = objectPropertyExpression;
            _targetIndividual         = targetIndividual;
            _sourceIndividual.ObjectProperties.Add(this);
        }

        IObjectPropertyExpression IObjectPropertyAssertion.ObjectPropertyExpression => _objectPropertyExpression;

        object IObjectPropertyAssertion.TargetIndividual => _targetIndividual;
    }

    public class DataPropertyAssertion:
        PropertyAssertion,
        IDataPropertyAssertion
    {
        private IDataPropertyExpression _dataPropertyExpression;
        private object                  _targetValue;

        public DataPropertyAssertion(
            IOntology               ontology,
            IDataPropertyExpression dataPropertyExpression,
            INamedIndividual        sourceIndividual,
            object                  target
            ) : base(
                ontology,
                dataPropertyExpression,
                sourceIndividual)
        {
            _dataPropertyExpression = dataPropertyExpression;
            _targetValue            = target;
            _sourceIndividual.DataProperties.Add(this);
        }

        IDataPropertyExpression IDataPropertyAssertion.DataPropertyExpression => _dataPropertyExpression;

        object IDataPropertyAssertion.TargetValue => _targetValue;
    }
}
