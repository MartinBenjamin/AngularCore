using System.Collections.Generic;

namespace Ontology
{
    public interface IObjectUnionOf: IClassExpression
    {
        IList<IClassExpression> ClassExpressions { get; }
    }
}
