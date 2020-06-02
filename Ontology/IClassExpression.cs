using System.Collections.Generic;

namespace Ontology
{
    public interface IClassExpression
    {
        IList<ISubClassOf>               SuperClasses     { get; }
        IList<IHasKey>                   Keys             { get; }
        IList<IObjectPropertyExpression> ObjectProperties { get; }

        bool HasMember(object individual);
    }
}
