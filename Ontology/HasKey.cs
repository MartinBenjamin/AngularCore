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

        bool IHasKey.AreEqual(
            IOntology context,
            object    lhs,
            object    rhs
            ) => _dataPropertyExpressions.All(property => property.AreEqual(
                context,
                lhs,
                rhs));
    }
}
