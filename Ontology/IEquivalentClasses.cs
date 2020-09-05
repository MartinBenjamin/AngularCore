using System.Collections.Generic;

namespace Ontology
{
    public interface IEquivalentClasses: IClassAxiom
    {
        IEnumerable<IClassExpression> ClassExpressions { get; }
    }
}
