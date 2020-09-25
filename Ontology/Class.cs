using System.Collections.Generic;

namespace Ontology
{
    public class Class:
        Entity,
        IClass
    {
        public Class(
            IOntology ontology,
            string    name
            ) : base(
                ontology,
                name)
        {
        }

        public virtual bool HasMember(
            IOntology                                      context,
            IDictionary<object, HashSet<IClassExpression>> classifications,
            object                                         individual
            ) => context.ClassifyIndividual(
                classifications,
                individual).Contains(this);
                
        bool IClassExpression.Evaluate(
            IClassMembershipEvaluator evaluator,
            object                    individual
            ) => evaluator.Evaluate(
                this,
                individual);
    }
}
