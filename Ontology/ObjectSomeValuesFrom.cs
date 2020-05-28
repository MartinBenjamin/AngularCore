using System.Linq;

namespace Ontology
{
    public class ObjectSomeValuesFrom:
        ClassExpression,
        IObjectSomeValuesFrom
    {
        private IObjectPropertyExpression _objectPropertyExpression;
        private IClassExpression          _classExpression;

        public ObjectSomeValuesFrom(
            IObjectPropertyExpression objectPropertyExpression,
            IClassExpression          classExpression
            )
        {
            _objectPropertyExpression = objectPropertyExpression;
            _classExpression          = classExpression;
        }

        IObjectPropertyExpression IObjectSomeValuesFrom.ObjectPropertyExpression => _objectPropertyExpression;

        IClassExpression IObjectSomeValuesFrom.ClassExpression => _classExpression;

        public override bool HasMember(
            object individual
            ) => _objectPropertyExpression.Values(individual).Any(_classExpression.HasMember);
    }
}
