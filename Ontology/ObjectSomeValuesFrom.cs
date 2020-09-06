using System.Collections.Generic;
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
            IDictionary<object, HashSet<IClassExpression>>
                   classifications,
            object individual
            ) => _objectPropertyExpression.Values(individual).Any(
                value => _classExpression.HasMember(
                    classifications,
                    value));
    }
}
