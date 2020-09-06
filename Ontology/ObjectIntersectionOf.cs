using System.Collections.Generic;
using System.Linq;

namespace Ontology
{
    public class ObjectIntersectionOf:
        ClassExpression,
        IObjectIntersectionOf
    {
        private IList<IClassExpression> _classExpressions { get; }

        public ObjectIntersectionOf(
            params IClassExpression[] classExpressions
            )
        {
            _classExpressions = classExpressions;
        }

        IList<IClassExpression> IObjectIntersectionOf.ClassExpressions => _classExpressions;

        public override bool HasMember(
            IDictionary<object, HashSet<IClassExpression>>
                   classifications,
            object individual
            ) => _classExpressions.All(classExpression => classExpression.HasMember(
                classifications,
                individual));
    }
}
