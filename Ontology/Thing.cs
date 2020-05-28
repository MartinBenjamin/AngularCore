using System;
using System.Collections.Generic;

namespace Ontology
{
    public class Thing:
        Entity,
        IClass
    {
        internal Thing(
            IOntology ontology
            ) : base(
                ontology,
                "Thing")
        {
            ontology.Classes[_name] = this;
        }

        IList<IHasKey> IClassExpression.Keys => throw new NotImplementedException();

        bool IClassExpression.HasMember(
            object individual
            )
        {
            return true;
        }
    }
}
