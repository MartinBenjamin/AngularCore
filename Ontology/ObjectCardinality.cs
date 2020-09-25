using System.Collections.Generic;
using System.Linq;

namespace Ontology
{
    public abstract class ObjectCardinality:
        ObjectPropertyRestriction,
        IObjectCardinality
    {
        protected int              _cardinality;
        protected IClassExpression _classExpression;

        protected ObjectCardinality(
            IObjectPropertyExpression  objectPropertyExpression,
            int                        cardinality,
            IClassExpression           classExpression
            ) : base(objectPropertyExpression)
        {
            _cardinality     = cardinality;
            _classExpression = classExpression ?? _objectPropertyExpression.Ontology.Thing;
        }

        int IObjectCardinality.Cardinality => _cardinality;

        IClassExpression IObjectCardinality.ClassExpression => _classExpression;
    }

    public class ObjectMinCardinality:
        ObjectCardinality,
        IObjectMinCardinality
    {
        public ObjectMinCardinality(
            IObjectPropertyExpression objectPropertyExpression,
            int                       cardinality,
            IClassExpression          classExpression = null
            ) : base(
                objectPropertyExpression,
                cardinality,
                classExpression)
        {
        }

        public override bool HasMember(
            IOntology                                      context,
            IDictionary<object, HashSet<IClassExpression>> classifications,
            object                                         individual
            ) => _objectPropertyExpression.Values(
                context,
                individual).Count(
                    value => _classExpression.HasMember(
                        context,
                        classifications,
                        value)) >= _cardinality;

        public override bool Evaluate(
            IClassMembershipEvaluator evaluator,
            object                    individual
            ) => evaluator.Evaluate(
                this,
                individual);

    }

    public class ObjectMaxCardinality:
        ObjectCardinality,
        IObjectMaxCardinality
    {
        public ObjectMaxCardinality(
            IObjectPropertyExpression objectPropertyExpression,
            int                       cardinality,
            IClassExpression          classExpression = null
            ) : base(
                objectPropertyExpression,
                cardinality,
                classExpression)
        {
        }

        public override bool HasMember(
            IOntology                                      context,
            IDictionary<object, HashSet<IClassExpression>> classifications,
            object                                         individual
            ) => _objectPropertyExpression.Values(
                context,
                individual).Count(
                    value => _classExpression.HasMember(
                        context,
                        classifications,
                        value)) <= _cardinality;

        public override bool Evaluate(
            IClassMembershipEvaluator evaluator,
            object                    individual
            ) => evaluator.Evaluate(
                this,
                individual);
    }
    
    public class ObjectExactCardinality:
        ObjectCardinality,
        IObjectExactCardinality
    {
        public ObjectExactCardinality(
            IObjectPropertyExpression objectPropertyExpression,
            int                       cardinality,
            IClassExpression          classExpression = null
            ) : base(
                objectPropertyExpression,
                cardinality,
                classExpression)
        {
        }

        public override bool HasMember(
            IOntology                                      context,
            IDictionary<object, HashSet<IClassExpression>> classifications,
            object                                         individual
            ) => _objectPropertyExpression.Values(
                context,
                individual).Count(
                    value => _classExpression.HasMember(
                        context,
                        classifications,
                        value)) == _cardinality;

        public override bool Evaluate(
            IClassMembershipEvaluator evaluator,
            object                    individual
            ) => evaluator.Evaluate(
                this,
                individual);
    }
}
