using System.Linq;

namespace Ontology
{
    class ObjectAllValuesFrom:
        ClassExpression,
        IObjectAllValuesFrom
    {
        private IObjectPropertyExpression _objectPropertyExpression;
        private IClassExpression          _classExpression;

        public ObjectAllValuesFrom(
            IObjectPropertyExpression objectPropertyExpression,
            IClassExpression          classExpression
            )
        {
            _objectPropertyExpression  = objectPropertyExpression;
            _classExpression           = classExpression;
        }

        IObjectPropertyExpression IObjectAllValuesFrom.ObjectPropertyExpression => _objectPropertyExpression;

        IClassExpression IObjectAllValuesFrom.ClassExpression => _classExpression;

        public override bool HasMember(
            object individual
            ) => _objectPropertyExpression.Values(individual).All(_classExpression.HasMember);
    }
}
