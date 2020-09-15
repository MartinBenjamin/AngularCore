using System.Collections.Generic;

namespace Ontology
{
    public interface IClassExpression
    {
        IList<ISubClassOf> SuperClasses { get; }

        bool HasMember(
            IOntology                                      context,
            IDictionary<object, HashSet<IClassExpression>> classifications,
            object                                         individual);
    }
}
