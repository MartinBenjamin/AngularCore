using System.Collections.Generic;

namespace Ontology
{
    public interface IHasKey
    {
        IClassExpression                         ClassExpression { get; }
        IList<IFunctionalDataPropertyExpression> Properties      { get; }

        bool AreEqual(
            object lhs,
            object rhs);
    }
}
