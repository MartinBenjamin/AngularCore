using System.Collections.Generic;

namespace Ontology
{
    public class Thing: Class
    {
        internal Thing(
            IOntology ontology
            ) : base(
                ontology,
                "Thing")
        {
        }

        public override bool HasMember(
            IDictionary<object, HashSet<IClassExpression>>
                   classifications,
            object individual
            ) => true;
    }
}
