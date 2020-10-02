using System.Collections.Generic;

namespace Ontology
{
    public interface IOntology
    {
        string           Iri     { get; }
        IList<IOntology> Imports { get; }
        IList<IAxiom>    Axioms  { get; }

        IDatatype        DateTime { get; }

        IEnumerable<IOntology>                 GetOntologies();
        IEnumerable<TAxiom>                    Get<TAxiom>() where TAxiom : IAxiom;
        IEnumerable<IObjectPropertyExpression> GetObjectPropertyExpressions(IClassExpression domain);
        IEnumerable<IDataPropertyExpression>   GetDataPropertyExpressions(IClassExpression domain);
        IEnumerable<IHasKey>                   GetHasKeys(IClassExpression classExpression);
        IEnumerable<ISubClassOf>               GetSuperClasses(IClassExpression classExpression);

        HashSet<IClassExpression>              SuperClasses(IClassExpression classExpression);
    }
}
