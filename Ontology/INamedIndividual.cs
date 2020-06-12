using CommonDomainObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Ontology
{
    public interface INamedIndividual: IEntity
    {
        IList<IObjectPropertyAssertion> ObjectProperties { get; }
        IList<IDataPropertyAssertion>   DataProperties   { get; }
        IList<IClassAssertion>          Classes          { get; }

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
        INamedIndividual          TargetIndividual         { get; }
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
        private IList<IClassAssertion>          _classes          = new List<IClassAssertion>();

        public NamedIndividual(
            IOntology ontology,
            string    name
            ) : base(
                ontology,
                name)
        {
        }

        public IEnumerable<object> this[
            IObjectPropertyExpression objectPropertyExpression
            ] => _objectProperties
                .Where(objectPropertyAssertion => objectPropertyAssertion.ObjectPropertyExpression == objectPropertyAssertion)
                .Select(objectPropertyAssertion => objectPropertyAssertion.TargetIndividual);

        public IEnumerable<object> this[
            IDataPropertyExpression dataPropertyExpression
            ] => _dataProperties
                .Where(dataPropertyAssertion => dataPropertyAssertion.DataPropertyExpression == dataPropertyExpression)
                .Select(dataPropertyAssertion => dataPropertyAssertion.TargetValue);

        IList<IObjectPropertyAssertion> INamedIndividual.ObjectProperties => _objectProperties;

        IList<IDataPropertyAssertion> INamedIndividual.DataProperties => _dataProperties;

        IList<IClassAssertion> INamedIndividual.Classes => _classes;

        public override bool Equals(
            object obj
            )
        {
            var domainObject = obj as DomainObject;

            if(domainObject == null)
                return false;

            var classExpressions = new HashSet<IClassExpression>();
            _classes
                .Select(classAssertion => classAssertion.ClassExpression)
                .ForEach(classExpression => classExpression.SuperClasses(classExpressions));

            var keyedClassExpressions = classExpressions
                .Where(classExpression => classExpression.Keys.Count > 0).ToList();

            var commonKeyedClassExpressions = _ontology.Classes[domainObject.ClassName].SuperClasses();
            commonKeyedClassExpressions.IntersectWith(keyedClassExpressions);
            return
                commonKeyedClassExpressions.Count > 0 &&
                commonKeyedClassExpressions.All(
                    ce => ce.Keys.All(hasKey => hasKey.AreEqual(domainObject, this)));
        }
    }

    public class ClassAssertion:
        Annotated,
        IClassAssertion
    {
        IClassExpression IClassAssertion.ClassExpression => throw new NotImplementedException();

        INamedIndividual IClassAssertion.NamedIndividual => throw new NotImplementedException();
    }

    public class PropertyAssertion:
        Annotated,
        IPropertyAssertion
    {
        IPropertyExpression IPropertyAssertion.PropertyExpression => throw new NotImplementedException();

        INamedIndividual IPropertyAssertion.SourceIndividual => throw new NotImplementedException();
    }

    public class ObjectPropertyAssertion:
        PropertyAssertion,
        IObjectPropertyAssertion
    {
        IObjectPropertyExpression IObjectPropertyAssertion.ObjectPropertyExpression => throw new NotImplementedException();

        INamedIndividual IObjectPropertyAssertion.TargetIndividual => throw new NotImplementedException();
    }

    public class DataPropertyAssertion:
        PropertyAssertion,
        IDataPropertyAssertion
    {
        IDataPropertyExpression IDataPropertyAssertion.DataPropertyExpression => throw new NotImplementedException();

        object IDataPropertyAssertion.TargetValue => throw new NotImplementedException();
    }
}
