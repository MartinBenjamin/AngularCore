using System.Collections.Generic;

namespace Ontology
{
    public interface IHasKey: IAxiom
    {
        IClassExpression               ClassExpression         { get; }
        IList<IDataPropertyExpression> DataPropertyExpressions { get; }

        bool AreEqual(
            IOntology context,
            object    lhs,
            object    rhs);
    }
}
