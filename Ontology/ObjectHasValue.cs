using CommonDomainObjects;
using System.Linq;

namespace Ontology
{
    public class ObjectHasValue:
        ObjectPropertyRestriction,
        IObjectHasValue
    {
        private object _individual;

        public ObjectHasValue(
            IObjectPropertyExpression objectPropertyExpression,
            object                    individual
            ) : base(objectPropertyExpression)
        {
            _individual = individual;
        }

        object IObjectHasValue.Individual => _individual;

        public override bool HasMember(
            object individual
            )
        {
            // Equality only defined for instances of DomainObject.
            if(_individual is DomainObject domainObject)
            {
                var hasKey = _objectPropertyExpression.Ontology.Classes[domainObject.ClassName].Keys.FirstOrDefault();

                return
                    hasKey != null &&
                    _objectPropertyExpression
                        .Values(individual)
                        .OfType<DomainObject>()
                        .Any(value => value.ClassName == domainObject.ClassName && hasKey.AreEqual(domainObject, value));
            }

            return false;
        }
    }
}
