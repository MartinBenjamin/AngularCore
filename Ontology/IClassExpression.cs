using System.Collections.Generic;

namespace Ontology
{
    public interface IClassExpression
    {
        bool Evaluate(
            IClassMembershipEvaluator evaluator,
            object                    individual);

        bool HasMember(
            IOntology                                      context,
            IDictionary<object, HashSet<IClassExpression>> classifications,
            object                                         individual);
    }
}
