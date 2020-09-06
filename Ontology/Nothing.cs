using System.Collections.Generic;

namespace Ontology
{
    public class Nothing: Class
    {
        internal Nothing(
            IOntology ontology
            ) : base(
                ontology,
                "Nothing")
        {
        }

        public override bool HasMember(
            IDictionary<object, HashSet<IClassExpression>>
                   classification,
            object individual
            ) => false;
    }
}
