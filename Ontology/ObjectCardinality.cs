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

        public override bool HasMember(
            object individual
            ) => _objectPropertyExpression
                .Values(individual)
                .Count(value => _classExpression == null || _classExpression.HasMember(value)) >= _cardinality;
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
            object individual
            ) => _objectPropertyExpression
                .Values(individual)
                .Count(value => _classExpression == null || _classExpression.HasMember(value)) <= _cardinality;
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
            object individual
            ) => _objectPropertyExpression
                .Values(individual)
                .Count(value => _classExpression == null || _classExpression.HasMember(value)) == _cardinality;
    }
}
