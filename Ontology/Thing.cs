using System.Collections.Generic;

namespace Ontology
{
    public class Thing: Class
    {
        internal Thing() : base(
            null,
            "Thing")
        {
        }

        public override bool HasMember(
            IOntology                                      context,
            IDictionary<object, HashSet<IClassExpression>> classifications,
            object                                         individual
            ) => true;
    }
}
