using System.Linq;

namespace Ontology
{
    public class ObjectSomeValuesFrom:
        ObjectPropertyRestriction,
        IObjectSomeValuesFrom
    {
        private IClassExpression _classExpression;

        public ObjectSomeValuesFrom(
            IObjectPropertyExpression objectPropertyExpression,
            IClassExpression          classExpression
            ) : base(objectPropertyExpression)
        {
            _classExpression = classExpression;
        }

        IClassExpression IObjectSomeValuesFrom.ClassExpression => _classExpression;

        public override bool HasMember(
            object individual
            ) => _objectPropertyExpression.Values(individual).Any(_classExpression.HasMember);
    }
}
