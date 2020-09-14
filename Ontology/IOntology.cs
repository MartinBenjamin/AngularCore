using System.Collections.Generic;

namespace Ontology
{
    public interface IOntology
    {
        IClassExpression Thing    { get; }
        IClassExpression Nothing  { get; }
        IList<IOntology> Imported { get; }
        IList<IAxiom>    Axioms   { get; }

        IDatatype        DateTime { get; }

        bool AreEqual(
            IDictionary<object, HashSet<IClassExpression>>
                   classifications,
            object lhs,
            object rhs);

        HashSet<IClassExpression> ClassifyIndividual(
            IDictionary<object, HashSet<IClassExpression>>
                   classifications,
            object individual);
    }
}
