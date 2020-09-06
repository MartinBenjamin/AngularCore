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
            IDictionary<object, HashSet<IClassExpression>>
                   classifications,
            object individual
            ) => _individuals.Any(
                i => _ontology.AreEqual(
                    classifications,
                    individual,
                    i));
    }
}
