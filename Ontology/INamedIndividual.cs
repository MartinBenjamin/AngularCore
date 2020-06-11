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

    public class ObjectHasValue1:
        ObjectPropertyRestriction,
        IObjectHasValue
    {
        private INamedIndividual _individual;

        public ObjectHasValue1(
            IObjectPropertyExpression objectPropertyExpression,
            INamedIndividual          individual
            ) : base(objectPropertyExpression)
        {
            _individual = individual;
        }

        object IObjectHasValue.Individual => _individual;

        public override bool HasMember(
            object individual
            )
        {
            var classExpressions = new HashSet<IClassExpression>();
            _individual
                .Classes
                .Select(classAssertion => classAssertion.ClassExpression)
                .ForEach(classExpression => classExpression.SuperClasses(classExpressions));

            var keyedClassExpressions = classExpressions
                .Where(classExpression => classExpression.Keys.Count > 0).ToList();

            return _objectPropertyExpression
                .Values(individual)
                .OfType<DomainObject>()
                .Any(domainObject => 
                    {
                        var commonKeyedClassExpressions = _objectPropertyExpression.Ontology.Classes[domainObject.ClassName].SuperClasses();
                        commonKeyedClassExpressions.IntersectWith(keyedClassExpressions);
                        return
                            commonKeyedClassExpressions.Count > 0 &&
                            commonKeyedClassExpressions.All(
                                ce => ce.Keys.All(hasKey => hasKey.Properties.All(dpe => dpe.Value(domainObject) == _individual[dpe].FirstOrDefault())));
                    });
        }
    }
}
