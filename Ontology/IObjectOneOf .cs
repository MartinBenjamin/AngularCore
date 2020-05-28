using System.Collections.Generic;

namespace Ontology
{
    public interface IObjectOneOf: IClassExpression
    {
        IList<object> Individuals { get; }
    }
}
