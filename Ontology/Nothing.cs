using System.Collections.Generic;

namespace Ontology
{
    public class Nothing: Class
    {
        internal Nothing() : base(
            null,
            "Nothing")
        {
        }

        public override bool HasMember(
            IOntology                                      context,
            IDictionary<object, HashSet<IClassExpression>> classifications,
            object                                         individual
            ) => false;
    }
}
