using CommonDomainObjects;
using System.Collections.Generic;
using System.Linq;

namespace Ontology
{
    public class ObjectOneOf:
        ClassExpression,
        IObjectOneOf
    {
        private IOntology     _ontology;
        private IList<object> _individuals;

        public ObjectOneOf(
            IOntology       ontology,
            params object[] individuals
            )
        {
            _ontology    = ontology;
            _individuals = individuals;
        }

        IList<object> IObjectOneOf.Individuals => _individuals;

        public override bool HasMember(
            object individual
            )
        {
            // Equality only defined for instances of DomainObject.
            if(individual is DomainObject domainObject)
            {
                var hasKey = _ontology.Classes[domainObject.ClassName].Keys.FirstOrDefault();

                return
                    hasKey != null &&
                    _individuals
                        .OfType<DomainObject>()
                        .Any(i => i.ClassName == domainObject.ClassName && hasKey.AreEqual(domainObject, i));
            }

            return false;
        }
    }
}
