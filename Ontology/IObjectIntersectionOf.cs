using System.Collections.Generic;

namespace Ontology
{
    public interface IObjectIntersectionOf: IClassExpression
    {
        IList<IClassExpression> ClassExpressions { get; }
    }
}
