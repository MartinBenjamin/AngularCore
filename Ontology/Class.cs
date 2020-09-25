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
                
        bool IClassExpression.Evaluate(
            IClassMembershipEvaluator evaluator,
            object                    individual
            ) => evaluator.Evaluate(
                this,
                individual);
    }
}
