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
            var hasKey = _ontology.Classes[individual.GetType().FullName].Keys.FirstOrDefault();
            return 
                hasKey != null &&
                _individuals.Any(i => individual.GetType() == i.GetType() && hasKey.AreEqual(individual, i));
        }
    }
}
