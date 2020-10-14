using System.Collections.Generic;

namespace Ontology
{
    public class DisjointClasses:
        Axiom,
        IDisjointClasses
    {
        private readonly IList<IClassExpression> _classExpressions;

        public DisjointClasses(
            IOntology                 ontology,
            params IClassExpression[] classExpressions
            ) : base(ontology)
        {
            _classExpressions = classExpressions;
        }

        IList<IClassExpression> IDisjointClasses.ClassExpressions => _classExpressions;
    }
}
