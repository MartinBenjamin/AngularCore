using System.Collections.Generic;

namespace Ontology
{
    public interface IOntology
    {
        IClassExpression Thing   { get; }
        IClassExpression Nothing { get; }

        IDictionary<string, IClass> Classes { get; }

        bool AreEqual(
            object lhs,
            object rhs);
    }
}
