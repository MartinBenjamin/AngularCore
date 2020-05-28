using System;
using System.Collections.Generic;

namespace Ontology
{
    public class Nothing:
        Entity,
        IClass
    {
        internal Nothing(
            IOntology ontology
            ) : base(
                ontology,
                "Nothing")
        {
            ontology.Classes[_name] = this;
        }

        IList<IHasKey> IClassExpression.Keys => throw new NotImplementedException();

        bool IClassExpression.HasMember(
            object individual
            )
        {
            return false;
        }
    }
}
