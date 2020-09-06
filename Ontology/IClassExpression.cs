using System.Collections.Generic;

namespace Ontology
{
    public interface IClassExpression
    {
        IList<ISubClassOf>               SuperClasses     { get; }
        IList<IHasKey>                   Keys             { get; }
        IList<IObjectPropertyExpression> ObjectProperties { get; }
        IList<IDataPropertyExpression>   DataProperties   { get; }

        bool HasMember(
            IDictionary<object, HashSet<IClassExpression>>
                   classification,
            object individual);
    }
}
