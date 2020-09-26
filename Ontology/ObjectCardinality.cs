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
            _classExpression = classExpression;
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

        public override void Accept(
            IClassExpressionVisitor visitor
            )
        {
            visitor.Enter(this);
            _classExpression?.Accept(visitor);
            visitor.Exit(this);
        }

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

        public override void Accept(
            IClassExpressionVisitor visitor
            )
        {
            visitor.Enter(this);
            _classExpression?.Accept(visitor);
            visitor.Exit(this);
        }

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

        public override void Accept(
            IClassExpressionVisitor visitor
            )
        {
            visitor.Enter(this);
            _classExpression?.Accept(visitor);
            visitor.Exit(this);
        }

        public override bool Evaluate(
            IClassMembershipEvaluator evaluator,
            object                    individual
            ) => evaluator.Evaluate(
                this,
                individual);
    }
}
