using CommonDomainObjects;
using System.Collections.Generic;

namespace Ontology
{
    public class ObjectIntersectionOf: IObjectIntersectionOf
    {
        private IList<IClassExpression> _classExpressions { get; }

        public ObjectIntersectionOf(
            params IClassExpression[] classExpressions
            )
        {
            _classExpressions = classExpressions;
        }

        IList<IClassExpression> IObjectIntersectionOf.ClassExpressions => _classExpressions;

        void IClassExpression.Accept(
            IClassExpressionVisitor visitor
            )
        {
            visitor.Enter(this);
            _classExpressions.ForEach(classExpression => classExpression.Accept(visitor));
            visitor.Exit(this);
        }

        bool IClassExpression.Evaluate(
            IClassMembershipEvaluator evaluator,
            object                    individual
            ) => evaluator.Evaluate(
                this,
                individual);
    }
}
