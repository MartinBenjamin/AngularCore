using System.Collections.Generic;

namespace Ontology
{
    interface IEquivalentClasses: IClassAxiom
    {
        IList<IClassExpression> ClassExpressions { get; }
    }
}
