using System.Collections.Generic;

namespace Ontology
{
    public interface IOntology
    {
        string           Iri     { get; }
        IList<IOntology> Imports { get; }
        IList<IAxiom>    Axioms  { get; }

        IDatatype        DateTime { get; }

        IEnumerable<IOntology>   GetOntologies();
        IEnumerable<TAxiom>      Get<TAxiom>() where TAxiom : IAxiom;
        IEnumerable<IHasKey>     GetHasKeys(IClassExpression classExpression);
        IEnumerable<ISubClassOf> GetSuperClasses(IClassExpression classExpression);

        HashSet<IClassExpression>              SuperClasses(IClassExpression classExpression);
    }
}
