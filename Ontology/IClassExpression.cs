using System.Collections.Generic;

namespace Ontology
{
    public interface IClassExpression
    {
        IList<IHasKey> Keys { get; }

        bool HasMember(object individual);
    }
}
