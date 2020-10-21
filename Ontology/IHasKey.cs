using System.Collections.Generic;

namespace Ontology
{
    public interface IHasKey: IAxiom
    {
        IClassExpression               ClassExpression         { get; }
        IList<IDataPropertyExpression> DataPropertyExpressions { get; }
    }
}
