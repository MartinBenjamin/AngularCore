using System.Collections.Generic;

namespace Ontology
{
    public class ObjectUnionOf: IObjectUnionOf
    {
        private IList<IClassExpression> _classExpressions { get; }

        public ObjectUnionOf(
            params IClassExpression[] classExpressions
            )
        {
            _classExpressions = classExpressions;
        }

        IList<IClassExpression> IObjectUnionOf.ClassExpressions => _classExpressions;

        bool IClassExpression.Evaluate(
            IClassMembershipEvaluator evaluator,
            object                    individual
            ) => evaluator.Evaluate(
                this,
                individual);
    }
}
