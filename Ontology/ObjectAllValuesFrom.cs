using System.Linq;

namespace Ontology
{
    class ObjectAllValuesFrom:
        ObjectPropertyRestriction,
        IObjectAllValuesFrom
    {
        private IClassExpression _classExpression;

        public ObjectAllValuesFrom(
            IObjectPropertyExpression objectPropertyExpression,
            IClassExpression          classExpression
            ) : base(objectPropertyExpression)
        {
            _classExpression = classExpression;
        }

        IClassExpression IObjectAllValuesFrom.ClassExpression => _classExpression;

        public override bool HasMember(
            object individual
            ) => _objectPropertyExpression.Values(individual).All(_classExpression.HasMember);
    }
}
