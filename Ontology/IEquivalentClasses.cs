using System.Collections.Generic;

namespace Ontology
{
    public interface IEquivalentClasses: IClassAxiom
    {
        IList<IClassExpression> ClassExpressions { get; }
    }
}
