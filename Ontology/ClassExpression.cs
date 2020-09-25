using System.Collections.Generic;

namespace Ontology
{
    public abstract class ClassExpression: IClassExpression
    {
        protected ClassExpression() : base()
        {
        }

        public abstract bool HasMember(
            IOntology                                      context,
            IDictionary<object, HashSet<IClassExpression>> classifications,
            object                                         individual);

        public abstract bool Evaluate(
            IClassMembershipEvaluator evaluator,
            object                    individual
            );
    }
}
