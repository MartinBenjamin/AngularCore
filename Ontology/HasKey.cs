using System.Collections.Generic;
using System.Linq;

namespace Ontology
{
    public class HasKey:
        Axiom,
        IHasKey
    {
        private readonly IClassExpression               _classExpression;
        private readonly IList<IDataPropertyExpression> _dataPropertyExpressions;

        public HasKey(
            IOntology                        ontology,
            IClassExpression                 classExpression,
            params IDataPropertyExpression[] dataPropertyExpressions
            ) : base(ontology)
        {
            _classExpression         = classExpression;
            _dataPropertyExpressions = dataPropertyExpressions;
        }

        IClassExpression IHasKey.ClassExpression => _classExpression;

        IList<IDataPropertyExpression> IHasKey.DataPropertyExpressions => _dataPropertyExpressions;
    }
}
