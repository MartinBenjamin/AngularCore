using System.Collections.Generic;
using System.Linq;

namespace Ontology
{
    public class ObjectOneOf:
        ClassExpression,
        IObjectOneOf
    {
        private IList<object> _individuals;

        public ObjectOneOf(
            params object[] individuals
            )
        {
            _individuals = individuals;
        }

        IList<object> IObjectOneOf.Individuals => _individuals;

        public override bool HasMember(
            IOntology                                      context,
            IDictionary<object, HashSet<IClassExpression>> classifications,
            object                                         individual
            ) => _individuals.Any(
                i => context.AreEqual(
                    classifications,
                    individual,
                    i));
    }
}
