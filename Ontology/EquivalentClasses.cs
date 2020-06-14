using System.Collections.Generic;

namespace Ontology
{
    public class EquivalentClasses:
        Axiom,
        IEquivalentClasses
    {
        private IList<IClassExpression> _classExpressions;

        public EquivalentClasses(
            IOntology                 ontology,
            params IClassExpression[] classExpressions
            ) : base(ontology)
        {
            _classExpressions = classExpressions;
        }

        IList<IClassExpression> IEquivalentClasses.ClassExpressions => _classExpressions;
    }
}
