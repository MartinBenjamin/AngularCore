using System.Collections.Generic;

namespace Ontology
{
    public class ObjectOneOf: IObjectOneOf
    {
        private readonly IList<object> _individuals;

        public ObjectOneOf(
            params object[] individuals
            )
        {
            _individuals = individuals;
        }

        IList<object> IObjectOneOf.Individuals => _individuals;

        void IClassExpression.Accept(
            IClassExpressionVisitor visitor
            ) => visitor.Visit(this);

        bool IClassExpression.Evaluate(
            IClassMembershipEvaluator evaluator,
            object                    individual
            ) => evaluator.Evaluate(
                this,
                individual);
    }
}
