using System.Collections.Generic;

namespace Ontology
{
    public interface IOntology
    {
        IClassExpression Thing   { get; }
        IClassExpression Nothing { get; }
        IList<IOntology> Imports { get; }
        IList<IAxiom>    Axioms  { get; }

        IDatatype        DateTime { get; }

        IEnumerable<IOntology>                 GetOntologies();
        IEnumerable<IAxiom>                    GetAxioms();
        IEnumerable<IClass>                    GetClasses();
        IEnumerable<IObjectPropertyExpression> GetObjectPropertyExpressions(IClassExpression domain);
        IEnumerable<IDataPropertyExpression>   GetDataPropertyExpressions(IClassExpression domain);
        IEnumerable<IHasKey>                   GetHasKeys(IClassExpression classExpression);

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
