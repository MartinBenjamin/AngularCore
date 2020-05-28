using System.Collections.Generic;
using System.Linq;

namespace Ontology
{
    public class ObjectUnionOf:
        ClassExpression,
        IObjectUnionOf
    {
        private IList<IClassExpression> _classExpressions { get; }

        public ObjectUnionOf(
            params IClassExpression[] classExpressions
            )
        {
            _classExpressions = classExpressions;
        }

        IList<IClassExpression> IObjectUnionOf.ClassExpressions => _classExpressions;

        public override bool HasMember(
            object individual
            ) => _classExpressions.Any(classExpression => classExpression.HasMember(individual));
    }
}
