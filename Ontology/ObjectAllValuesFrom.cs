using System.Collections.Generic;
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
            IDictionary<object, HashSet<IClassExpression>>
                   classifications,
            object individual
            ) => _objectPropertyExpression.Values(individual).All(
                value => _classExpression.HasMember(
                    classifications,
                    value));
    }
}
