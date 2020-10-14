using System.Collections.Generic;

namespace Ontology
{
    interface IDisjointClasses: IClassAxiom
    {
        IList<IClassExpression> ClassExpressions { get; }
    }
}
